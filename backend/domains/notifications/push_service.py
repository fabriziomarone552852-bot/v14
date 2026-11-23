"""Servizio centralizzato per invio notifiche Push Android tramite Firebase Cloud Messaging (FCM)."""
from __future__ import annotations

import logging
import os
import threading
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

from backend.core.database import SessionLocal
from backend.core.settings import get_settings
from backend.domains.notifications import repository as repo
from backend.domains.notifications import schemas

logger = logging.getLogger(__name__)

# Canali notifiche Android (allineati ai canali creati lato Capacitor nell'app mobile)
CHANNEL_GENERAL = "vita_general"
CHANNEL_SHOPPING = "vita_shopping"
CHANNEL_SOCIAL = "vita_social"
CHANNEL_ALERTS = "vita_alerts"

VITA_ACCENT_COLOR = "#10B981"
VITA_SMALL_ICON = "ic_stat_vita"

_firebase_lock = threading.Lock()
_firebase_initialized = False
_firebase_available = False
_push_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="vita-fcm")


@dataclass(frozen=True)
class PushDispatchResult:
    """Esito strutturato di un invio push FCM."""

    firebase_configured: bool
    sent_count: int
    failed_count: int
    invalid_tokens: List[str]
    detail: str


def _resolve_credentials_path() -> Optional[str]:
    """Cerca il file JSON dell'Account di Servizio Firebase nei percorsi noti."""
    configured = get_settings().firebase_credentials_path
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    candidates = [
        configured,
        os.path.join(os.getcwd(), configured),
        os.path.join(project_root, configured),
        os.path.join(project_root, "firebase-service-account.json"),
        "/app/firebase-service-account.json",
    ]
    for path in candidates:
        if path and os.path.isfile(path):
            return path
    return None


def is_firebase_configured() -> bool:
    """Inizializza Firebase Admin in modo lazy e thread-safe. Restituisce True se pronto."""
    global _firebase_initialized, _firebase_available

    if _firebase_initialized:
        return _firebase_available

    with _firebase_lock:
        if _firebase_initialized:
            return _firebase_available

        cred_path = _resolve_credentials_path()
        if not cred_path:
            logger.info("[FCM] File credenziali Firebase non trovato: invio push disabilitato.")
            _firebase_initialized = True
            _firebase_available = False
            return False

        try:
            import firebase_admin
            from firebase_admin import credentials

            if not firebase_admin._apps:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
            _firebase_initialized = True
            _firebase_available = True
            logger.info("[FCM] Firebase Admin inizializzato correttamente da %s", cred_path)
        except Exception as exc:
            logger.warning("[FCM] Errore inizializzazione Firebase Admin: %s", exc)
            _firebase_initialized = True
            _firebase_available = False

        return _firebase_available


def _cleanup_invalid_tokens(invalid_tokens: List[str]) -> None:
    """Disattiva automaticamente i token FCM revocati/non registrati usando una sessione DB pulita."""
    if not invalid_tokens:
        return
    db = SessionLocal()
    try:
        removed = repo.deactivate_push_tokens_bulk(db, invalid_tokens)
        logger.info("[FCM] Disattivati %d token FCM non più validi.", removed)
    except Exception as exc:
        logger.warning("[FCM] Impossibile disattivare token scaduti: %s", exc)
        db.rollback()
    finally:
        db.close()


def send_push_to_tokens_sync(
    tokens: List[str],
    title: str,
    body: str,
    channel_id: str = CHANNEL_GENERAL,
    data: Optional[Dict[str, str]] = None,
) -> PushDispatchResult:
    """Invia una notifica push FCM in modo sincrono a una lista di token."""
    unique_tokens = [t.strip() for t in set(tokens) if t and t.strip()]
    if not unique_tokens:
        return PushDispatchResult(
            firebase_configured=is_firebase_configured(),
            sent_count=0,
            failed_count=0,
            invalid_tokens=[],
            detail="Nessun dispositivo Android attivo registrato per questo account.",
        )

    if not is_firebase_configured():
        return PushDispatchResult(
            firebase_configured=False,
            sent_count=0,
            failed_count=len(unique_tokens),
            invalid_tokens=[],
            detail="Credenziali Firebase non configurate sul server.",
        )

    try:
        from firebase_admin import messaging
    except ImportError as exc:
        logger.warning("[FCM] Pacchetto firebase-admin non installato: %s", exc)
        return PushDispatchResult(
            firebase_configured=False,
            sent_count=0,
            failed_count=len(unique_tokens),
            invalid_tokens=[],
            detail="Libreria firebase-admin mancante sul server.",
        )

    str_data: Dict[str, str] = {k: str(v) for k, v in (data or {}).items() if v is not None}
    str_data.setdefault("title", title)
    str_data.setdefault("body", body)
    str_data.setdefault("channel_id", channel_id)

    sent_total = 0
    failed_total = 0
    invalid_tokens: List[str] = []

    # FCM accetta massimo 500 token per singola chiamata multicast
    chunk_size = 500
    for idx in range(0, len(unique_tokens), chunk_size):
        chunk = unique_tokens[idx : idx + chunk_size]
        message = messaging.MulticastMessage(
            tokens=chunk,
            notification=messaging.Notification(title=title, body=body),
            data=str_data,
            android=messaging.AndroidConfig(
                priority="high",
                notification=messaging.AndroidNotification(
                    channel_id=channel_id,
                    icon=VITA_SMALL_ICON,
                    color=VITA_ACCENT_COLOR,
                    default_sound=True,
                    default_vibrate_timings=True,
                ),
            ),
        )
        try:
            batch_resp = messaging.send_each_for_multicast(message)
            sent_total += batch_resp.success_count
            failed_total += batch_resp.failure_count

            for token_val, resp in zip(chunk, batch_resp.responses):
                if resp.success:
                    continue
                exc = resp.exception
                exc_name = type(exc).__name__ if exc else "UnknownError"
                if isinstance(exc, (messaging.UnregisteredError, messaging.SenderIdMismatchError)):
                    invalid_tokens.append(token_val)
                logger.warning("[FCM] Errore invio su token (...%s): %s - %s", token_val[-8:], exc_name, exc)
        except Exception as exc:
            failed_total += len(chunk)
            logger.warning("[FCM] Eccezione invio batch multicast: %s", exc)

    if invalid_tokens:
        _cleanup_invalid_tokens(invalid_tokens)

    detail = (
        f"Notifica inviata a {sent_total} dispositivo/i."
        if sent_total > 0
        else "Invio fallito su tutti i dispositivi registrati."
    )
    return PushDispatchResult(
        firebase_configured=True,
        sent_count=sent_total,
        failed_count=failed_total,
        invalid_tokens=invalid_tokens,
        detail=detail,
    )


def dispatch_push_async(
    tokens: List[str],
    title: str,
    body: str,
    channel_id: str = CHANNEL_GENERAL,
    data: Optional[Dict[str, str]] = None,
) -> None:
    """Accoda l'invio push in background senza mai rallentare la risposta HTTP."""
    if not tokens:
        return
    if not is_firebase_configured():
        return
    try:
        _push_executor.submit(send_push_to_tokens_sync, tokens, title, body, channel_id, data)
    except Exception as exc:
        logger.warning("[FCM] Impossibile accodare invio push asincrono: %s", exc)


def notify_users_async(
    db: Session,
    user_ids: List[int],
    title: str,
    body: str,
    channel_id: str = CHANNEL_GENERAL,
    data: Optional[Dict[str, str]] = None,
) -> None:
    """Risolve i token attivi per gli utenti indicati e accoda la push in background."""
    if not user_ids:
        return
    try:
        tokens = repo.list_active_push_tokens_for_users(db, user_ids)
        if tokens:
            dispatch_push_async(tokens, title, body, channel_id=channel_id, data=data)
    except Exception as exc:
        logger.warning("[FCM] Errore recupero token push utenti %s: %s", user_ids, exc)


def _truncate(text: str, max_len: int = 160) -> str:
    cleaned = " ".join((text or "").split())
    if len(cleaned) <= max_len:
        return cleaned
    return cleaned[: max_len - 1].rstrip() + "…"


def _build_interaction_push_payload(
    hydrated: schemas.InteractionResponse,
) -> Tuple[str, str, str, Dict[str, str]]:
    """Costruisce titolo, corpo, canale e deep-link per qualsiasi Interaction di Vita."""
    itype = hydrated.interaction_type
    author = hydrated.author_name or "Qualcuno"
    ctx = hydrated.context_title
    data: Dict[str, str] = {
        "interaction_type": itype,
        "interaction_id": str(hydrated.id),
    }

    if itype == "EPHEMERAL_MSG":
        # Privacy: non esporre il contenuto di un messaggio effimero sulla schermata di blocco
        data["open_notifications_sheet"] = "true"
        data["notifications_tab"] = "messaggi"
        return (
            f"💬 Messaggio effimero da {author}",
            "Hai ricevuto un nuovo messaggio effimero. Tocca per leggerlo.",
            CHANNEL_SOCIAL,
            data,
        )

    if itype == "SHOPPING_GROUP_NEW_LIST":
        if hydrated.reference_id:
            data["route"] = f"/shopping?listId={hydrated.reference_id}"
        return ("🛒 Nuova lista spesa", _truncate(hydrated.content), CHANNEL_SHOPPING, data)

    if itype == "SHOPPING_GROUP_INVITE":
        if hydrated.reference_id:
            data["route"] = f"/shopping?openGroup={hydrated.reference_id}"
        return ("🛒 Invito gruppo spesa", _truncate(hydrated.content), CHANNEL_SHOPPING, data)

    if itype in ("SERIES_REVIEW_COMMENT", "SERIES_REVIEW_COMMENT_THREAD", "SERIES_REVIEW_MENTION"):
        if hydrated.series_tmdb_id:
            data["route"] = (
                f"/trackers/serie-tv?tmdb_id={hydrated.series_tmdb_id}"
                f"&open_review=true&open_review_log_id={hydrated.reference_id or ''}"
            )
        title = f"📺 {author} ti ha menzionato" if itype.endswith("_MENTION") else f"📺 Nuovo commento da {author}"
        body = f"{ctx}: {_truncate(hydrated.content, 120)}" if ctx else _truncate(hydrated.content)
        return (title, body, CHANNEL_SOCIAL, data)

    if itype in ("EPISODE_REVIEW_COMMENT", "EPISODE_REVIEW_COMMENT_THREAD", "EPISODE_REVIEW_MENTION"):
        if hydrated.series_tmdb_id:
            data["route"] = (
                f"/trackers/serie-tv?tmdb_id={hydrated.series_tmdb_id}"
                f"&open_episode={hydrated.episode_id or ''}&open_review_log_id={hydrated.reference_id or ''}"
            )
        title = f"📺 {author} ti ha menzionato" if itype.endswith("_MENTION") else f"📺 Commento episodio da {author}"
        body = f"{ctx}: {_truncate(hydrated.content, 120)}" if ctx else _truncate(hydrated.content)
        return (title, body, CHANNEL_SOCIAL, data)

    if itype in ("SEASON_REVIEW_COMMENT", "SEASON_REVIEW_COMMENT_THREAD", "SEASON_REVIEW_MENTION"):
        if hydrated.series_tmdb_id:
            data["route"] = (
                f"/trackers/serie-tv?tmdb_id={hydrated.series_tmdb_id}"
                f"&open_season={hydrated.season_number if hydrated.season_number is not None else 1}"
                f"&open_review_log_id={hydrated.reference_id or ''}"
            )
        title = f"📺 {author} ti ha menzionato" if itype.endswith("_MENTION") else f"📺 Commento stagione da {author}"
        body = f"{ctx}: {_truncate(hydrated.content, 120)}" if ctx else _truncate(hydrated.content)
        return (title, body, CHANNEL_SOCIAL, data)

    if itype in ("MOVIE_REVIEW_COMMENT", "MOVIE_REVIEW_COMMENT_THREAD", "MOVIE_REVIEW_MENTION"):
        if hydrated.movie_tmdb_id:
            data["route"] = (
                f"/trackers/film?tmdb_id={hydrated.movie_tmdb_id}"
                f"&open_review=true&open_review_log_id={hydrated.reference_id or ''}"
            )
        title = f"🎬 {author} ti ha menzionato" if itype.endswith("_MENTION") else f"🎬 Commento film da {author}"
        body = f"{ctx}: {_truncate(hydrated.content, 120)}" if ctx else _truncate(hydrated.content)
        return (title, body, CHANNEL_SOCIAL, data)

    if itype == "SYSTEM_ALERT":
        data["open_notifications_sheet"] = "true"
        data["notifications_tab"] = "notifiche"
        return ("📢 Avviso di Sistema", _truncate(hydrated.content), CHANNEL_ALERTS, data)

    data["open_notifications_sheet"] = "true"
    data["notifications_tab"] = "notifiche"
    return ("🔔 Nuova notifica su Vita", _truncate(hydrated.content), CHANNEL_GENERAL, data)


def notify_interaction_async(db: Session, hydrated: schemas.InteractionResponse) -> None:
    """Invia una push Android per una Interaction appena creata (se ha un destinatario valido)."""
    if not hydrated.recipient_id:
        return
    if hydrated.author_id and hydrated.author_id == hydrated.recipient_id:
        return

    title, body, channel_id, data = _build_interaction_push_payload(hydrated)
    notify_users_async(db, [hydrated.recipient_id], title=title, body=body, channel_id=channel_id, data=data)
