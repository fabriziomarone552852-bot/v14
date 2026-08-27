"""Service del dominio Notifications — logica di business e marcatura notifiche."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.domains.notifications import repository as repo
from backend.domains.notifications import schemas
from backend.domains.notifications.models import Notification
from backend.domains.users.models import User

_NOT_FOUND = "Notifica non trovata."


def list_notifications(
    db: Session,
    current_user: User,
    unread_only: bool = False,
    limit: int = 50,
) -> List[Notification]:
    return repo.list_for_user(db, current_user.id, unread_only=unread_only, limit=limit)


def create_notification(
    db: Session,
    current_user: User,
    payload: schemas.NotificationCreate,
) -> Notification:
    now_utc = datetime.now(timezone.utc)
    notification = Notification(
        user_id=current_user.id,
        notification_type_id=payload.notification_type_id,
        title=payload.title,
        message=payload.message,
        created_at=now_utc,
        updated_at=now_utc,
        read_at=None,
        deleted_at=None,
    )
    return repo.add(db, notification)


def mark_as_read(
    db: Session,
    current_user: User,
    notification_id: int,
) -> Notification:
    notification = repo.get_owned(db, notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=_NOT_FOUND)

    if notification.read_at is None:
        notification.read_at = datetime.now(timezone.utc)
        notification = repo.save(db, notification)

    return notification


def mark_all_as_read(
    db: Session,
    current_user: User,
) -> int:
    return repo.mark_all_as_read(db, current_user.id)


def delete_notification(
    db: Session,
    current_user: User,
    notification_id: int,
) -> None:
    notification = repo.get_owned(db, notification_id, current_user.id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=_NOT_FOUND)
    repo.delete(db, notification)
