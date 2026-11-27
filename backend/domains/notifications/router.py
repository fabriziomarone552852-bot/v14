from typing import List, Optional

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
    limit: Optional[int] = Query(None, ge=1, le=1000),
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


@router.get("/broadcast/active", response_model=Optional[schemas.SystemBroadcastResponse])
def get_active_system_broadcast(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Restituisce l'avviso di sistema attualmente attivo per tutti gli utenti."""
    return service.get_active_broadcast(db)


@router.get("/push-tokens/status", response_model=schemas.PushStatusResponse)
def get_push_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Restituisce lo stato di configurazione Firebase e i dispositivi Android registrati."""
    return service.get_push_status(db, current_user)


@router.post("/push-tokens", response_model=schemas.PushTokenResponse, status_code=status.HTTP_201_CREATED)
def register_push_token(
    payload: schemas.PushTokenRegisterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Registra o aggiorna il token FCM del dispositivo corrente per le notifiche push."""
    return service.register_push_token(db, current_user, payload)


@router.delete("/push-tokens", status_code=status.HTTP_204_NO_CONTENT)
def unregister_push_token(
    token: str = Query(..., min_length=10, max_length=512),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Disattiva un token push FCM (tipicamente al logout)."""
    service.unregister_push_token(db, current_user, token)


@router.post("/push-tokens/test", response_model=schemas.PushTestResponse)
def send_test_push_notification(
    payload: Optional[schemas.PushTestRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Invia una notifica push di test immediata ai dispositivi dell'utente."""
    return service.send_test_push(db, current_user, payload)


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
