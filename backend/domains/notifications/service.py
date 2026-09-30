"""Service del dominio Interactions — logica di business e messaggistica."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.domains.notifications import repository as repo
from backend.domains.notifications import schemas
from backend.domains.notifications.models import Interaction
from backend.domains.users.models import User

_NOT_FOUND = "Elemento non trovato."

# Configurabile da superuser, per ora cablato. Se 0, cancella istantaneamente alla lettura.
EPHEMERAL_TTL_HOURS = 0


def list_interactions(
    db: Session,
    current_user: User,
    unread_only: bool = False,
    limit: int = 50,
) -> List[Interaction]:
    return repo.list_for_user(db, current_user.id, unread_only=unread_only, limit=limit)


def create_interaction(
    db: Session,
    current_user: User,
    payload: schemas.InteractionCreate,
) -> Interaction:
    now_utc = datetime.now(timezone.utc)
    interaction = Interaction(
        interaction_type=payload.interaction_type,
        author_id=current_user.id,
        recipient_id=payload.recipient_id,
        reference_id=payload.reference_id,
        content=payload.content,
        created_at=now_utc,
        read_at=None,
    )
    return repo.add(db, interaction)


def read_interaction(
    db: Session,
    current_user: User,
    interaction_id: int,
) -> Interaction:
    """Legge un'interazione, impostando read_at e applicando la logica di autodistruzione."""
    interaction = repo.get_owned(db, interaction_id, current_user.id)
    if not interaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=_NOT_FOUND)

    # Se non era mai stato letto, marca ora
    if interaction.read_at is None:
        interaction.read_at = datetime.now(timezone.utc)
        
        # Logica "Burn After Reading"
        if interaction.interaction_type == "EPHEMERAL_MSG":
            if EPHEMERAL_TTL_HOURS == 0:
                # Facciamo una copia in memoria per restituirla al frontend
                content = interaction.content
                interaction_type = interaction.interaction_type
                created_at = interaction.created_at
                
                # Distruzione immediata nel DB
                repo.delete(db, interaction)
                
                # Restituiamo un oggetto fake o ricostruito per l'ultima visione
                return Interaction(
                    id=interaction_id,
                    interaction_type=interaction_type,
                    author_id=interaction.author_id,
                    recipient_id=current_user.id,
                    content=content,
                    created_at=created_at,
                    read_at=interaction.read_at
                )
            else:
                # Se c'è un TTL > 0, si salva e ci penserà un job cron a cancellarlo
                interaction = repo.save(db, interaction)
        else:
            # Commenti o altro: salva solo il read_at
            interaction = repo.save(db, interaction)

    return interaction


def delete_interaction(
    db: Session,
    current_user: User,
    interaction_id: int,
) -> None:
    interaction = repo.get_owned(db, interaction_id, current_user.id)
    if not interaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=_NOT_FOUND)
    repo.delete(db, interaction)
