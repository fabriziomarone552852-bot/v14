"""Repository per le Interactions unificate."""
from typing import List, Optional
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.domains.notifications.models import DevicePushToken, Interaction, SystemBroadcast


def list_for_user(
    db: Session,
    user_id: int,
    unread_only: bool = False,
    limit: Optional[int] = None,
) -> List[Interaction]:
    query = db.query(Interaction).filter(
        or_(
            Interaction.recipient_id == user_id,
            # Se ci sono altri criteri di visibilità, es. messaggi pubblici
        ),
        or_(
            Interaction.author_id != user_id,
            Interaction.author_id.is_(None)
        )
    )
    if unread_only:
        query = query.filter(Interaction.read_at.is_(None))

    query = query.order_by(Interaction.created_at.desc())
    if limit is not None:
        query = query.limit(limit)
    return query.all()


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


def get_active_broadcast(db: Session) -> Optional[SystemBroadcast]:
    """Restituisce l'avviso di sistema attivo e non ancora scaduto."""
    now_utc = datetime.now(timezone.utc)
    return (
        db.query(SystemBroadcast)
        .filter(
            SystemBroadcast.is_active == True,
            or_(SystemBroadcast.expires_at.is_(None), SystemBroadcast.expires_at > now_utc),
        )
        .order_by(SystemBroadcast.created_at.desc())
        .first()
    )


def list_broadcasts(db: Session, limit: int = 50) -> List[SystemBroadcast]:
    """Restituisce lo storico degli avvisi broadcast."""
    return (
        db.query(SystemBroadcast)
        .order_by(SystemBroadcast.created_at.desc())
        .limit(limit)
        .all()
    )


def get_broadcast(db: Session, broadcast_id: int) -> Optional[SystemBroadcast]:
    return db.query(SystemBroadcast).filter(SystemBroadcast.id == broadcast_id).first()


def add_broadcast(db: Session, obj: SystemBroadcast) -> SystemBroadcast:
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def upsert_push_token(
    db: Session,
    user_id: int,
    token: str,
    platform: str = "android",
    device_name: Optional[str] = None,
) -> DevicePushToken:
    """Registra o aggiorna un token FCM, riassegnandolo all'utente corrente in caso di cambio account."""
    now_utc = datetime.now(timezone.utc)
    existing = db.query(DevicePushToken).filter(DevicePushToken.token == token).first()
    if existing:
        existing.user_id = user_id
        existing.platform = platform
        if device_name is not None:
            existing.device_name = device_name
        existing.is_active = True
        existing.updated_at = now_utc
        existing.last_used_at = now_utc
        db.commit()
        db.refresh(existing)
        return existing

    obj = DevicePushToken(
        user_id=user_id,
        token=token,
        platform=platform,
        device_name=device_name,
        is_active=True,
        created_at=now_utc,
        updated_at=now_utc,
        last_used_at=now_utc,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def deactivate_push_token(db: Session, token: str, user_id: Optional[int] = None) -> bool:
    """Disattiva un token push (es. al logout). Ritorna True se trovato."""
    query = db.query(DevicePushToken).filter(DevicePushToken.token == token)
    if user_id is not None:
        query = query.filter(DevicePushToken.user_id == user_id)
    obj = query.first()
    if not obj:
        return False
    obj.is_active = False
    obj.updated_at = datetime.now(timezone.utc)
    db.commit()
    return True


def deactivate_push_tokens_bulk(db: Session, tokens: List[str]) -> int:
    """Disattiva in blocco token FCM non più validi o disinstallati."""
    if not tokens:
        return 0
    now_utc = datetime.now(timezone.utc)
    updated = (
        db.query(DevicePushToken)
        .filter(DevicePushToken.token.in_(tokens))
        .update({"is_active": False, "updated_at": now_utc}, synchronize_session=False)
    )
    db.commit()
    return int(updated)


def list_user_push_tokens(db: Session, user_id: int, active_only: bool = True) -> List[DevicePushToken]:
    query = db.query(DevicePushToken).filter(DevicePushToken.user_id == user_id)
    if active_only:
        query = query.filter(DevicePushToken.is_active == True)
    return query.order_by(DevicePushToken.updated_at.desc()).all()


def list_active_push_tokens_for_users(db: Session, user_ids: List[int]) -> List[str]:
    """Restituisce la lista univoca dei token FCM attivi per uno o più utenti."""
    if not user_ids:
        return []
    rows = (
        db.query(DevicePushToken.token)
        .filter(
            DevicePushToken.user_id.in_(user_ids),
            DevicePushToken.is_active == True,
        )
        .all()
    )
    return list({r[0] for r in rows if r[0]})


