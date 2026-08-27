"""Repository del dominio Notifications."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from backend.domains.notifications.models import Notification


def list_for_user(
    db: Session,
    user_id: int,
    unread_only: bool = False,
    limit: int = 50,
) -> List[Notification]:
    stmt = (
        select(Notification)
        .where(Notification.user_id == user_id)
        .where(Notification.deleted_at.is_(None))
        .order_by(Notification.created_at.desc())
        .limit(limit)
    )
    if unread_only:
        stmt = stmt.where(Notification.read_at.is_(None))
    return list(db.scalars(stmt).all())


def get_owned(db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
    stmt = (
        select(Notification)
        .where(Notification.id == notification_id)
        .where(Notification.user_id == user_id)
        .where(Notification.deleted_at.is_(None))
    )
    return db.scalars(stmt).first()


def add(db: Session, notification: Notification) -> Notification:
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def save(db: Session, notification: Notification) -> Notification:
    notification.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(notification)
    return notification


def mark_all_as_read(db: Session, user_id: int) -> int:
    now_utc = datetime.now(timezone.utc)
    stmt = (
        update(Notification)
        .where(Notification.user_id == user_id)
        .where(Notification.read_at.is_(None))
        .where(Notification.deleted_at.is_(None))
        .values(read_at=now_utc, updated_at=now_utc)
    )
    result = db.execute(stmt)
    db.commit()
    return result.rowcount or 0


def delete(db: Session, notification: Notification) -> None:
    notification.deleted_at = datetime.now(timezone.utc)
    db.commit()
