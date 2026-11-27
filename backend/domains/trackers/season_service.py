"""
Service for TV Season Logs (multi-log reviews and ratings per season).
"""
from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Dict, List, Optional, Union

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.domains.notifications.models import Interaction
from backend.domains.social.models import Friendship
from backend.domains.trackers import repository
from backend.domains.trackers.models import UserSeasonLog
from backend.domains.trackers.schemas import (
    TVSeriesCreate,
    TVSeriesResponse,
    UserSeasonLogCreate,
    UserSeasonLogUpdate,
)
from backend.domains.users.models import User


def _normalize_watched_at(value: Optional[Union[datetime, date]]) -> Optional[datetime]:
    """Normalize a date or datetime payload into a timezone-aware UTC datetime."""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)
    return datetime.combine(value, datetime.min.time(), tzinfo=timezone.utc)


def _get_season_comments_map(db: Session, log_ids: List[int]) -> Dict[int, List[dict]]:
    """Fetch comments for a batch of UserSeasonLog IDs in a single query."""
    if not log_ids:
        return {}

    comments_stmt = (
        select(Interaction, User)
        .join(User, User.id == Interaction.author_id)
        .where(
            Interaction.interaction_type == "SEASON_REVIEW_COMMENT",
            Interaction.reference_id.in_(log_ids),
        )
        .order_by(Interaction.created_at.asc())
    )
    comments_res = db.execute(comments_stmt).all()

    comments_map: Dict[int, List[dict]] = {}
    for c_int, c_user in comments_res:
        if c_int.reference_id is None:
            continue
        comments_map.setdefault(c_int.reference_id, []).append(
            {
                "id": str(c_int.id),
                "author_id": str(c_user.id),
                "author_name": c_user.username,
                "author_avatar": c_user.profile_picture_url,
                "text": c_int.content,
                "created_at": c_int.created_at.isoformat() if c_int.created_at else "",
            }
        )
    return comments_map


def get_user_season_logs_map(
    db: Session,
    user_id: int,
    series_tmdb_ids: Optional[List[int]] = None,
) -> Dict[int, List[dict]]:
    """Return all UserSeasonLog dicts grouped by series_tmdb_id for a user."""
    stmt = (
        select(UserSeasonLog)
        .where(UserSeasonLog.user_id == user_id)
    )
    if series_tmdb_ids is not None:
        if not series_tmdb_ids:
            return {}
        stmt = stmt.where(UserSeasonLog.series_tmdb_id.in_(series_tmdb_ids))

    stmt = stmt.order_by(
        UserSeasonLog.watched_at.desc().nullslast(),
        UserSeasonLog.updated_at.desc(),
        UserSeasonLog.id.desc(),
    )
    raw_logs = list(db.execute(stmt).scalars().all())
    if not raw_logs:
        return {}

    comments_map = _get_season_comments_map(db, [log.id for log in raw_logs])

    grouped: Dict[int, List[dict]] = {}
    for log in raw_logs:
        grouped.setdefault(log.series_tmdb_id, []).append(
            {
                "id": log.id,
                "user_id": log.user_id,
                "series_tmdb_id": log.series_tmdb_id,
                "season_number": log.season_number,
                "rating": log.rating,
                "notes": log.notes,
                "review_visibility": log.review_visibility,
                "watched_at": log.watched_at,
                "created_at": log.created_at,
                "updated_at": log.updated_at,
                "comments": comments_map.get(log.id, []),
            }
        )
    return grouped


def get_user_season_logs(db: Session, user_id: int, series_tmdb_id: int) -> List[dict]:
    """Return UserSeasonLog dicts for a single series."""
    return get_user_season_logs_map(db, user_id, [series_tmdb_id]).get(series_tmdb_id, [])


def _reload_series_response(db: Session, current_user: User, tmdb_id: int) -> TVSeriesResponse:
    """Reload tracking and episodes for a series and return full TVSeriesResponse."""
    from backend.domains.trackers import service as trackers_service

    tracking = repository.get_user_series_tracking(db, tmdb_id, current_user.id)
    if not tracking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serie non trovata.")

    episodes_data = repository.get_series_episodes_with_user_tracking(db, tmdb_id, current_user.id)
    return trackers_service._build_series_response_with_next(
        db, current_user, tracking, episodes_data
    )


async def add_season_log(
    db: Session,
    current_user: User,
    tmdb_id: int,
    season_number: int,
    payload: UserSeasonLogCreate,
) -> TVSeriesResponse:
    """Create a new season rating/review log (multi-log supported)."""
    from backend.domains.trackers import service as trackers_service

    tracking = repository.get_user_series_tracking(db, tmdb_id, current_user.id)
    if not tracking:
        await trackers_service.add_series(db, current_user, TVSeriesCreate(tmdb_id=tmdb_id))

    now_utc = datetime.now(timezone.utc)
    log = UserSeasonLog(
        user_id=current_user.id,
        series_tmdb_id=tmdb_id,
        season_number=season_number,
        rating=payload.rating,
        notes=payload.notes,
        review_visibility=payload.review_visibility or "friends_only",
        watched_at=_normalize_watched_at(payload.watched_at),
        created_at=now_utc,
        updated_at=now_utc,
    )
    db.add(log)
    db.commit()
    db.expire_all()

    return _reload_series_response(db, current_user, tmdb_id)


def update_season_log(
    db: Session,
    current_user: User,
    log_id: int,
    payload: UserSeasonLogUpdate,
) -> TVSeriesResponse:
    """Update an existing season rating/review log."""
    from backend.domains.trackers import service as trackers_service

    log = db.execute(
        select(UserSeasonLog).where(
            UserSeasonLog.id == log_id,
            UserSeasonLog.user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recensione stagione non trovata.")

    fields_set = payload.model_fields_set

    if "rating" in fields_set:
        log.rating = payload.rating
    if "notes" in fields_set:
        log.notes = payload.notes
    if "review_visibility" in fields_set and payload.review_visibility is not None:
        log.review_visibility = payload.review_visibility
    if "watched_at" in fields_set:
        log.watched_at = _normalize_watched_at(payload.watched_at)

    log.updated_at = datetime.now(timezone.utc)
    tmdb_id = log.series_tmdb_id
    db.commit()
    db.expire_all()

    return _reload_series_response(db, current_user, tmdb_id)


def delete_season_log(
    db: Session,
    current_user: User,
    log_id: int,
) -> TVSeriesResponse:
    """Delete an existing season rating/review log."""
    log = db.execute(
        select(UserSeasonLog).where(
            UserSeasonLog.id == log_id,
            UserSeasonLog.user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recensione stagione non trovata.")

    tmdb_id = log.series_tmdb_id
    db.delete(log)
    db.commit()
    db.expire_all()

    return _reload_series_response(db, current_user, tmdb_id)


def get_friends_season_logs(
    db: Session,
    current_user_id: int,
    tmdb_id: int,
    season_number: int,
) -> List[dict]:
    """Fetch accepted friends' logs and comments for a specific TV season."""
    friend_ids_q1 = select(Friendship.addressee_id).where(
        Friendship.requester_id == current_user_id,
        Friendship.status == "accepted",
    )
    friend_ids_q2 = select(Friendship.requester_id).where(
        Friendship.addressee_id == current_user_id,
        Friendship.status == "accepted",
    )
    friend_ids_union = friend_ids_q1.union(friend_ids_q2)

    stmt = (
        select(UserSeasonLog, User)
        .join(User, User.id == UserSeasonLog.user_id)
        .where(
            UserSeasonLog.series_tmdb_id == tmdb_id,
            UserSeasonLog.season_number == season_number,
            UserSeasonLog.user_id.in_(friend_ids_union),
        )
        .order_by(
            UserSeasonLog.watched_at.desc().nullslast(),
            UserSeasonLog.updated_at.desc(),
            UserSeasonLog.id.desc(),
        )
    )
    results = db.execute(stmt).all()
    if not results:
        return []

    comments_map = _get_season_comments_map(db, [log.id for log, _ in results])

    logs_data: List[dict] = []
    for log, friend in results:
        is_private = log.review_visibility == "private"
        logs_data.append(
            {
                "id": log.id,
                "friend_id": friend.id,
                "friend_name": friend.username,
                "friend_avatar": friend.profile_picture_url,
                "season_number": log.season_number,
                "rating": log.rating,
                "notes": None if is_private else log.notes,
                "review_visibility": log.review_visibility,
                "watched_at": log.watched_at,
                "updated_at": log.updated_at,
                "comments": [] if is_private else comments_map.get(log.id, []),
            }
        )
    return logs_data
