from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.domains.bingo.models import BingoEntry
from backend.domains.bingo.schemas import BingoEntryCreate, BingoEntryResponse, BingoEntryUpdate
from backend.domains.bingo import repository
from backend.domains.users.models import User

def _to_response(entry: BingoEntry) -> BingoEntryResponse:
    return BingoEntryResponse.model_validate(entry)

def list_entries(db: Session, current_user: User, year: int) -> list[BingoEntryResponse]:
    entries = repository.list_entries(db, current_user.id, year)
    return [_to_response(e) for e in entries]

def create_entry(db: Session, current_user: User, entry_in: BingoEntryCreate) -> BingoEntryResponse:
    current_count = repository.count_by_year(db, current_user.id, entry_in.year)
    if current_count >= 25:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hai già raggiunto il limite di 25 celle bingo per quest'anno"
        )
    
    entry = BingoEntry(
        user_id=current_user.id,
        year=entry_in.year,
        testo=entry_in.testo,
        posizione=entry_in.posizione,
        rotazione=entry_in.rotazione
    )
    created = repository.create_entry(db, entry)
    return _to_response(created)

def update_entry(db: Session, current_user: User, entry_id: int, entry_in: BingoEntryUpdate) -> BingoEntryResponse:
    entry = repository.get_entry(db, entry_id, current_user.id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cella bingo non trovata"
        )

    if entry_in.testo is not None:
        entry.testo = entry_in.testo
    if entry_in.done is not None:
        entry.done = entry_in.done
    if entry_in.posizione is not None:
        entry.posizione = entry_in.posizione
    if entry_in.rotazione is not None:
        entry.rotazione = entry_in.rotazione
        
    updated = repository.update_entry(db, entry)
    return _to_response(updated)

def delete_entry(db: Session, current_user: User, entry_id: int) -> None:
    entry = repository.get_entry(db, entry_id, current_user.id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cella bingo non trovata"
        )
    repository.delete_entry(db, entry)
