"""
Google Calendar domain service.
Handles OAuth2 token exchange, token refresh, and Google Calendar v3 synchronization.
Uses Python standard library (urllib.request) for zero external dependencies.
"""
from __future__ import annotations

import json
import logging
import os
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Optional
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
import urllib.request

from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.settings import get_settings
from backend.domains.events.models import Event
from backend.domains.google_calendar import repository as repo
from backend.domains.google_calendar.models import UserGoogleAuth
from backend.domains.users.models import User

logger = logging.getLogger(__name__)

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3"

SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/userinfo.email",
]


def _http_request(
    url: str,
    method: str = "GET",
    data: Optional[dict[str, Any] | bytes] = None,
    headers: Optional[dict[str, str]] = None,
    is_json: bool = False,
    timeout: float = 15.0,
) -> tuple[int, Any]:
    """Helper standard library per chiamate HTTP verso Google API."""
    req_headers = headers.copy() if headers else {}
    body_bytes: Optional[bytes] = None

    if data is not None:
        if isinstance(data, bytes):
            body_bytes = data
        elif is_json:
            body_bytes = json.dumps(data).encode("utf-8")
            req_headers["Content-Type"] = "application/json"
        else:
            body_bytes = urlencode(data).encode("utf-8")
            req_headers["Content-Type"] = "application/x-www-form-urlencoded"

    req = urllib.request.Request(
        url=url,
        data=body_bytes,
        headers=req_headers,
        method=method,
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            status_code = response.status
            raw_body = response.read().decode("utf-8")
            try:
                parsed_json = json.loads(raw_body) if raw_body else {}
                return status_code, parsed_json
            except Exception:
                return status_code, raw_body
    except HTTPError as err:
        status_code = err.code
        err_body = err.read().decode("utf-8", errors="replace")
        try:
            parsed_err = json.loads(err_body)
            return status_code, parsed_err
        except Exception:
            return status_code, err_body
    except URLError as err:
        logger.error("Errore di rete verso %s: %s", url, err)
        return 0, str(err)
    except Exception as exc:
        logger.exception("Eccezione durante chiamata HTTP verso %s: %s", url, exc)
        return 0, str(exc)


def _get_client_credentials() -> tuple[str, str, str]:
    """Recupera client_id, client_secret e redirect_uri dalle impostazioni o dall'ambiente."""
    settings = get_settings()
    client_id = settings.google_client_id or os.environ.get("GOOGLE_CLIENT_ID")
    client_secret = (
        settings.google_client_secret.get_secret_value()
        if settings.google_client_secret
        else os.environ.get("GOOGLE_CLIENT_SECRET")
    )
    redirect_uri = settings.google_redirect_uri or os.environ.get(
        "GOOGLE_REDIRECT_URI", "http://localhost:8000/api/v1/google-calendar/callback"
    )

    # Fallback diretto dal file .env se non ancora caricato in memoria dal reload
    if not client_id or not client_secret:
        backend_dir = Path(__file__).resolve().parent.parent.parent
        for env_filename in (".env.dev", ".env.prod", ".env.test", ".env"):
            env_file = backend_dir / env_filename
            if env_file.is_file():
                with open(env_file, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith("GOOGLE_CLIENT_ID=") and not client_id:
                            client_id = line.split("=", 1)[1].strip().strip("\"'")
                        elif line.startswith("GOOGLE_CLIENT_SECRET=") and not client_secret:
                            client_secret = line.split("=", 1)[1].strip().strip("\"'")
                        elif line.startswith("GOOGLE_REDIRECT_URI=") and not redirect_uri:
                            redirect_uri = line.split("=", 1)[1].strip().strip("\"'")

    if not client_id or not client_secret:
        raise ValueError(
            "Credenziali Google OAuth mancanti. Configura GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET nel file .env."
        )

    return client_id, client_secret, redirect_uri


def generate_auth_url(user_id: int) -> str:
    """Genera l'URL di autorizzazione OAuth 2.0 con stato JWT cifrato."""
    client_id, _, redirect_uri = _get_client_credentials()
    settings = get_settings()

    # Creazione stato cifrato per verificare l'utente al ritorno
    state_payload = {
        "user_id": user_id,
        "purpose": "google_calendar_oauth",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
    }
    state = jwt.encode(
        state_payload,
        settings.secret_key.get_secret_value(),
        algorithm=settings.algorithm,
    )

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    }
    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"


def verify_oauth_state(state: str) -> int:
    """Verifica e decodifica il parametro state, restituendo lo user_id."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            state,
            settings.secret_key.get_secret_value(),
            algorithms=[settings.algorithm],
        )
        if payload.get("purpose") != "google_calendar_oauth":
            raise ValueError("Stato OAuth non valido.")
        user_id = payload.get("user_id")
        if not user_id:
            raise ValueError("User ID assente nello stato.")
        return int(user_id)
    except JWTError as exc:
        raise ValueError(f"Stato OAuth non valido o scaduto: {exc}") from exc


def handle_oauth_callback(db: Session, code: str, state: str) -> dict[str, Any]:
    """Scambia l'authorization code con access & refresh token e salva i dati."""
    user_id = verify_oauth_state(state)
    client_id, client_secret, redirect_uri = _get_client_credentials()

    # 1. Scambio del code
    status_code, token_data = _http_request(
        GOOGLE_TOKEN_URL,
        method="POST",
        data={
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        },
        is_json=False,
    )
    if status_code != 200 or not isinstance(token_data, dict):
        logger.error("Errore scambio token Google (%s): %s", status_code, token_data)
        raise ValueError("Impossibile scambiare il codice di autorizzazione con Google.")

    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    expires_in = token_data.get("expires_in", 3600)

    token_expiry = datetime.now(timezone.utc) + timedelta(seconds=expires_in - 60)

    # 2. Recupero info utente (email Google)
    status_code, userinfo = _http_request(
        GOOGLE_USERINFO_URL,
        method="GET",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    google_email = None
    if status_code == 200 and isinstance(userinfo, dict):
        google_email = userinfo.get("email")

    # 3. Salvataggio nel database
    auth_record = repo.save_or_update_auth(
        db,
        user_id,
        google_email=google_email,
        access_token=access_token,
        refresh_token=refresh_token,
        token_expiry=token_expiry,
        sync_enabled=True,
    )

    return {
        "success": True,
        "user_id": user_id,
        "google_email": auth_record.google_email,
    }


def get_valid_access_token(db: Session, auth: UserGoogleAuth) -> Optional[str]:
    """Restituisce un access token valido, effettuando il refresh se scaduto."""
    now = datetime.now(timezone.utc)

    # Se ancora valido per più di 60 secondi
    if auth.token_expiry and auth.token_expiry > now + timedelta(seconds=60):
        return auth.access_token

    # Necessita di refresh
    if not auth.refresh_token:
        logger.warning("Refresh token mancante per user_id=%s", auth.user_id)
        return auth.access_token

    client_id, client_secret, _ = _get_client_credentials()

    try:
        status_code, data = _http_request(
            GOOGLE_TOKEN_URL,
            method="POST",
            data={
                "client_id": client_id,
                "client_secret": client_secret,
                "refresh_token": auth.refresh_token,
                "grant_type": "refresh_token",
            },
            is_json=False,
        )
        if status_code == 200 and isinstance(data, dict):
            new_access_token = data.get("access_token")
            expires_in = data.get("expires_in", 3600)
            new_expiry = datetime.now(timezone.utc) + timedelta(seconds=expires_in - 60)

            auth.access_token = new_access_token
            auth.token_expiry = new_expiry
            auth.updated_at = datetime.now(timezone.utc)
            db.commit()
            return new_access_token
        else:
            logger.error("Errore refresh token Google per user_id=%s: %s", auth.user_id, data)
    except Exception as exc:
        logger.exception("Eccezione durante il refresh del token Google: %s", exc)

    return auth.access_token


def _format_event_payload(event: Event) -> dict[str, Any]:
    """Costruisce il payload JSON per l'evento su Google Calendar v3."""
    payload: dict[str, Any] = {
        "summary": event.titolo,
        "description": event.descrizione or "",
    }

    if event.luogo:
        payload["location"] = event.luogo

    if event.tutto_il_giorno:
        # Eventi per l'intera giornata usano stringhe "YYYY-MM-DD"
        start_date_str = event.data_inizio.strftime("%Y-%m-%d")
        if event.data_fine:
            end_date_str = (event.data_fine + timedelta(days=1)).strftime("%Y-%m-%d")
        else:
            end_date_str = (event.data_inizio + timedelta(days=1)).strftime("%Y-%m-%d")

        payload["start"] = {"date": start_date_str}
        payload["end"] = {"date": end_date_str}
    else:
        # Eventi con orario
        payload["start"] = {"dateTime": event.data_inizio.isoformat()}
        if event.data_fine:
            payload["end"] = {"dateTime": event.data_fine.isoformat()}
        else:
            # Default: 1 ora dopo
            payload["end"] = {"dateTime": (event.data_inizio + timedelta(hours=1)).isoformat()}

    if event.rrule:
        # Google Calendar accetta "RRULE:FREQ=..."
        rrule_clean = event.rrule.strip()
        if not rrule_clean.startswith("RRULE:"):
            rrule_clean = f"RRULE:{rrule_clean}"
        payload["recurrence"] = [rrule_clean]

    return payload


def sync_event_to_google(db: Session, user: User, event: Event) -> Optional[str]:
    """
    Sincronizza un singolo evento verso Google Calendar.
    Crea l'evento su Google se non esiste, o lo aggiorna se google_event_id è presente.
    """
    auth = repo.get_user_auth(db, user.id)
    if not auth or not auth.sync_enabled:
        return None

    access_token = get_valid_access_token(db, auth)
    if not access_token:
        return None

    calendar_id = auth.calendar_id or "primary"
    payload = _format_event_payload(event)

    try:
        # 1. Se abbiamo già un google_event_id, proviamo l'aggiornamento (PUT)
        if event.google_event_id:
            url = f"{GOOGLE_CALENDAR_API_BASE}/calendars/{calendar_id}/events/{event.google_event_id}"
            status_code, res_data = _http_request(
                url,
                method="PUT",
                headers={"Authorization": f"Bearer {access_token}"},
                data=payload,
                is_json=True,
            )
            if status_code == 200:
                return event.google_event_id
            elif status_code in (404, 410):
                # Evento eliminato da Google Calendar, ricrealo da zero
                logger.info("Evento Google %s non trovato, lo ricreo.", event.google_event_id)
            else:
                logger.warning("Fallito aggiornamento evento su Google Calendar (%s): %s", status_code, res_data)

        # 2. Creazione nuovo evento (POST)
        url = f"{GOOGLE_CALENDAR_API_BASE}/calendars/{calendar_id}/events"
        status_code, res_data = _http_request(
            url,
            method="POST",
            headers={"Authorization": f"Bearer {access_token}"},
            data=payload,
            is_json=True,
        )
        if status_code in (200, 201) and isinstance(res_data, dict):
            google_id = res_data.get("id")
            event.google_event_id = google_id
            repo.update_event_google_id(db, event.id, google_id)
            return google_id
        else:
            logger.error("Errore creazione evento su Google Calendar (%s): %s", status_code, res_data)

    except Exception as exc:
        logger.exception("Eccezione durante la sincronizzazione su Google Calendar: %s", exc)

    return None


def delete_event_from_google(db: Session, user: User, google_event_id: Optional[str]) -> None:
    """Elimina l'evento da Google Calendar se associato."""
    if not google_event_id:
        return

    auth = repo.get_user_auth(db, user.id)
    if not auth:
        return

    access_token = get_valid_access_token(db, auth)
    if not access_token:
        return

    calendar_id = auth.calendar_id or "primary"
    url = f"{GOOGLE_CALENDAR_API_BASE}/calendars/{calendar_id}/events/{google_event_id}"

    try:
        status_code, _ = _http_request(
            url,
            method="DELETE",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if status_code not in (200, 204, 404, 410):
            logger.warning("Eliminazione evento Google fallita (status=%s)", status_code)
    except Exception as exc:
        logger.exception("Eccezione eliminazione evento Google Calendar: %s", exc)


def sync_all_events(db: Session, user: User) -> dict[str, Any]:
    """Sincronizza tutti gli eventi dell'utente su Google Calendar in batch."""
    return sync_bidirectional(db, user)


def sync_bidirectional(db: Session, user: User) -> dict[str, Any]:
    """
    Esegue la sincronizzazione bidirezionale completa:
    1. Scarica tutti gli eventi da Google Calendar (inclusi quelli eliminati/cancellati).
    2. Elimina gli eventi locali rimossi da Google.
    3. Importa gli eventi creati direttamente su Google Calendar.
    4. Aggiorna gli eventi modificati su Google.
    5. Invia a Google gli eventi locali creati nell'app non ancora sincronizzati.
    """
    auth = repo.get_user_auth(db, user.id)
    if not auth:
        raise ValueError("Google Calendar non è collegato a questo account.")

    access_token = get_valid_access_token(db, auth)
    if not access_token:
        raise ValueError("Impossibile autenticarsi con Google Calendar (token non valido).")

    calendar_id = auth.calendar_id or "primary"

    # 1. Recupero eventi da Google Calendar (mostrando anche i cancellati)
    url = f"{GOOGLE_CALENDAR_API_BASE}/calendars/{calendar_id}/events?maxResults=250&showDeleted=true&singleEvents=false"
    status_code, g_data = _http_request(
        url,
        method="GET",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    if status_code != 200 or not isinstance(g_data, dict):
        logger.error("Errore recupero eventi Google (%s): %s", status_code, g_data)
        raise ValueError("Errore durante la comunicazione con Google Calendar.")

    # 2. Caricamento mappa eventi locali dell'utente
    stmt = select(Event).where(Event.user_id == user.id)
    local_events = list(db.execute(stmt).scalars().all())
    local_by_google_id = {ev.google_event_id: ev for ev in local_events if ev.google_event_id}

    deleted_count = 0
    imported_count = 0
    updated_count = 0
    pushed_count = 0

    google_items = g_data.get("items", [])

    for item in google_items:
        google_id = item.get("id")
        if not google_id:
            continue

        g_status = item.get("status")

        # Se eliminato su Google Calendar
        if g_status == "cancelled":
            if google_id in local_by_google_id:
                ev_to_delete = local_by_google_id[google_id]
                db.delete(ev_to_delete)
                deleted_count += 1
                del local_by_google_id[google_id]
            continue

        # Evento attivo su Google
        summary = item.get("summary") or "Senza titolo"
        description = item.get("description")
        location = item.get("location")

        start_obj = item.get("start", {})
        end_obj = item.get("end", {})

        tutto_il_giorno = False
        data_inizio = None
        data_fine = None

        if "date" in start_obj:
            tutto_il_giorno = True
            try:
                d_start = date.fromisoformat(start_obj["date"])
                data_inizio = datetime(d_start.year, d_start.month, d_start.day, 0, 0, 0, tzinfo=timezone.utc)
            except Exception:
                continue

            if "date" in end_obj:
                try:
                    d_end = date.fromisoformat(end_obj["date"]) - timedelta(days=1)
                    data_fine = datetime(d_end.year, d_end.month, d_end.day, 23, 59, 59, tzinfo=timezone.utc)
                except Exception:
                    data_fine = data_inizio
            else:
                data_fine = data_inizio

        elif "dateTime" in start_obj:
            tutto_il_giorno = False
            try:
                data_inizio = datetime.fromisoformat(start_obj["dateTime"])
            except Exception:
                continue

            if "dateTime" in end_obj:
                try:
                    data_fine = datetime.fromisoformat(end_obj["dateTime"])
                except Exception:
                    data_fine = None
        else:
            continue

        # Recurrence RRULE
        rrule = None
        if item.get("recurrence"):
            for r in item["recurrence"]:
                if r.startswith("RRULE:"):
                    rrule = r[6:]
                    break

        if google_id in local_by_google_id:
            # Aggiornamento evento locale
            existing_ev = local_by_google_id[google_id]
            existing_ev.titolo = summary
            existing_ev.descrizione = description
            existing_ev.luogo = location
            existing_ev.data_inizio = data_inizio
            existing_ev.data_fine = data_fine
            existing_ev.tutto_il_giorno = tutto_il_giorno
            existing_ev.rrule = rrule
            updated_count += 1
        else:
            # Nuovo evento creato direttamente su Google -> Importa localmente!
            new_ev = Event(
                titolo=summary,
                descrizione=description,
                luogo=location,
                data_inizio=data_inizio,
                data_fine=data_fine,
                tutto_il_giorno=tutto_il_giorno,
                rrule=rrule,
                google_event_id=google_id,
                user_id=user.id,
            )
            db.add(new_ev)
            imported_count += 1

    db.commit()

    # 3. Invio a Google degli eventi locali non ancora sincronizzati (senza google_event_id)
    stmt_unsynced = select(Event).where(Event.user_id == user.id, Event.google_event_id.is_(None))
    unsynced_events = list(db.execute(stmt_unsynced).scalars().all())
    for ev in unsynced_events:
        try:
            res_gid = sync_event_to_google(db, user, ev)
            if res_gid:
                pushed_count += 1
        except Exception:
            pass

    details = []
    if deleted_count > 0:
        details.append(f"{deleted_count} rimossi")
    if imported_count > 0:
        details.append(f"{imported_count} importati")
    if updated_count > 0:
        details.append(f"{updated_count} aggiornati")
    if pushed_count > 0:
        details.append(f"{pushed_count} inviati a Google")

    summary_str = ", ".join(details) if details else "tutti gli eventi sono già sincronizzati"

    return {
        "success": True,
        "imported_count": imported_count,
        "updated_count": updated_count,
        "deleted_count": deleted_count,
        "pushed_count": pushed_count,
        "message": f"Sincronizzazione completata: {summary_str}.",
    }


def disconnect_google(db: Session, user: User) -> bool:
    """Disconnette l'account Google dell'utente."""
    return repo.delete_user_auth(db, user.id)


def toggle_sync(db: Session, user: User, sync_enabled: bool) -> Optional[UserGoogleAuth]:
    """Attiva o disattiva la sincronizzazione automatica."""
    return repo.update_sync_enabled(db, user.id, sync_enabled)
