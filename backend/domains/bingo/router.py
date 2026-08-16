from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from backend.core import deps
from backend.domains.users.models import User
from backend.domains.bingo.schemas import (
    BingoEntryCreate,
    BingoEntryResponse,
    BingoEntryUpdate,
)
from backend.domains.bingo import service

router = APIRouter(prefix="/bingo", tags=["bingo"])

@router.get("", response_model=list[BingoEntryResponse])
def get_bingo_entries(
    year: int = Query(..., description="Anno della scheda bingo"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user)
):
    """Recupera le celle bingo per un anno."""
    return service.list_entries(db, current_user, year)

@router.post("", response_model=BingoEntryResponse, status_code=status.HTTP_201_CREATED)
def create_bingo_entry(
    entry_in: BingoEntryCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user)
):
    """Crea una nuova cella bingo."""
    return service.create_entry(db, current_user, entry_in)

@router.patch("/{entry_id}", response_model=BingoEntryResponse)
def update_bingo_entry(
    entry_id: int,
    entry_in: BingoEntryUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user)
):
    """Aggiorna una cella bingo esistente."""
    return service.update_entry(db, current_user, entry_id, entry_in)

@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bingo_entry(
    entry_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_app_user)
):
    """Elimina una cella bingo."""
    service.delete_entry(db, current_user, entry_id)
