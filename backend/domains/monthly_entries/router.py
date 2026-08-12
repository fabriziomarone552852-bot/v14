from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from backend.core import deps
from backend.domains.users.models import User
from backend.domains.monthly_entries.schemas import (
    MonthlyEntryCreate,
    MonthlyEntryResponse,
    MonthlyEntryUpdate,
)
from backend.domains.monthly_entries import service

router = APIRouter(prefix="/monthly-entries", tags=["monthly-entries"])

@router.get("", response_model=list[MonthlyEntryResponse])
def get_monthly_entries(
    year: Optional[int] = Query(None, description="Anno della registrazione"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Mese della registrazione"),
    monthly_type: Optional[str] = Query(None, description="Tipo di registrazione"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user)
):
    """Recupera le registrazioni mensili con filtri opzionali."""
    return service.list_entries(db, current_user, year=year, month=month, monthly_type=monthly_type)

@router.get("/{year}/{month}", response_model=list[MonthlyEntryResponse])
def get_monthly_entries_by_date(
    year: int,
    month: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user)
):
    """Recupera le registrazioni mensili per un mese specifico."""
    return service.list_entries(db, current_user, year=year, month=month)

@router.post("", response_model=MonthlyEntryResponse, status_code=status.HTTP_201_CREATED)
def create_monthly_entry(
    entry_in: MonthlyEntryCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user)
):
    """Crea una nuova registrazione mensile."""
    return service.create_entry(db, current_user, entry_in)

@router.patch("/{entry_id}", response_model=MonthlyEntryResponse)
def update_monthly_entry(
    entry_id: int,
    entry_in: MonthlyEntryUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user)
):
    """Aggiorna una registrazione mensile esistente."""
    return service.update_entry(db, current_user, entry_id, entry_in)

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_monthly_entry(
    entry_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user)
):
    """Elimina una registrazione mensile."""
    service.delete_entry(db, current_user, entry_id)