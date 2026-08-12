from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.domains.monthly_entries.models import MonthlyEntry, NUMERIC_MONTHLY_TYPES, MULTI_RECORD_TYPES
from backend.domains.monthly_entries.schemas import MonthlyEntryCreate, MonthlyEntryResponse, MonthlyEntryUpdate
from backend.domains.monthly_entries import repository
from backend.domains.users.models import User

def _validate_numeric_field(monthly_type: str, monthly_field: Optional[str]) -> None:
    if monthly_type in NUMERIC_MONTHLY_TYPES:
        if monthly_field is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Il campo non può essere nullo per questo tipo"
            )
        try:
            val = int(monthly_field)
            if not (0 <= val <= 10):
                raise ValueError()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Il campo deve essere un intero tra 0 e 10"
            )

def _to_response(entry: MonthlyEntry) -> MonthlyEntryResponse:
    return MonthlyEntryResponse.model_validate(entry)

def list_entries(
    db: Session,
    current_user: User,
    year: Optional[int] = None,
    month: Optional[int] = None,
    monthly_type: Optional[str] = None
) -> list[MonthlyEntryResponse]:
    entries = repository.list_entries(
        db=db,
        user_id=current_user.id,
        year=year,
        month=month,
        monthly_type=monthly_type
    )
    return [_to_response(e) for e in entries]

def create_entry(db: Session, current_user: User, entry_in: MonthlyEntryCreate) -> MonthlyEntryResponse:
    _validate_numeric_field(entry_in.monthly_type, entry_in.monthly_field)
    
    if entry_in.monthly_type not in MULTI_RECORD_TYPES:
        existing = repository.get_entry_by_key(
            db=db,
            user_id=current_user.id,
            year=entry_in.year,
            month=entry_in.month,
            monthly_type=entry_in.monthly_type
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Esiste già una registrazione di questo tipo per questo mese e anno"
            )

    entry = MonthlyEntry(
        user_id=current_user.id,
        year=entry_in.year,
        month=entry_in.month,
        monthly_type=entry_in.monthly_type,
        monthly_field=entry_in.monthly_field
    )
    
    created = repository.create_entry(db, entry)
    return _to_response(created)

def update_entry(db: Session, current_user: User, entry_id: int, entry_in: MonthlyEntryUpdate) -> MonthlyEntryResponse:
    entry = repository.get_entry(db, entry_id, current_user.id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registrazione non trovata"
        )

    _validate_numeric_field(entry.monthly_type, entry_in.monthly_field)
    
    entry.monthly_field = entry_in.monthly_field
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