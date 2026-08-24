from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from backend.core import deps
from backend.domains.users.models import User
from backend.domains.yearly_entries.schemas import (
    YearlyEntryCreate,
    YearlyEntryResponse,
    YearlyEntryUpdate,
)
from backend.domains.yearly_entries import service

router = APIRouter(prefix="/yearly-entries", tags=["yearly-entries"])

@router.get("", response_model=list[YearlyEntryResponse])
def get_yearly_entries(
    year: Optional[int] = Query(None, description="Anno della registrazione"),
    yearly_type: Optional[str] = Query(None, description="Tipo di registrazione"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user)
):
    """Recupera le registrazioni annuali con filtri opzionali."""
    return service.list_entries(db, current_user, year=year, yearly_type=yearly_type)

@router.post("", response_model=YearlyEntryResponse, status_code=status.HTTP_201_CREATED)
def create_yearly_entry(
    entry_in: YearlyEntryCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user)
):
    """Crea una nuova registrazione annuale."""
    return service.create_entry(db, current_user, entry_in)

@router.patch("/{entry_id}", response_model=YearlyEntryResponse)
def update_yearly_entry(
    entry_id: int,
    entry_in: YearlyEntryUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user)
):
    """Aggiorna una registrazione annuale esistente."""
    return service.update_entry(db, current_user, entry_id, entry_in)

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_yearly_entry(
    entry_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user)
):
    """Elimina una registrazione annuale."""
    service.delete_entry(db, current_user, entry_id)
