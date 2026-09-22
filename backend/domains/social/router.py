"""
Social domain router.
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List

from backend.core.database import SessionLocal
from backend.core.deps import get_current_user
from backend.domains.users.models import User
from backend.domains.social import service
from backend.domains.social.schemas import FriendshipResponse, FriendStatusResponse

router = APIRouter(prefix="/social", tags=["Social"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/friends/request/{addressee_id}", response_model=FriendshipResponse, status_code=status.HTTP_201_CREATED)
def send_friend_request(
    addressee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Invia una richiesta di amicizia a un utente."""
    return service.send_friend_request(db, current_user.id, addressee_id)


@router.post("/friends/accept/{requester_id}", response_model=FriendshipResponse)
def accept_friend_request(
    requester_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Accetta una richiesta di amicizia."""
    return service.accept_friend_request(db, current_user.id, requester_id)


@router.delete("/friends/{other_user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_friendship(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Rimuovi un amico o rifiuta una richiesta in sospeso."""
    service.remove_friendship(db, current_user.id, other_user_id)


@router.get("/friends", response_model=List[FriendshipResponse])
def get_friends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ottieni la lista degli amici confermati."""
    return service.get_friends(db, current_user.id)


@router.get("/friends/pending", response_model=List[FriendshipResponse])
def get_pending_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ottieni le richieste di amicizia ricevute in sospeso."""
    return service.get_pending_requests(db, current_user.id)


@router.get("/friends/pending/sent", response_model=List[FriendshipResponse])
def get_sent_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ottieni le richieste di amicizia inviate in sospeso."""
    return service.get_sent_requests(db, current_user.id)


@router.get("/search", response_model=List[FriendStatusResponse])
def search_users(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cerca utenti per username/email."""
    return service.search_users(db, current_user.id, q)
