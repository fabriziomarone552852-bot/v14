"""Feedback domain repository for database operations."""
from __future__ import annotations

from typing import List, Optional

from sqlalchemy import desc
from sqlalchemy.orm import Session, joinedload

from backend.domains.feedback.models import FeedbackReport


def create(db: Session, report: FeedbackReport) -> FeedbackReport:
    """Persiste una nuova segnalazione di feedback/bug."""
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def get_by_id(db: Session, report_id: int) -> Optional[FeedbackReport]:
    """Recupera una segnalazione per ID con eager-loading dell'utente."""
    return (
        db.query(FeedbackReport)
        .options(joinedload(FeedbackReport.user))
        .filter(FeedbackReport.id == report_id)
        .first()
    )


def list_reports(
    db: Session,
    status_filter: Optional[str] = None,
    severity_filter: Optional[str] = None,
    report_type_filter: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> List[FeedbackReport]:
    """Elenca le segnalazioni con filtri opzionali e ordinamento per data decrescente."""
    query = db.query(FeedbackReport).options(joinedload(FeedbackReport.user))

    if status_filter:
        query = query.filter(FeedbackReport.status == status_filter)
    if severity_filter:
        query = query.filter(FeedbackReport.severity == severity_filter)
    if report_type_filter:
        query = query.filter(FeedbackReport.report_type == report_type_filter)

    return (
        query.order_by(desc(FeedbackReport.created_at))
        .offset(offset)
        .limit(limit)
        .all()
    )


def list_by_user(
    db: Session,
    user_id: int,
    limit: int = 50,
) -> List[FeedbackReport]:
    """Elenca le segnalazioni inviate da uno specifico utente."""
    return (
        db.query(FeedbackReport)
        .filter(FeedbackReport.user_id == user_id)
        .order_by(desc(FeedbackReport.created_at))
        .limit(limit)
        .all()
    )


def delete(db: Session, report: FeedbackReport) -> None:
    """Elimina definitivamente un report."""
    db.delete(report)
    db.commit()
