"""Repository per le Interactions unificate."""
from typing import List, Optional
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.domains.notifications.models import Interaction


def list_for_user(
    db: Session,
    user_id: int,
    unread_only: bool = False,
    limit: int = 50,
) -> List[Interaction]:
    query = db.query(Interaction).filter(
        or_(
            Interaction.recipient_id == user_id,
            # Se ci sono altri criteri di visibilità, es. messaggi pubblici
        )
    )
    if unread_only:
        query = query.filter(Interaction.read_at.is_(None))

    return query.order_by(Interaction.created_at.desc()).limit(limit).all()


def get_owned(db: Session, interaction_id: int, user_id: int) -> Optional[Interaction]:
    """Ottiene una interazione solo se il destinatario o autore corrisponde all'utente."""
    return db.query(Interaction).filter(
        Interaction.id == interaction_id,
        or_(Interaction.recipient_id == user_id, Interaction.author_id == user_id)
    ).first()


def add(db: Session, obj: Interaction) -> Interaction:
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def save(db: Session, obj: Interaction) -> Interaction:
    db.commit()
    db.refresh(obj)
    return obj


def delete(db: Session, obj: Interaction) -> None:
    db.delete(obj)
    db.commit()


def delete_expired_ephemeral(db: Session, ttl_hours: int = 24) -> int:
    """Cancella i messaggi effimeri che hanno superato il TTL in ore dopo la lettura."""
    from sqlalchemy import text
    # In sqlite usiamo modifier, in postgres interval. 
    # Usiamo un approccio agnostico se possibile, ma per semplicità facciamo il check via python 
    # o query specifica in base al db. Per ora lo facciamo con raw sql compatibile SQLite/Postgres
    # (Oppure fetch & delete)
    # Questa funzione verrebbe chiamata da un cron job
    pass
