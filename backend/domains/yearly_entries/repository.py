from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from backend.domains.yearly_entries.models import YearlyEntry

def list_entries(
    db: Session,
    user_id: int,
    year: Optional[int] = None,
    yearly_type: Optional[str] = None
) -> list[YearlyEntry]:
    stmt = select(YearlyEntry).where(YearlyEntry.user_id == user_id)
    
    if year is not None:
        stmt = stmt.where(YearlyEntry.year == year)
    if yearly_type is not None:
        stmt = stmt.where(YearlyEntry.yearly_type == yearly_type)
        
    stmt = stmt.order_by(YearlyEntry.year.desc(), YearlyEntry.id.desc())
    return list(db.scalars(stmt).all())

def get_entry(db: Session, entry_id: int, user_id: int) -> Optional[YearlyEntry]:
    stmt = select(YearlyEntry).where(
        YearlyEntry.id == entry_id,
        YearlyEntry.user_id == user_id
    )
    return db.scalars(stmt).first()

def get_entry_by_key(
    db: Session,
    user_id: int,
    year: int,
    yearly_type: str
) -> Optional[YearlyEntry]:
    stmt = select(YearlyEntry).where(
        YearlyEntry.user_id == user_id,
        YearlyEntry.year == year,
        YearlyEntry.yearly_type == yearly_type
    )
    return db.scalars(stmt).first()

def create_entry(db: Session, entry: YearlyEntry) -> YearlyEntry:
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def update_entry(db: Session, entry: YearlyEntry) -> YearlyEntry:
    db.commit()
    db.refresh(entry)
    return entry

def delete_entry(db: Session, entry: YearlyEntry) -> None:
    db.delete(entry)
    db.commit()
