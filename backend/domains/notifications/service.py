"""Service del dominio Interactions — logica di business e messaggistica."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.domains.notifications import repository as repo
from backend.domains.notifications import schemas
from backend.domains.notifications.models import Interaction, SystemBroadcast
from backend.domains.users.models import User

_NOT_FOUND = "Elemento non trovato."

# Configurabile da superuser, per ora cablato. Se 0, cancella istantaneamente alla lettura.
EPHEMERAL_TTL_HOURS = 0


def _hydrate_interaction(db: Session, int_obj: Interaction) -> schemas.InteractionResponse:
    int_dict = schemas.InteractionResponse.model_validate(int_obj).model_dump()
    if int_obj.author_id:
        author = db.query(User).filter(User.id == int_obj.author_id).first()
        if author:
            int_dict["author_name"] = author.username
            int_dict["author_avatar"] = author.profile_picture_url
            
    if int_obj.interaction_type in ["SERIES_REVIEW_COMMENT", "SERIES_REVIEW_COMMENT_THREAD", "SERIES_REVIEW_MENTION"]:
        from backend.domains.trackers.models import UserSeriesLog, TMDBSeries
        log = db.query(UserSeriesLog).filter(UserSeriesLog.id == int_obj.reference_id).first()
        if log:
            series = db.query(TMDBSeries).filter(TMDBSeries.tmdb_id == log.series_tmdb_id).first()
            if series:
                int_dict["context_title"] = series.title
                int_dict["series_tmdb_id"] = series.tmdb_id
                
    elif int_obj.interaction_type in ["EPISODE_REVIEW_COMMENT", "EPISODE_REVIEW_COMMENT_THREAD", "EPISODE_REVIEW_MENTION"]:
        from backend.domains.trackers.models import UserEpisodeLog, TMDBEpisode, TMDBSeries
        log = db.query(UserEpisodeLog).filter(UserEpisodeLog.id == int_obj.reference_id).first()
        if log:
            ep = db.query(TMDBEpisode).filter(TMDBEpisode.id == log.episode_id).first()
            if ep:
                series = db.query(TMDBSeries).filter(TMDBSeries.tmdb_id == ep.series_tmdb_id).first()
                if series:
                    int_dict["context_title"] = f"S{ep.season_number}E{ep.episode_number} di {series.title}"
                    int_dict["series_tmdb_id"] = series.tmdb_id
                    int_dict["episode_id"] = log.episode_id

    elif int_obj.interaction_type in ["SEASON_REVIEW_COMMENT", "SEASON_REVIEW_COMMENT_THREAD", "SEASON_REVIEW_MENTION"]:
        from backend.domains.trackers.models import UserSeasonLog, TMDBSeries
        log = db.query(UserSeasonLog).filter(UserSeasonLog.id == int_obj.reference_id).first()
        if log:
            series = db.query(TMDBSeries).filter(TMDBSeries.tmdb_id == log.series_tmdb_id).first()
            if series:
                season_label = "Episodi Speciali" if log.season_number == 0 else f"Stagione {log.season_number}"
                int_dict["context_title"] = f"{season_label} di {series.title}"
                int_dict["series_tmdb_id"] = series.tmdb_id
                int_dict["season_number"] = log.season_number

    elif int_obj.interaction_type in ["MOVIE_REVIEW_COMMENT", "MOVIE_REVIEW_COMMENT_THREAD", "MOVIE_REVIEW_MENTION"]:
        from backend.domains.trackers.models import UserMovieLog, TMDBMovie
        log = db.query(UserMovieLog).filter(UserMovieLog.id == int_obj.reference_id).first()
        if log:
            movie = db.query(TMDBMovie).filter(TMDBMovie.tmdb_id == log.movie_tmdb_id).first()
            if movie:
                int_dict["context_title"] = movie.title
                int_dict["movie_tmdb_id"] = movie.tmdb_id
                    
    elif int_obj.interaction_type == "SHOPPING_GROUP_NEW_LIST":
        from backend.domains.shopping.models.lists import ShoppingList
        s_list = db.query(ShoppingList).filter(ShoppingList.id == int_obj.reference_id).first()
        if s_list:
            int_dict["context_title"] = s_list.name

    return schemas.InteractionResponse(**int_dict)

def list_interactions(
    db: Session,
    current_user: User,
    unread_only: bool = False,
    limit: Optional[int] = None,
) -> List[schemas.InteractionResponse]:
    interactions = repo.list_for_user(db, current_user.id, unread_only=unread_only, limit=limit)
    return [_hydrate_interaction(db, int_obj) for int_obj in interactions]


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
    result = repo.add(db, interaction)

    if payload.interaction_type in ["SERIES_REVIEW_COMMENT", "EPISODE_REVIEW_COMMENT", "SEASON_REVIEW_COMMENT", "MOVIE_REVIEW_COMMENT"]:
        import re
        # Extract @username mentions
        mentioned_usernames = re.findall(r'@([\w.-]+)', payload.content)
        
        if mentioned_usernames:
            mentioned_usernames = list(set(mentioned_usernames))
            mentioned_users = db.query(User).filter(User.username.in_(mentioned_usernames)).all()
            
            mention_type = payload.interaction_type.replace("_COMMENT", "_MENTION")
            
            for user in mentioned_users:
                # Do not notify the author or the direct recipient (who gets the main notification)
                if user.id != current_user.id and user.id != payload.recipient_id:
                    mention_int = Interaction(
                        interaction_type=mention_type,
                        author_id=current_user.id,
                        recipient_id=user.id,
                        reference_id=payload.reference_id,
                        content=f"Ti ha menzionato in un commento",
                        created_at=now_utc,
                        read_at=None,
                    )
                    db.add(mention_int)
            db.commit()
        
    return result


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

    return _hydrate_interaction(db, interaction)


def delete_interaction(
    db: Session,
    current_user: User,
    interaction_id: int,
) -> None:
    interaction = repo.get_owned(db, interaction_id, current_user.id)
    if not interaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=_NOT_FOUND)
    repo.delete(db, interaction)


def _hydrate_broadcast(db: Session, b: SystemBroadcast) -> schemas.SystemBroadcastResponse:
    author_name = None
    if b.created_by_id:
        author = db.query(User).filter(User.id == b.created_by_id).first()
        if author:
            author_name = author.username
    return schemas.SystemBroadcastResponse(
        id=b.id,
        title=b.title,
        message=b.message,
        level=b.level,
        show_popup=b.show_popup,
        is_active=b.is_active,
        created_at=b.created_at,
        expires_at=b.expires_at,
        created_by_id=b.created_by_id,
        created_by_name=author_name,
    )


def get_active_broadcast(db: Session) -> Optional[schemas.SystemBroadcastResponse]:
    """Restituisce l'avviso di sistema attualmente attivo."""
    broadcast = repo.get_active_broadcast(db)
    if not broadcast:
        return None
    return _hydrate_broadcast(db, broadcast)


def list_broadcasts(db: Session, limit: int = 50) -> List[schemas.SystemBroadcastResponse]:
    """Restituisce lo storico degli avvisi broadcast per il pannello admin."""
    items = repo.list_broadcasts(db, limit=limit)
    return [_hydrate_broadcast(db, b) for b in items]


def create_broadcast(
    db: Session,
    admin_user: User,
    payload: schemas.SystemBroadcastCreate,
) -> schemas.SystemBroadcastResponse:
    """Crea e attiva un avviso di sistema broadcast, disattivando eventuali precedenti."""
    now_utc = datetime.now(timezone.utc)

    # Disattiva eventuali avvisi precedenti ancora attivi
    db.query(SystemBroadcast).filter(SystemBroadcast.is_active == True).update({"is_active": False})

    broadcast = SystemBroadcast(
        title=payload.title,
        message=payload.message,
        level=payload.level.upper(),
        show_popup=payload.show_popup,
        is_active=True,
        created_at=now_utc,
        expires_at=payload.expires_at,
        created_by_id=admin_user.id,
    )
    db.add(broadcast)
    db.flush()

    if payload.send_inbox:
        # Invia una notifica di sistema permanente a tutti gli utenti attivi
        active_users = db.query(User).filter(User.deleted_at.is_(None)).all()
        for u in active_users:
            notif = Interaction(
                interaction_type="SYSTEM_ALERT",
                author_id=admin_user.id,
                recipient_id=u.id,
                reference_id=broadcast.id,
                content=f"[{payload.title}] {payload.message}",
                created_at=now_utc,
                read_at=None,
            )
            db.add(notif)

    db.commit()
    db.refresh(broadcast)
    return _hydrate_broadcast(db, broadcast)


def deactivate_broadcast(db: Session, broadcast_id: int) -> schemas.SystemBroadcastResponse:
    """Disattiva un avviso broadcast (es. a termine manutenzione)."""
    broadcast = repo.get_broadcast(db, broadcast_id)
    if not broadcast:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Avviso broadcast non trovato.")
    broadcast.is_active = False
    db.commit()
    db.refresh(broadcast)
    return _hydrate_broadcast(db, broadcast)


def delete_broadcast(db: Session, broadcast_id: int) -> None:
    """Elimina definitivamente un avviso broadcast dallo storico."""
    broadcast = repo.get_broadcast(db, broadcast_id)
    if not broadcast:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Avviso broadcast non trovato.")
    db.delete(broadcast)
    db.commit()

