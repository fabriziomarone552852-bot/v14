"""Feedback domain business logic service."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.domains.feedback import repository, schemas
from backend.domains.feedback.models import FeedbackReport
from backend.domains.users.models import User


def _to_response_dto(report: FeedbackReport) -> schemas.FeedbackReportResponse:
    """Arricchisce il DTO con i dati anagrafici dell'utente autore."""
    username = report.user.username if report.user else None
    email = report.user.email if report.user else None

    return schemas.FeedbackReportResponse(
        id=report.id,
        user_id=report.user_id,
        report_type=report.report_type,
        severity=report.severity,
        title=report.title,
        description=report.description,
        steps_to_reproduce=report.steps_to_reproduce,
        app_version=report.app_version,
        platform=report.platform,
        current_route=report.current_route,
        error_context=report.error_context,
        screenshot_url=report.screenshot_url,
        status=report.status,
        admin_notes=report.admin_notes,
        created_at=report.created_at,
        updated_at=report.updated_at,
        resolved_at=report.resolved_at,
        user_username=username,
        user_email=email,
    )


def create_report(
    db: Session,
    current_user: User,
    payload: schemas.FeedbackReportCreate,
) -> schemas.FeedbackReportResponse:
    """Crea e memorizza una nuova segnalazione utente."""
    report = FeedbackReport(
        user_id=current_user.id,
        report_type=payload.report_type,
        severity=payload.severity,
        title=payload.title,
        description=payload.description,
        steps_to_reproduce=payload.steps_to_reproduce,
        app_version=payload.app_version,
        platform=payload.platform,
        current_route=payload.current_route,
        error_context=payload.error_context,
        screenshot_url=payload.screenshot_url,
        status="new",
        created_at=datetime.now(timezone.utc),
    )
    saved_report = repository.create(db, report)
    # Ricarica con la relationship user
    full_report = repository.get_by_id(db, saved_report.id)
    return _to_response_dto(full_report or saved_report)


def list_reports(
    db: Session,
    status_filter: Optional[str] = None,
    severity_filter: Optional[str] = None,
    report_type_filter: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> List[schemas.FeedbackReportResponse]:
    """Elenca tutti i report (riservato agli amministratori)."""
    reports = repository.list_reports(
        db,
        status_filter=status_filter,
        severity_filter=severity_filter,
        report_type_filter=report_type_filter,
        limit=limit,
        offset=offset,
    )
    return [_to_response_dto(r) for r in reports]


def get_report_by_id(
    db: Session,
    current_user: User,
    report_id: int,
) -> schemas.FeedbackReportResponse:
    """Recupera il dettaglio di un report (SuperUser o proprietario)."""
    report = repository.get_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Segnalazione non trovata.")

    if not current_user.is_superuser and report.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Non hai i permessi per visualizzare questa segnalazione.",
        )

    return _to_response_dto(report)


def update_report(
    db: Session,
    report_id: int,
    payload: schemas.FeedbackReportUpdate,
) -> schemas.FeedbackReportResponse:
    """Aggiorna lo stato o le note di una segnalazione (solo SuperUser)."""
    report = repository.get_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Segnalazione non trovata.")

    now = datetime.now(timezone.utc)
    if payload.status is not None:
        report.status = payload.status
        if payload.status == "resolved" and report.resolved_at is None:
            report.resolved_at = now
        elif payload.status != "resolved":
            report.resolved_at = None

    if payload.admin_notes is not None:
        report.admin_notes = payload.admin_notes

    report.updated_at = now
    db.commit()
    db.refresh(report)
    return _to_response_dto(report)


def delete_report(db: Session, report_id: int) -> None:
    """Elimina definitivamente una segnalazione (solo SuperUser)."""
    report = repository.get_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Segnalazione non trovata.")
    repository.delete(db, report)


def list_my_reports(
    db: Session,
    current_user: User,
    limit: int = 50,
) -> List[schemas.FeedbackReportResponse]:
    """Elenca le segnalazioni inviate dall'utente autenticato."""
    reports = repository.list_by_user(db, current_user.id, limit=limit)
    return [_to_response_dto(r) for r in reports]
