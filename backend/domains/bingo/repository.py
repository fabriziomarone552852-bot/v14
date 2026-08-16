from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from backend.domains.bingo.models import BingoEntry

def list_entries(db: Session, user_id: int, year: int) -> list[BingoEntry]:
    stmt = select(BingoEntry).where(
        BingoEntry.user_id == user_id,
        BingoEntry.year == year
    ).order_by(BingoEntry.posizione.asc().nulls_last(), BingoEntry.id.asc())
    return list(db.scalars(stmt).all())

def get_entry(db: Session, entry_id: int, user_id: int) -> Optional[BingoEntry]:
    stmt = select(BingoEntry).where(
        BingoEntry.id == entry_id,
        BingoEntry.user_id == user_id
    )
    return db.scalars(stmt).first()

def count_by_year(db: Session, user_id: int, year: int) -> int:
    stmt = select(func.count()).select_from(BingoEntry).where(
        BingoEntry.user_id == user_id,
        BingoEntry.year == year
    )
    return db.scalar(stmt) or 0

def create_entry(db: Session, entry: BingoEntry) -> BingoEntry:
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def update_entry(db: Session, entry: BingoEntry) -> BingoEntry:
    db.commit()
    db.refresh(entry)
    return entry

def delete_entry(db: Session, entry: BingoEntry) -> None:
    db.delete(entry)
    db.commit()
