"""
Repository for Trackers domain.
"""
from typing import List, Optional, Tuple, Sequence
from datetime import datetime
from sqlalchemy import select, delete, and_, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session, selectinload

from backend.domains.trackers.models import TMDBSeries, TMDBEpisode, UserSeriesTracking, UserEpisodeLog, TVQuote


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
    db.merge(series)
    db.commit()
    return series


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
        else:
            db.add(ep)
    db.commit()


def get_series_episodes_with_user_tracking(db: Session, tmdb_id: int, user_id: int) -> List[Tuple[TMDBEpisode, List[UserEpisodeLog]]]:
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
    
    # Raggruppa i log in memoria
    from collections import defaultdict
    logs_by_episode = defaultdict(list)
    for log in logs:
        logs_by_episode[log.episode_id].append(log)
        
    return [(ep, logs_by_episode.get(ep.id, [])) for ep in episodes]


def mark_episode_watched(db: Session, user_id: int, episode_id: int) -> UserEpisodeLog:
    # Aggiunge sempre un nuovo log (Rewatch)
    tracking = UserEpisodeLog(user_id=user_id, episode_id=episode_id)
    db.add(tracking)
    db.commit()
    db.refresh(tracking)
    return tracking


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
