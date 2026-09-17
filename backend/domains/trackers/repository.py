"""
Repository for Trackers domain.
"""
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from backend.domains.trackers.models import TVSeries, TVEpisode, TVQuote
from backend.domains.users.models import User


def get_series_by_id(db: Session, series_id: int, user_id: int) -> Optional[TVSeries]:
    stmt = (
        select(TVSeries)
        .where(TVSeries.id == series_id, TVSeries.user_id == user_id)
        .options(selectinload(TVSeries.episodes), selectinload(TVSeries.quotes))
    )
    return db.execute(stmt).scalar_one_or_none()


def get_series_by_tmdb_id(db: Session, tmdb_id: int, user_id: int) -> Optional[TVSeries]:
    stmt = (
        select(TVSeries)
        .where(TVSeries.tmdb_id == tmdb_id, TVSeries.user_id == user_id)
        .options(selectinload(TVSeries.episodes))
    )
    return db.execute(stmt).scalar_one_or_none()


def list_series(db: Session, user_id: int) -> List[TVSeries]:
    stmt = (
        select(TVSeries)
        .where(TVSeries.user_id == user_id)
        .order_by(TVSeries.title.asc())
        .options(selectinload(TVSeries.episodes))
    )
    return list(db.execute(stmt).scalars().all())


def add_series(db: Session, series: TVSeries) -> TVSeries:
    db.add(series)
    db.commit()
    db.refresh(series)
    return series


def update_series(db: Session, series: TVSeries) -> TVSeries:
    db.commit()
    db.refresh(series)
    return series


def delete_series(db: Session, series: TVSeries) -> None:
    db.delete(series)
    db.commit()


def add_episode(db: Session, episode: TVEpisode) -> TVEpisode:
    db.add(episode)
    db.commit()
    db.refresh(episode)
    return episode


def get_episode_by_id(db: Session, episode_id: int, user_id: int) -> Optional[TVEpisode]:
    stmt = select(TVEpisode).where(TVEpisode.id == episode_id, TVEpisode.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()


def update_episode(db: Session, episode: TVEpisode) -> TVEpisode:
    db.commit()
    db.refresh(episode)
    return episode
