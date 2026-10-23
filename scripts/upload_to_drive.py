#!/usr/bin/env python3
"""
Vita - Script di Upload Automatico APK su Google Drive
- Sposta le versioni precedenti nella sottocartella 'old versions'
- Carica la nuova versione con il numero nel nome (es. vita-v15.1.4.apk)
"""

import os
import sys
import argparse
from pathlib import Path

# Assicura output in tempo reale anche se reindirizzato
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(line_buffering=True)

# Cartella Google Drive di default di Vita
DEFAULT_FOLDER_ID = "1UrahhXpwuU4xPXjF1aT83LflnhIeEkPz"
SCOPES = ["https://www.googleapis.com/auth/drive"]

def find_file(filename: str, search_dirs: list[Path]) -> Path | None:
    for d in search_dirs:
        p = d / filename
        if p.exists():
            return p
    return None

def get_drive_service(base_dir: Path):
    try:
        from google.auth.transport.requests import Request
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from googleapiclient.discovery import build
    except ImportError:
        print("[AVVISO] Moduli Google Drive non installati.")
        print("          Esegui: pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib")
        return None

    search_dirs = [
        base_dir / "scripts",
        base_dir,
    ]

    token_path = find_file("token.json", search_dirs) or (base_dir / "scripts" / "token.json")
    credentials_path = find_file("credentials.json", search_dirs)

    creds = None
    if token_path.exists():
        try:
            creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)
        except Exception as e:
            print(f"[AVVISO] Token esistente non valido ({e}), procedo con nuova autenticazione...")
            creds = None

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                with open(token_path, "w", encoding="utf-8") as token_file:
                    token_file.write(creds.to_json())
            except Exception as e:
                print(f"[AVVISO] Impossibile rinnovare il token ({e}). Serve nuova autorizzazione.")
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
                return None

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
                )
            )

            # Salva il token per i successivi utilizzi automatici
            with open(token_path, "w", encoding="utf-8") as token_file:
                token_file.write(creds.to_json())
            print(f"[OK] Token salvato con successo in: {token_path}", flush=True)

    return build("drive", "v3", credentials=creds)

def get_or_create_subfolder(service, parent_id: str, folder_name: str = "old versions") -> str:
    """Trova o crea una cartella di destinazione per le vecchie versioni."""
    query = (
        f"'{parent_id}' in parents and "
        f"name = '{folder_name}' and "
        f"mimeType = 'application/vnd.google-apps.folder' and "
        f"trashed = false"
    )
    res = service.files().list(
        q=query,
        spaces="drive",
        fields="files(id, name)",
        supportsAllDrives=True,
        includeItemsFromAllDrives=True
    ).execute()
    files = res.get("files", [])
    if files:
        return files[0]["id"]

    print(f"[ARCHIVIO] Creazione cartella '{folder_name}' in corso...")
    meta = {
        "name": folder_name,
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [parent_id]
    }
    folder = service.files().create(
        body=meta,
        fields="id",
        supportsAllDrives=True
    ).execute()
    return folder["id"]

def archive_old_versions(service, parent_id: str, current_filename: str, archive_name: str = "old versions") -> int:
    """
    Sposta tutti i file presenti nella radice (tranne il nuovo corrente)
    nella cartella 'old versions'.
    """
    archive_id = get_or_create_subfolder(service, parent_id, archive_name)

    query = (
        f"'{parent_id}' in parents and "
        f"mimeType != 'application/vnd.google-apps.folder' and "
        f"trashed = false"
    )
    res = service.files().list(
        q=query,
        spaces="drive",
        fields="files(id, name)",
        supportsAllDrives=True,
        includeItemsFromAllDrives=True
    ).execute()
    files = res.get("files", [])

    moved_count = 0
    for f in files:
        fname = f.get("name", "")
        fid = f.get("id")
        if fname != current_filename:
            print(f"[ARCHIVIO] Spostamento vecchia versione: '{fname}' -> '{archive_name}/'")
            try:
                service.files().update(
                    fileId=fid,
                    addParents=archive_id,
                    removeParents=parent_id,
                    fields="id, parents",
                    supportsAllDrives=True
                ).execute()
                moved_count += 1
            except Exception as e:
                print(f"  [AVVISO] Impossibile archiviare '{fname}': {e}")

    return moved_count

def upload_or_update_file(service, folder_id: str, local_path: Path) -> dict | None:
    from googleapiclient.http import MediaFileUpload

    file_name = local_path.name
    print(f"\n[UPLOAD] Preparazione caricamento: {file_name} -> Cartella Drive ({folder_id})")

    # Controlla se il file con lo stesso nome esiste già nella cartella
    query = f"'{folder_id}' in parents and name = '{file_name}' and trashed = false"
    response = service.files().list(
        q=query,
        spaces="drive",
        fields="files(id, name, webViewLink)",
        supportsAllDrives=True,
        includeItemsFromAllDrives=True
    ).execute()
    files = response.get("files", [])

    media = MediaFileUpload(
        str(local_path),
        mimetype="application/vnd.android.package-archive",
        chunksize=1024 * 1024 * 2,  # 2MB chunks per feedback fluido
        resumable=True
    )

    if files:
        existing_file = files[0]
        file_id = existing_file["id"]
        print(f"  -> File '{file_name}' gia' presente su Drive (ID: {file_id}). Aggiornamento in corso...")
        request = service.files().update(
            fileId=file_id,
            media_body=media,
            fields="id, name, webViewLink",
            supportsAllDrives=True
        )
    else:
        print(f"  -> Creazione nuovo file '{file_name}' su Drive...")
        file_metadata = {
            "name": file_name,
            "parents": [folder_id]
        }
        request = service.files().create(
            body=file_metadata,
            media_body=media,
            fields="id, name, webViewLink",
            supportsAllDrives=True
        )

    # Ciclo di upload progressivo
    res = None
    while res is None:
        status, res = request.next_chunk()
        if status:
            progress = int(status.progress() * 100)
            sys.stdout.write(f"\r  Upload in corso: {progress}%")
            sys.stdout.flush()

    sys.stdout.write(f"\r  [OK] Upload completato al 100%!        \n")
    sys.stdout.flush()
    print(f"  Link Drive: {res.get('webViewLink')}")
    return res

def main():
    parser = argparse.ArgumentParser(description="Upload APK Vita su Google Drive")
    parser.add_argument("--file", "-f", required=True, help="Percorso del file APK da caricare")
    parser.add_argument("--folder_id", default=DEFAULT_FOLDER_ID, help="ID della cartella Google Drive")
    args = parser.parse_args()

    local_apk = Path(args.file).resolve()
    if not local_apk.exists():
        print(f"[ERRORE] Il file APK specificato non esiste: {local_apk}")
        sys.exit(1)

    project_root = Path(__file__).resolve().parent.parent
    service = get_drive_service(project_root)
    if not service:
        print("[INFO] Upload su Google Drive saltato (configurazione assente o moduli mancanti).")
        sys.exit(0)

    try:
        # 1. Sposta le versioni precedenti nella cartella 'old versions'
        archive_old_versions(service, args.folder_id, local_apk.name, archive_name="old versions")

        # 2. Carica la nuova versione con il numero nel nome (es: vita-v15.1.4.apk)
        upload_or_update_file(service, args.folder_id, local_apk)

        print("\n===========================================================")
        print(f"  [SUCCESSO] {local_apk.name} disponibile su Google Drive!")
        print("===========================================================\n")
    except Exception as e:
        print(f"\n[ERRORE durante l'operazione su Drive]: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
