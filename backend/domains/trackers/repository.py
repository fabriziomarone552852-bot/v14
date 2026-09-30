"""
Repository for Trackers domain.
"""
from typing import List, Optional, Tuple, Sequence
from datetime import datetime
from sqlalchemy import select, delete, and_, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session, selectinload

from backend.domains.trackers.models import TMDBSeries, TMDBEpisode, UserSeriesTracking, UserEpisodeLog, TVQuote, UserSeriesLog


def get_user_series_tracking(db: Session, tmdb_id: int, user_id: int) -> Optional[UserSeriesTracking]:
    stmt = (
        select(UserSeriesTracking)
        .where(UserSeriesTracking.series_tmdb_id == tmdb_id, UserSeriesTracking.user_id == user_id)
        .options(selectinload(UserSeriesTracking.tmdb_series))
    )
    return db.execute(stmt).scalar_one_or_none()


def list_user_series(db: Session, user_id: int) -> Sequence[UserSeriesTracking]:
    stmt = (
        select(UserSeriesTracking)
        .where(UserSeriesTracking.user_id == user_id)
        .options(selectinload(UserSeriesTracking.tmdb_series))
    )
    return db.execute(stmt).scalars().all()


def add_user_series_tracking(db: Session, tracking: UserSeriesTracking) -> UserSeriesTracking:
    db.add(tracking)
    db.commit()
    db.refresh(tracking)
    return tracking


def update_user_series_tracking(db: Session, tracking: UserSeriesTracking) -> UserSeriesTracking:
    db.commit()
    db.refresh(tracking)
    return tracking


def delete_user_series_tracking(db: Session, tracking: UserSeriesTracking) -> None:
    db.delete(tracking)
    db.commit()


def get_tmdb_series(db: Session, tmdb_id: int) -> Optional[TMDBSeries]:
    stmt = select(TMDBSeries).where(TMDBSeries.tmdb_id == tmdb_id)
    return db.execute(stmt).scalar_one_or_none()


def upsert_tmdb_series(db: Session, series: TMDBSeries) -> TMDBSeries:
    merged = db.merge(series)
    db.commit()
    db.refresh(merged)
    return merged


def upsert_tmdb_episodes(db: Session, episodes: List[TMDBEpisode]) -> None:
    for ep in episodes:
        # Simplistic merge for now, or could use dialet-specific insert ON CONFLICT
        # We will check if it exists by series_tmdb_id, season_number, episode_number
        stmt = select(TMDBEpisode).where(
            TMDBEpisode.series_tmdb_id == ep.series_tmdb_id,
            TMDBEpisode.season_number == ep.season_number,
            TMDBEpisode.episode_number == ep.episode_number
        )
        existing = db.execute(stmt).scalar_one_or_none()
        if existing:
            existing.title = ep.title
            existing.overview = ep.overview
            existing.air_date = ep.air_date
            existing.still_path = ep.still_path
            existing.vote_average = ep.vote_average
        else:
            db.add(ep)
    db.commit()


def get_series_episodes_with_user_tracking(db: Session, tmdb_id: int, user_id: int) -> List[Tuple[TMDBEpisode, List[UserEpisodeLog], List["TVQuote"]]]:
    from backend.domains.trackers.models import TVQuote
    # Restituisce gli episodi globali.
    stmt_episodes = (
        select(TMDBEpisode)
        .where(TMDBEpisode.series_tmdb_id == tmdb_id)
        .order_by(TMDBEpisode.season_number.asc(), TMDBEpisode.episode_number.asc())
    )
    episodes = db.execute(stmt_episodes).scalars().all()
    
    # Restituisce tutti i log utente per gli episodi di questa serie.
    stmt_logs = (
        select(UserEpisodeLog)
        .join(TMDBEpisode, TMDBEpisode.id == UserEpisodeLog.episode_id)
        .where(TMDBEpisode.series_tmdb_id == tmdb_id, UserEpisodeLog.user_id == user_id)
        .order_by(UserEpisodeLog.watched_at.desc())
    )
    logs = db.execute(stmt_logs).scalars().all()
    
    # Restituisce tutti i quote utente per gli episodi di questa serie.
    stmt_quotes = (
        select(TVQuote)
        .join(TMDBEpisode, TMDBEpisode.id == TVQuote.episode_id)
        .where(TMDBEpisode.series_tmdb_id == tmdb_id, TVQuote.user_id == user_id)
        .order_by(TVQuote.created_at.desc())
    )
    quotes = db.execute(stmt_quotes).scalars().all()
    
    # Raggruppa i log in memoria
    from collections import defaultdict
    logs_by_episode = defaultdict(list)
    for log in logs:
        logs_by_episode[log.episode_id].append(log)
        
    quotes_by_episode = defaultdict(list)
    for quote in quotes:
        quotes_by_episode[quote.episode_id].append(quote)
        
    return [(ep, logs_by_episode.get(ep.id, []), quotes_by_episode.get(ep.id, [])) for ep in episodes]


def mark_episode_watched(db: Session, user_id: int, episode_id: int) -> UserEpisodeLog:
    # Aggiunge sempre un nuovo log (Rewatch)
    tracking = UserEpisodeLog(user_id=user_id, episode_id=episode_id)
    db.add(tracking)
    db.commit()
    db.refresh(tracking)
    return tracking

def mark_all_episodes_watched(db: Session, user_id: int, tmdb_series_id: int) -> None:
    # Get all episodes for the series
    stmt = select(TMDBEpisode).where(TMDBEpisode.series_tmdb_id == tmdb_series_id)
    episodes = db.execute(stmt).scalars().all()
    
    # Get existing logs
    logs_stmt = select(UserEpisodeLog.episode_id).where(UserEpisodeLog.user_id == user_id)
    existing_episode_ids = set(db.execute(logs_stmt).scalars().all())
    
    # Create logs only for unwatched episodes
    new_logs = []
    for ep in episodes:
        if ep.id not in existing_episode_ids:
            new_logs.append(UserEpisodeLog(user_id=user_id, episode_id=ep.id))
            
    if new_logs:
        db.add_all(new_logs)
        db.commit()


def mark_episode_unwatched(db: Session, user_id: int, episode_id: int) -> None:
    # Elimina solo l'ultimo log (decrementa rewatch)
    stmt = (
        select(UserEpisodeLog)
        .where(UserEpisodeLog.user_id == user_id, UserEpisodeLog.episode_id == episode_id)
        .order_by(UserEpisodeLog.watched_at.desc())
        .limit(1)
    )
    latest_log = db.execute(stmt).scalar_one_or_none()
    if latest_log:
        db.delete(latest_log)
        db.commit()


def get_upcoming_episodes(db: Session, user_id: int) -> List[Tuple[TMDBEpisode, TMDBSeries]]:
    """Restituisce i prossimi episodi in uscita per le serie seguite dall'utente."""
    from datetime import date
    stmt = (
        select(TMDBEpisode, TMDBSeries)
        .join(TMDBSeries, TMDBSeries.tmdb_id == TMDBEpisode.series_tmdb_id)
        .join(UserSeriesTracking, UserSeriesTracking.series_tmdb_id == TMDBSeries.tmdb_id)
        .where(
            UserSeriesTracking.user_id == user_id,
            TMDBEpisode.air_date >= date.today(),
            UserSeriesTracking.status.in_(["watching", "to_watch", "waiting"])
        )
        .order_by(TMDBEpisode.air_date.asc())
        .limit(10)
    )
    return list(db.execute(stmt).all())


def get_user_quotes_extended(db: Session, user_id: int) -> List[Tuple[TVQuote, TMDBEpisode, TMDBSeries]]:
    stmt = (
        select(TVQuote, TMDBEpisode, TMDBSeries)
        .join(TMDBEpisode, TMDBEpisode.id == TVQuote.episode_id)
        .join(TMDBSeries, TMDBSeries.tmdb_id == TMDBEpisode.series_tmdb_id)
        .where(TVQuote.user_id == user_id)
        .order_by(TVQuote.created_at.desc())
    )
    return list(db.execute(stmt).all())


def get_dashboard_stats(db: Session, user_id: int) -> dict:
    """Ritorna: statistiche annuali e i 3 indicatori top bar."""
    from sqlalchemy import func
    from datetime import datetime
    
    current_year = datetime.now().year
    
    ep_count = db.scalar(
        select(func.count(UserEpisodeLog.id))
        .where(
            UserEpisodeLog.user_id == user_id,
            func.extract('year', UserEpisodeLog.watched_at) == current_year
        )
    ) or 0
    
    series_comp = db.scalar(
        select(func.count(UserSeriesTracking.id))
        .where(
            UserSeriesTracking.user_id == user_id,
            UserSeriesTracking.status == "watched",
            func.extract('year', UserSeriesTracking.updated_at) == current_year
        )
    ) or 0
    
    total_series = db.scalar(
        select(func.count(UserSeriesTracking.id))
        .where(UserSeriesTracking.user_id == user_id)
    ) or 0
    
    # Ultima Aggiunta
    last_added = db.execute(
        select(TMDBSeries.title)
        .join(UserSeriesTracking, UserSeriesTracking.series_tmdb_id == TMDBSeries.tmdb_id)
        .where(UserSeriesTracking.user_id == user_id)
        .order_by(UserSeriesTracking.added_at.desc())
        .limit(1)
    ).scalar_one_or_none()
    
    # Ultimo Episodio
    last_ep = db.execute(
        select(TMDBSeries.title, TMDBEpisode.season_number, TMDBEpisode.episode_number)
        .join(TMDBEpisode, TMDBEpisode.series_tmdb_id == TMDBSeries.tmdb_id)
        .join(UserEpisodeLog, UserEpisodeLog.episode_id == TMDBEpisode.id)
        .where(UserEpisodeLog.user_id == user_id)
        .order_by(UserEpisodeLog.watched_at.desc())
        .limit(1)
    ).first()
    
    last_ep_str = f"{last_ep[0]} S{last_ep[1]:02}E{last_ep[2]:02}" if last_ep else None
    
    # Ultima Completata
    last_completed = db.execute(
        select(TMDBSeries.title)
        .join(UserSeriesTracking, UserSeriesTracking.series_tmdb_id == TMDBSeries.tmdb_id)
        .where(UserSeriesTracking.user_id == user_id, UserSeriesTracking.status == "watched")
        .order_by(UserSeriesTracking.updated_at.desc())
        .limit(1)
    ).scalar_one_or_none()
    
    return {
        "ep_count": ep_count,
        "series_comp": series_comp,
        "total_series": total_series,
        "last_added": last_added,
        "last_ep": last_ep_str,
        "last_completed": last_completed
    }

from backend.domains.trackers.models import MediaList, MediaListItem

def get_media_lists(db: Session, user_id: int) -> Sequence[MediaList]:
    stmt = (
        select(MediaList)
        .where(MediaList.user_id == user_id)
        .options(selectinload(MediaList.items).selectinload(MediaListItem.series))
        .order_by(MediaList.created_at.desc())
    )
    return db.execute(stmt).scalars().all()

def get_media_list(db: Session, list_id: int, user_id: int) -> Optional[MediaList]:
    stmt = (
        select(MediaList)
        .where(MediaList.id == list_id, MediaList.user_id == user_id)
        .options(selectinload(MediaList.items).selectinload(MediaListItem.series))
    )
    return db.execute(stmt).scalar_one_or_none()

def create_media_list(db: Session, media_list: MediaList) -> MediaList:
    db.add(media_list)
    db.commit()
    db.refresh(media_list)
    return media_list

def update_media_list(db: Session, media_list: MediaList) -> MediaList:
    db.commit()
    db.refresh(media_list)
    return media_list

def delete_media_list(db: Session, media_list: MediaList) -> None:
    db.delete(media_list)
    db.commit()

def add_item_to_media_list(db: Session, item: MediaListItem) -> MediaListItem:
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

def delete_item_from_media_list(db: Session, item: MediaListItem) -> None:
    db.delete(item)
    db.commit()

def get_media_list_item(db: Session, item_id: int) -> Optional[MediaListItem]:
    stmt = select(MediaListItem).where(MediaListItem.id == item_id)
    return db.execute(stmt).scalar_one_or_none()

from backend.domains.social.models import Friendship
from backend.domains.notifications.models import Interaction
from backend.domains.users.models import User

def get_friends_series_logs(db: Session, current_user_id: int, tmdb_id: int) -> List[dict]:
    from sqlalchemy import or_
    friendships = db.query(Friendship).filter(
        or_(
            Friendship.requester_id == current_user_id,
            Friendship.addressee_id == current_user_id
        ),
        Friendship.status == 'accepted'
    ).all()
    
    friend_ids = [
        f.addressee_id if f.requester_id == current_user_id else f.requester_id
        for f in friendships
    ]
    
    if not friend_ids:
        return []
    
    stmt = (
        select(UserSeriesTracking, User, UserSeriesLog)
        .join(User, User.id == UserSeriesTracking.user_id)
        .outerjoin(UserSeriesLog, (UserSeriesLog.user_id == UserSeriesTracking.user_id) & (UserSeriesLog.series_tmdb_id == UserSeriesTracking.series_tmdb_id))
        .where(
            UserSeriesTracking.series_tmdb_id == tmdb_id,
            UserSeriesTracking.user_id.in_(friend_ids)
        )
    )
    results = db.execute(stmt).all()
    
    logs_data = []
    for tracking, user, log in results:
        comments_list = []
        if log:
            comments_stmt = (
                select(Interaction, User)
                .join(User, User.id == Interaction.author_id)
                .where(
                    Interaction.interaction_type == "SERIES_REVIEW_COMMENT",
                    Interaction.reference_id == log.id
                )
                .order_by(Interaction.created_at.asc())
            )
            comments_res = db.execute(comments_stmt).all()
            comments_list = [
                {
                    "id": str(c_int.id),
                    "author_id": str(c_user.id),
                    "author_name": c_user.username,
                    "author_avatar": c_user.profile_picture_url,
                    "text": c_int.content,
                    "created_at": c_int.created_at.isoformat()
                }
                for c_int, c_user in comments_res
            ]
        
        updated_date_str = ""
        if log and log.updated_at:
            updated_date_str = log.updated_at.isoformat()
        elif tracking.updated_at:
            updated_date_str = tracking.updated_at.isoformat()
        elif tracking.added_at:
            updated_date_str = tracking.added_at.isoformat()

        logs_data.append({
            "id": log.id if log else -tracking.id,
            "friend_id": user.id,
            "friend_name": user.username,
            "friend_avatar": user.profile_picture_url,
            "status": tracking.status,
            "rating": log.rating if log else None,
            "notes": log.notes if log and log.review_visibility != "private" else None,
            "review_visibility": log.review_visibility if log else "friends_only",
            "updated_at": updated_date_str,
            "comments": comments_list if log and log.review_visibility != "private" else []
        })
        
    return logs_data

def get_friends_episode_logs(db: Session, current_user_id: int, episode_id: int) -> List[dict]:
    friend_ids_q1 = select(Friendship.addressee_id).where(
        Friendship.requester_id == current_user_id, Friendship.status == 'accepted'
    )
    friend_ids_q2 = select(Friendship.requester_id).where(
        Friendship.addressee_id == current_user_id, Friendship.status == 'accepted'
    )
    
    stmt = (
        select(UserEpisodeLog, User)
        .join(User, User.id == UserEpisodeLog.user_id)
        .where(
            UserEpisodeLog.episode_id == episode_id,
            UserEpisodeLog.user_id.in_(friend_ids_q1.union(friend_ids_q2))
        )
    )
    results = db.execute(stmt).all()
    
    logs_data = []
    for tracking, user in results:
        comments_stmt = (
            select(Interaction, User)
            .join(User, User.id == Interaction.author_id)
            .where(
                Interaction.interaction_type == "EPISODE_REVIEW_COMMENT",
                Interaction.reference_id == tracking.id
            )
            .order_by(Interaction.created_at.asc())
        )
        comments_result = db.execute(comments_stmt).all()
        
        comments_list = []
        for interaction, author in comments_result:
            comments_list.append({
                "id": interaction.id,
                "author_id": author.id,
                "author_name": author.username,
                "author_avatar": author.profile_picture_url,
                "text": interaction.content,
                "created_at": interaction.created_at,
            })
            
        logs_data.append({
            "id": tracking.id,
            "friend_id": user.id,
            "friend_name": user.username,
            "friend_avatar": user.profile_picture_url,
            "rating": tracking.rating,
            "notes": tracking.notes if tracking.review_visibility != "private" else None,
            "review_visibility": tracking.review_visibility,
            "watched_at": tracking.watched_at,
            "comments": comments_list if tracking.review_visibility != "private" else [],
        })
        
    return logs_data




