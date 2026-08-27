"""Router HTTP del dominio Notifications (prefix /notifications)."""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from backend.core import deps
from backend.domains.notifications import schemas, service
from backend.domains.users.models import User

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=List[schemas.NotificationResponse])
def list_notifications(
    unread_only: bool = Query(default=False, description="Filtra solo notifiche non lette"),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.list_notifications(db, current_user, unread_only=unread_only, limit=limit)


@router.post("", response_model=schemas.NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    payload: schemas.NotificationCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.create_notification(db, current_user, payload)


@router.patch("/{notification_id}/read", response_model=schemas.NotificationResponse)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.mark_as_read(db, current_user, notification_id)


@router.post("/read-all", status_code=status.HTTP_200_OK)
def mark_all_notifications_as_read(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    updated_count = service.mark_all_as_read(db, current_user)
    return {"updated": updated_count}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_notification(
    notification_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    service.delete_notification(db, current_user, notification_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
