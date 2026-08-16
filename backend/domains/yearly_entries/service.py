from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.domains.yearly_entries.models import YearlyEntry, NUMERIC_YEARLY_TYPES, MULTI_RECORD_YEARLY_TYPES
from backend.domains.yearly_entries.schemas import YearlyEntryCreate, YearlyEntryResponse, YearlyEntryUpdate
from backend.domains.yearly_entries import repository
from backend.domains.users.models import User

def _validate_numeric_field(yearly_type: str, yearly_field: Optional[str]) -> None:
    if yearly_type in NUMERIC_YEARLY_TYPES:
        if yearly_field is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Il campo non può essere nullo per questo tipo"
            )
        try:
            val = int(yearly_field)
            if not (0 <= val <= 10):
                raise ValueError()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Il campo deve essere un intero tra 0 e 10"
            )

def _to_response(entry: YearlyEntry) -> YearlyEntryResponse:
    return YearlyEntryResponse.model_validate(entry)

def list_entries(
    db: Session,
    current_user: User,
    year: Optional[int] = None,
    yearly_type: Optional[str] = None
) -> list[YearlyEntryResponse]:
    entries = repository.list_entries(
        db=db,
        user_id=current_user.id,
        year=year,
        yearly_type=yearly_type
    )
    return [_to_response(e) for e in entries]

def create_entry(db: Session, current_user: User, entry_in: YearlyEntryCreate) -> YearlyEntryResponse:
    _validate_numeric_field(entry_in.yearly_type, entry_in.yearly_field)
    
    if entry_in.yearly_type not in MULTI_RECORD_YEARLY_TYPES:
        existing = repository.get_entry_by_key(
            db=db,
            user_id=current_user.id,
            year=entry_in.year,
            yearly_type=entry_in.yearly_type
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Esiste già una registrazione di questo tipo per questo anno"
            )

    entry = YearlyEntry(
        user_id=current_user.id,
        year=entry_in.year,
        yearly_type=entry_in.yearly_type,
        yearly_field=entry_in.yearly_field
    )
    
    created = repository.create_entry(db, entry)
    return _to_response(created)

def update_entry(db: Session, current_user: User, entry_id: int, entry_in: YearlyEntryUpdate) -> YearlyEntryResponse:
    entry = repository.get_entry(db, entry_id, current_user.id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registrazione non trovata"
        )

    _validate_numeric_field(entry.yearly_type, entry_in.yearly_field)
    
    entry.yearly_field = entry_in.yearly_field
    updated = repository.update_entry(db, entry)
    return _to_response(updated)

def delete_entry(db: Session, current_user: User, entry_id: int) -> None:
    entry = repository.get_entry(db, entry_id, current_user.id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registrazione non trovata"
        )
    repository.delete_entry(db, entry)
