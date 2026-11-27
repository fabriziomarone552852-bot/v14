#!/usr/bin/env python3
"""
Vita - Script di Upload Automatico APK su Google Drive
- Carica la nuova versione con il numero nel nome (es. vita-v15.4.0.apk)
- Sposta le versioni precedenti nella sottocartella 'old versions'
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Assicura output in tempo reale anche se reindirizzato
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(line_buffering=True)

# Cartella Google Drive di default di Vita
DEFAULT_FOLDER_ID = "1UrahhXpwuU4xPXjF1aT83LflnhIeEkPz"
SCOPES = ["https://www.googleapis.com/auth/drive"]

EXIT_OK = 0
EXIT_ERROR = 1
EXIT_MISSING_DEPS = 2
EXIT_MISSING_CREDENTIALS = 3


def find_file(filename: str, search_dirs: list[Path]) -> Path | None:
    for directory in search_dirs:
        candidate = directory / filename
        if candidate.exists():
            return candidate
    return None


def _escape_drive_query_literal(value: str) -> str:
    return value.replace("\\", "\\\\").replace("'", "\\'")


def get_drive_service(base_dir: Path) -> tuple[object | None, int]:
    try:
        from google.auth.exceptions import RefreshError, TransportError
        from google.auth.transport.requests import Request
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from googleapiclient.discovery import build
    except ImportError:
        print("[AVVISO] Moduli Google Drive non installati.")
        print("         Esegui: pip install -r scripts/requirements-drive.txt")
        return None, EXIT_MISSING_DEPS

    search_dirs = [base_dir / "scripts", base_dir]
    token_path = find_file("token.json", search_dirs) or (base_dir / "scripts" / "token.json")
    credentials_path = find_file("credentials.json", search_dirs)

    creds = None
    if token_path.exists():
        try:
            creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)
        except Exception as exc:
            print(f"[AVVISO] Token esistente non leggibile ({exc}), procedo con nuova autenticazione...")
            creds = None

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                token_path.parent.mkdir(parents=True, exist_ok=True)
                token_path.write_text(creds.to_json(), encoding="utf-8")
            except RefreshError as exc:
                print(f"[AVVISO] Token OAuth scaduto o revocato ({exc}). Serve nuova autorizzazione.")
                creds = None
            except (TransportError, OSError) as exc:
                print(f"[ERRORE] Errore di rete durante il rinnovo del token Google Drive: {exc}")
                return None, EXIT_ERROR
            except Exception as exc:
                print(f"[AVVISO] Impossibile rinnovare il token ({exc}). Serve nuova autorizzazione.")
                creds = None

        if not creds:
            if not credentials_path or not credentials_path.exists():
                print("==========================================================================")
                print("  [INFO] CONFIGURAZIONE GOOGLE DRIVE RICHIESTA")
                print("==========================================================================")
                print("  Il file 'credentials.json' non e' stato trovato!")
                print("  Posizionalo in:")
                print(f"    - {base_dir / 'scripts' / 'credentials.json'}")
                print("    oppure nella cartella radice del progetto.")
                print("  Per la guida passo-passo consulta: docs/GOOGLE_DRIVE_SETUP.md")
                print("==========================================================================")
                return None, EXIT_MISSING_CREDENTIALS

            print("\n[GOOGLE DRIVE] Avvio del server di autenticazione locale...", flush=True)
            flow = InstalledAppFlow.from_client_secrets_file(str(credentials_path), SCOPES)
            creds = flow.run_local_server(
                port=0,
                prompt="consent",
                authorization_prompt_message=(
                    "\n==========================================================================\n"
                    "  [AUTORIZZAZIONE GOOGLE DRIVE RICHIESTA]\n"
                    "  Se il browser non si apre da solo, copia e apri questo link nel browser:\n\n"
                    "  {url}\n\n"
                    "==========================================================================\n"
                ),
            )

            token_path.parent.mkdir(parents=True, exist_ok=True)
            token_path.write_text(creds.to_json(), encoding="utf-8")
            print(f"[OK] Token salvato con successo in: {token_path}", flush=True)

    return build("drive", "v3", credentials=creds), EXIT_OK


def list_drive_files(service: object, query: str, fields: str) -> list[dict[str, object]]:
    items: list[dict[str, object]] = []
    page_token: str | None = None
    files_resource = getattr(service, "files")()

    while True:
        res = files_resource.list(
            q=query,
            spaces="drive",
            pageSize=100,
            pageToken=page_token,
            fields=fields,
            supportsAllDrives=True,
            includeItemsFromAllDrives=True,
        ).execute()
        items.extend(res.get("files", []))
        page_token = res.get("nextPageToken")
        if not page_token:
            break

    return items


def get_or_create_subfolder(
    service: object,
    parent_id: str,
    folder_name: str = "old versions",
    create_if_missing: bool = True,
) -> str | None:
    """Trova o crea una cartella di destinazione per le vecchie versioni."""
    escaped_name = _escape_drive_query_literal(folder_name)
    query = (
        f"'{parent_id}' in parents and "
        f"name = '{escaped_name}' and "
        f"mimeType = 'application/vnd.google-apps.folder' and "
        f"trashed = false"
    )
    files = list_drive_files(service, query, "nextPageToken, files(id, name)")
    if files:
        return str(files[0]["id"])

    if not create_if_missing:
        return None

    print(f"[ARCHIVIO] Creazione cartella '{folder_name}' in corso...")
    meta = {
        "name": folder_name,
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [parent_id],
    }
    files_resource = getattr(service, "files")()
    folder = files_resource.create(
        body=meta,
        fields="id",
        supportsAllDrives=True,
    ).execute()
    return str(folder["id"])


def archive_old_versions(
    service: object,
    parent_id: str,
    current_filename: str,
    archive_name: str = "old versions",
    dry_run: bool = False,
) -> tuple[int, list[str]]:
    """
    Sposta tutti i file presenti nella radice (tranne il nuovo corrente)
    nella cartella 'old versions'.
    """
    query = (
        f"'{parent_id}' in parents and "
        f"mimeType != 'application/vnd.google-apps.folder' and "
        f"trashed = false"
    )
    files = list_drive_files(service, query, "nextPageToken, files(id, name, parents)")
    old_files = [item for item in files if str(item.get("name", "")) != current_filename]

    if not old_files:
        print(f"[ARCHIVIO] Nessuna versione precedente da spostare in '{archive_name}/'.")
        return 0, []

    archive_id = get_or_create_subfolder(
        service,
        parent_id,
        archive_name,
        create_if_missing=not dry_run,
    )

    if dry_run:
        target_label = f"{archive_name}/ (ID: {archive_id})" if archive_id else f"{archive_name}/ (da creare)"
        for item in old_files:
            print(f"[DRY-RUN][ARCHIVIO] Verrebbe spostato '{item.get('name', '')}' -> '{target_label}'")
        return len(old_files), []

    files_resource = getattr(service, "files")()
    moved_count = 0
    failed_names: list[str] = []

    for item in old_files:
        fname = str(item.get("name", ""))
        fid = str(item.get("id", ""))
        raw_parents = item.get("parents")
        parents = [str(p) for p in raw_parents] if isinstance(raw_parents, list) and raw_parents else [parent_id]
        remove_parents = parent_id if parent_id in parents else ",".join(parents)

        print(f"[ARCHIVIO] Spostamento vecchia versione: '{fname}' -> '{archive_name}/'")
        try:
            files_resource.update(
                fileId=fid,
                addParents=archive_id,
                removeParents=remove_parents,
                fields="id, parents",
                supportsAllDrives=True,
            ).execute()
            moved_count += 1
        except Exception as exc:
            print(f"  [ERRORE] Impossibile archiviare '{fname}': {exc}")
            failed_names.append(fname)

    return moved_count, failed_names


def upload_or_update_file(
    service: object,
    folder_id: str,
    local_path: Path,
    dry_run: bool = False,
) -> dict[str, object] | None:
    from googleapiclient.http import MediaFileUpload

    file_name = local_path.name
    escaped_name = _escape_drive_query_literal(file_name)
    print(f"\n[UPLOAD] Preparazione caricamento: {file_name} -> Cartella Drive ({folder_id})")

    query = f"'{folder_id}' in parents and name = '{escaped_name}' and trashed = false"
    files = list_drive_files(service, query, "nextPageToken, files(id, name, webViewLink)")

    if dry_run:
        if files:
            print(f"[DRY-RUN][UPLOAD] Aggiornerebbe file esistente '{file_name}' (ID: {files[0]['id']}).")
        else:
            print(f"[DRY-RUN][UPLOAD] Creerebbe nuovo file '{file_name}' nella cartella Drive.")
        return {"dry_run": True, "name": file_name}

    media = MediaFileUpload(
        str(local_path),
        mimetype="application/vnd.android.package-archive",
        chunksize=1024 * 1024 * 2,  # 2MB chunks per feedback fluido
        resumable=True,
    )

    files_resource = getattr(service, "files")()
    if files:
        existing_file = files[0]
        file_id = str(existing_file["id"])
        print(f"  -> File '{file_name}' gia' presente su Drive (ID: {file_id}). Aggiornamento in corso...")
        request = files_resource.update(
            fileId=file_id,
            media_body=media,
            fields="id, name, webViewLink",
            supportsAllDrives=True,
        )
    else:
        print(f"  -> Creazione nuovo file '{file_name}' su Drive...")
        file_metadata = {
            "name": file_name,
            "parents": [folder_id],
        }
        request = files_resource.create(
            body=file_metadata,
            media_body=media,
            fields="id, name, webViewLink",
            supportsAllDrives=True,
        )

    res = None
    while res is None:
        status, res = request.next_chunk()
        if status:
            progress = int(status.progress() * 100)
            sys.stdout.write(f"\r  Upload in corso: {progress}%")
            sys.stdout.flush()

    sys.stdout.write("\r  [OK] Upload completato al 100%!        \n")
    sys.stdout.flush()
    print(f"  Link Drive: {res.get('webViewLink')}")
    return res


def main() -> None:
    parser = argparse.ArgumentParser(description="Upload APK Vita su Google Drive")
    parser.add_argument("--file", "-f", required=True, help="Percorso del file APK da caricare")
    parser.add_argument("--folder_id", default=DEFAULT_FOLDER_ID, help="ID della cartella Google Drive")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Verifica autenticazione, cartella e file da archiviare senza modificare Google Drive",
    )
    args = parser.parse_args()

    local_apk = Path(args.file).resolve()
    if not local_apk.exists():
        print(f"[ERRORE] Il file APK specificato non esiste: {local_apk}")
        sys.exit(EXIT_ERROR)

    project_root = Path(__file__).resolve().parent.parent
    service, status_code = get_drive_service(project_root)
    if not service:
        print("[ERRORE] Upload su Google Drive non eseguito.")
        sys.exit(status_code)

    try:
        # 1. Carica la nuova versione (cosi' in caso di errore di rete la precedente resta in radice)
        upload_or_update_file(service, args.folder_id, local_apk, dry_run=args.dry_run)

        # 2. Sposta tutte le versioni precedenti nella cartella 'old versions'
        moved_count, failed_archive = archive_old_versions(
            service,
            args.folder_id,
            local_apk.name,
            archive_name="old versions",
            dry_run=args.dry_run,
        )
        if failed_archive:
            print(f"[ERRORE] Impossibile spostare in 'old versions/' i file: {', '.join(failed_archive)}")
            sys.exit(EXIT_ERROR)

        if args.dry_run:
            print("\n===========================================================")
            print(f"  [DRY-RUN OK] Pronto per caricare {local_apk.name} e archiviare {moved_count} file.")
            print("===========================================================\n")
        else:
            print("\n===========================================================")
            print(f"  [SUCCESSO] {local_apk.name} disponibile su Google Drive! ({moved_count} vecchie versioni archiviate)")
            print("===========================================================\n")
    except Exception as exc:
        print(f"\n[ERRORE durante l'operazione su Drive]: {exc}")
        sys.exit(EXIT_ERROR)


if __name__ == "__main__":
    main()
