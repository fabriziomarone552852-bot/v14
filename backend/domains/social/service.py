"""
Social domain service.
"""
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from fastapi import HTTPException, status
from datetime import datetime, timezone

from backend.domains.social.models import Friendship
from backend.domains.users.models import User
from backend.domains.social.schemas import FriendshipResponse, FriendStatusResponse
from backend.domains.users.schemas import UserPublicResponse

def send_friend_request(db: Session, requester_id: int, addressee_id: int) -> Friendship:
    if requester_id == addressee_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Non puoi inviare una richiesta di amicizia a te stesso."
        )

    # Check if target exists
    target = db.query(User).filter(User.id == addressee_id, User.deleted_at.is_(None)).first()
    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utente non trovato."
        )

    # Check existing relationship
    existing = db.query(Friendship).filter(
        or_(
            and_(Friendship.requester_id == requester_id, Friendship.addressee_id == addressee_id),
            and_(Friendship.requester_id == addressee_id, Friendship.addressee_id == requester_id)
        )
    ).first()

    if existing:
        if existing.status == "accepted":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Siete già amici."
            )
        elif existing.status == "blocked":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Non puoi inviare la richiesta a questo utente."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Esiste già una richiesta in sospeso."
            )

    new_friendship = Friendship(
        requester_id=requester_id,
        addressee_id=addressee_id,
        status="pending"
    )
    db.add(new_friendship)
    db.commit()
    db.refresh(new_friendship)
    return new_friendship

def accept_friend_request(db: Session, user_id: int, requester_id: int) -> Friendship:
    friendship = db.query(Friendship).filter(
        Friendship.requester_id == requester_id,
        Friendship.addressee_id == user_id,
        Friendship.status == "pending"
    ).first()

    if not friendship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Richiesta di amicizia non trovata o già gestita."
        )

    friendship.status = "accepted"
    db.commit()
    db.refresh(friendship)
    return friendship

def remove_friendship(db: Session, user_id: int, other_user_id: int) -> None:
    friendship = db.query(Friendship).filter(
        or_(
            and_(Friendship.requester_id == user_id, Friendship.addressee_id == other_user_id),
            and_(Friendship.requester_id == other_user_id, Friendship.addressee_id == user_id)
        )
    ).first()

    if not friendship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relazione non trovata."
        )

    db.delete(friendship)
    db.commit()

def get_friends(db: Session, user_id: int) -> list[Friendship]:
    return db.query(Friendship).filter(
        or_(
            Friendship.requester_id == user_id,
            Friendship.addressee_id == user_id
        ),
        Friendship.status == "accepted"
    ).all()

def get_pending_requests(db: Session, user_id: int) -> list[Friendship]:
    return db.query(Friendship).filter(
        Friendship.addressee_id == user_id,
        Friendship.status == "pending"
    ).all()

def get_sent_requests(db: Session, user_id: int) -> list[Friendship]:
    return db.query(Friendship).filter(
        Friendship.requester_id == user_id,
        Friendship.status == "pending"
    ).all()

def search_users(db: Session, current_user_id: int, query: str) -> list[FriendStatusResponse]:
    if len(query) < 2:
        return []

    users = db.query(User).filter(
        User.username.ilike(query),
        User.id != current_user_id,
        User.deleted_at.is_(None)
    ).limit(20).all()

    results = []
    for u in users:
        rel = db.query(Friendship).filter(
            or_(
                and_(Friendship.requester_id == current_user_id, Friendship.addressee_id == u.id),
                and_(Friendship.requester_id == u.id, Friendship.addressee_id == current_user_id)
            )
        ).first()

        status_str = "none"
        if rel:
            if rel.status == "accepted":
                status_str = "accepted"
            elif rel.status == "blocked":
                status_str = "blocked"
            elif rel.status == "pending":
                if rel.requester_id == current_user_id:
                    status_str = "pending_sent"
                else:
                    status_str = "pending_received"

        if status_str != "blocked":
            results.append(
                FriendStatusResponse(
                    user=UserPublicResponse.model_validate(u),
                    status=status_str
                )
            )

    return results
