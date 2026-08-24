from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from backend.domains.monthly_entries.models import MonthlyEntry

def list_entries(
    db: Session,
    user_id: int,
    year: Optional[int] = None,
    month: Optional[int] = None,
    monthly_type: Optional[str] = None
) -> list[MonthlyEntry]:
    stmt = select(MonthlyEntry).where(MonthlyEntry.user_id == user_id)
    
    if year is not None:
        stmt = stmt.where(MonthlyEntry.year == year)
    if month is not None:
        stmt = stmt.where(MonthlyEntry.month == month)
    if monthly_type is not None:
        stmt = stmt.where(MonthlyEntry.monthly_type == monthly_type)
        
    stmt = stmt.order_by(MonthlyEntry.year.desc(), MonthlyEntry.month.desc(), MonthlyEntry.id.desc())
    return list(db.scalars(stmt).all())

def get_entry(db: Session, entry_id: int, user_id: int) -> Optional[MonthlyEntry]:
    stmt = select(MonthlyEntry).where(
        MonthlyEntry.id == entry_id,
        MonthlyEntry.user_id == user_id
    )
    return db.scalars(stmt).first()

def get_entry_by_key(
    db: Session,
    user_id: int,
    year: int,
    month: int,
    monthly_type: str
) -> Optional[MonthlyEntry]:
    stmt = select(MonthlyEntry).where(
        MonthlyEntry.user_id == user_id,
        MonthlyEntry.year == year,
        MonthlyEntry.month == month,
        MonthlyEntry.monthly_type == monthly_type
    )
    return db.scalars(stmt).first()

def create_entry(db: Session, entry: MonthlyEntry) -> MonthlyEntry:
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def update_entry(db: Session, entry: MonthlyEntry) -> MonthlyEntry:
    db.commit()
    db.refresh(entry)
    return entry

def delete_entry(db: Session, entry: MonthlyEntry) -> None:
    db.delete(entry)
    db.commit()
