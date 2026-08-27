"""
Google Calendar domain repository.
Database operations for user Google OAuth credentials and event links.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.domains.events.models import Event
from backend.domains.google_calendar.models import UserGoogleAuth


def get_user_auth(db: Session, user_id: int) -> Optional[UserGoogleAuth]:
    """Recupera le credenziali Google OAuth associate all'utente."""
    stmt = select(UserGoogleAuth).where(UserGoogleAuth.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()


def save_or_update_auth(
    db: Session,
    user_id: int,
    *,
    google_email: Optional[str],
    access_token: str,
    refresh_token: Optional[str] = None,
    token_expiry: Optional[datetime] = None,
    calendar_id: str = "primary",
    sync_enabled: bool = True,
) -> UserGoogleAuth:
    """Crea o aggiorna le credenziali Google OAuth per l'utente."""
    existing = get_user_auth(db, user_id)
    now = datetime.now(timezone.utc)

    if existing:
        existing.google_email = google_email or existing.google_email
        existing.access_token = access_token
        if refresh_token:
            existing.refresh_token = refresh_token
        existing.token_expiry = token_expiry
        existing.calendar_id = calendar_id
        existing.updated_at = now
        db.commit()
        db.refresh(existing)
        return existing

    new_auth = UserGoogleAuth(
        user_id=user_id,
        google_email=google_email,
        access_token=access_token,
        refresh_token=refresh_token,
        token_expiry=token_expiry,
        calendar_id=calendar_id,
        sync_enabled=sync_enabled,
        created_at=now,
    )
    db.add(new_auth)
    db.commit()
    db.refresh(new_auth)
    return new_auth


def delete_user_auth(db: Session, user_id: int) -> bool:
    """Rimuove le credenziali Google OAuth dell'utente (disconnessione)."""
    existing = get_user_auth(db, user_id)
    if not existing:
        return False
    db.delete(existing)
    db.commit()
    return True


def update_sync_enabled(db: Session, user_id: int, sync_enabled: bool) -> Optional[UserGoogleAuth]:
    """Attiva o disattiva la sincronizzazione automatica."""
    existing = get_user_auth(db, user_id)
    if not existing:
        return None
    existing.sync_enabled = sync_enabled
    existing.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(existing)
    return existing


def update_event_google_id(db: Session, event_id: int, google_event_id: Optional[str]) -> None:
    """Aggiorna il google_event_id su un evento locale."""
    stmt = select(Event).where(Event.id == event_id)
    event = db.execute(stmt).scalar_one_or_none()
    if event:
        event.google_event_id = google_event_id
        db.commit()
