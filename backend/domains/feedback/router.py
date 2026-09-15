"""HTTP Router for the Feedback domain (prefix /feedback)."""
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from backend.core import deps
from backend.domains.feedback import schemas, service
from backend.domains.users.models import User

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post(
    "/reports",
    response_model=schemas.FeedbackReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Invia una nuova segnalazione di bug, errore o suggerimento",
)
def create_feedback_report(
    payload: schemas.FeedbackReportCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.create_report(db, current_user, payload)


@router.get(
    "/reports",
    response_model=List[schemas.FeedbackReportResponse],
    summary="Elenca tutte le segnalazioni (Solo SuperUser)",
)
def list_feedback_reports(
    status_filter: Optional[str] = Query(None, alias="status", description="Filtra per status: new, in_progress, resolved, dismissed"),
    severity_filter: Optional[str] = Query(None, alias="severity", description="Filtra per gravità: low, medium, high, critical"),
    report_type_filter: Optional[str] = Query(None, alias="type", description="Filtra per tipologia: bug, visual, feature_request, other"),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    return service.list_reports(
        db,
        status_filter=status_filter,
        severity_filter=severity_filter,
        report_type_filter=report_type_filter,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/my-reports",
    response_model=List[schemas.FeedbackReportResponse],
    summary="Elenca le proprie segnalazioni inviate",
)
def list_my_reports(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.list_my_reports(db, current_user, limit=limit)


@router.get(
    "/reports/{report_id}",
    response_model=schemas.FeedbackReportResponse,
    summary="Dettaglio di una singola segnalazione",
)
def get_feedback_report(
    report_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user),
):
    return service.get_report_by_id(db, current_user, report_id)


@router.patch(
    "/reports/{report_id}",
    response_model=schemas.FeedbackReportResponse,
    summary="Aggiorna stato e note amministrative (Solo SuperUser)",
)
def update_feedback_report(
    report_id: int,
    payload: schemas.FeedbackReportUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    return service.update_report(db, report_id, payload)


@router.delete(
    "/reports/{report_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    summary="Elimina definitivamente una segnalazione (Solo SuperUser)",
)
def delete_feedback_report(
    report_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.require_superuser),
):
    service.delete_report(db, report_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
