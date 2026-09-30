"""Router del dominio Interactions (sostituisce Notifications)."""
from typing import List

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.core.deps import get_db
from backend.core.deps import get_current_user
from backend.domains.notifications import schemas, service
from backend.domains.users.models import User

# Manteniamo per ora /notifications nel path per retrocompatibilità o lo cambiamo?
# Cambiamolo a /interactions per coerenza con il nuovo sistema.
router = APIRouter(prefix="/interactions", tags=["Interactions"])


@router.get("", response_model=List[schemas.InteractionResponse])
def get_interactions(
    unread_only: bool = Query(False, description="Filtra solo gli elementi non letti"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Restituisce le interazioni (messaggi, commenti, notifiche) per l'utente."""
    return service.list_interactions(
        db=db,
        current_user=current_user,
        unread_only=unread_only,
        limit=limit,
    )


@router.post("", response_model=schemas.InteractionResponse, status_code=status.HTTP_201_CREATED)
def create_interaction(
    payload: schemas.InteractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Crea una nuova interazione (es. Invia un messaggio effimero)."""
    return service.create_interaction(db, current_user, payload)


@router.get("/{interaction_id}", response_model=schemas.InteractionResponse)
def read_interaction(
    interaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Legge una specifica interazione. 
    Se è un messaggio effimero (TTL=0), questo endpoint causerà l'autodistruzione istantanea
    del messaggio dal database dopo averlo restituito per la lettura!
    """
    return service.read_interaction(db, current_user, interaction_id)


@router.delete("/{interaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interaction(
    interaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Elimina manualmente una interazione."""
    service.delete_interaction(db, current_user, interaction_id)
