"""Repository del dominio Events — solo accesso ai dati."""
from typing import List, Optional, Tuple

from sqlalchemy.orm import Session, selectinload

from backend.domains.events.models import Event


def get_owned(db: Session, event_id: int, user_id: int) -> Optional[Event]:
    return (
        db.query(Event)
        .filter(Event.id == event_id, Event.user_id == user_id)
        .first()
    )


def get_with_category(db: Session, event_id: int) -> Optional[Event]:
    return (
        db.query(Event)
        .options(selectinload(Event.category))
        .filter(Event.id == event_id)
        .first()
    )


def list_filtered(
    db: Session,
    user_id: int,
    *,
    titolo: Optional[str] = None,
    descrizione: Optional[str] = None,
    luogo: Optional[str] = None,
    user_category_id: Optional[int] = None,
    tutto_il_giorno: Optional[bool] = None,
    limit: Optional[int] = None,
    offset: Optional[int] = None,
) -> Tuple[int, List[Event]]:
    query = (
        db.query(Event)
        .filter(Event.user_id == user_id)
        .options(selectinload(Event.category))
    )

    if titolo:
        query = query.filter(Event.titolo.ilike(f"%{titolo}%"))
    if descrizione:
        query = query.filter(Event.descrizione.ilike(f"%{descrizione}%"))
    if luogo:
        query = query.filter(Event.luogo.ilike(f"%{luogo}%"))
    if user_category_id is not None:
        query = query.filter(Event.user_category_id == user_category_id)
    if tutto_il_giorno is not None:
        query = query.filter(Event.tutto_il_giorno == tutto_il_giorno)

    total = query.count()
    query = query.order_by(Event.data_inizio.asc())
    if offset is not None:
        query = query.offset(offset)
    if limit is not None:
        query = query.limit(limit)
    events = query.all()
    return total, events


def add(db: Session, event: Event) -> Event:
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def commit(db: Session) -> None:
    db.commit()


def delete(db: Session, event: Event) -> None:
    db.delete(event)
    db.commit()