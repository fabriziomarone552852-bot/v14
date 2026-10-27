"""
Repository for Movie Tracker domain.
Data access methods for TMDBMovie, UserMovieTracking, UserMovieLog, MovieQuote.
"""

from typing import List, Optional, Tuple
from sqlalchemy import select, or_, and_, desc
from sqlalchemy.orm import Session, selectinload, joinedload

from backend.domains.trackers.models import (
    TMDBMovie,
    UserMovieTracking,
    UserMovieLog,
    MovieQuote,
    UserTVPlatform,
)
from backend.domains.users.models import User
from backend.domains.social.models import Friendship
from backend.domains.notifications.models import Interaction


# --- TMDB Movie Catalog ---

def get_tmdb_movie(db: Session, tmdb_id: int) -> Optional[TMDBMovie]:
    return db.execute(
        select(TMDBMovie).where(TMDBMovie.tmdb_id == tmdb_id)
    ).scalar_one_or_none()


def save_tmdb_movie(db: Session, movie: TMDBMovie) -> TMDBMovie:
    db.add(movie)
    db.commit()
    db.refresh(movie)
    return movie


# --- User Movie Tracking ---

def get_user_movie_tracking(
    db: Session, user_id: int, movie_tmdb_id: int
) -> Optional[UserMovieTracking]:
    stmt = (
        select(UserMovieTracking)
        .options(
            joinedload(UserMovieTracking.tmdb_movie),
        )
        .where(
            UserMovieTracking.user_id == user_id,
            UserMovieTracking.movie_tmdb_id == movie_tmdb_id,
        )
    )
    return db.execute(stmt).scalar_one_or_none()


def list_user_movie_trackings(
    db: Session, user_id: int
) -> List[UserMovieTracking]:
    stmt = (
        select(UserMovieTracking)
        .options(
            joinedload(UserMovieTracking.tmdb_movie),
        )
        .where(UserMovieTracking.user_id == user_id)
        .order_by(desc(UserMovieTracking.added_at))
    )
    return list(db.execute(stmt).scalars().all())


def save_user_movie_tracking(
    db: Session, tracking: UserMovieTracking
) -> UserMovieTracking:
    db.add(tracking)
    db.commit()
    db.refresh(tracking)
    return tracking


def delete_user_movie_tracking(
    db: Session, tracking: UserMovieTracking
) -> None:
    db.delete(tracking)
    db.commit()


# --- Movie Viewing Logs (Diary & Reviews) ---

def get_user_movie_logs(
    db: Session, user_id: int, movie_tmdb_id: Optional[int] = None
) -> List[UserMovieLog]:
    stmt = (
        select(UserMovieLog)
        .options(
            joinedload(UserMovieLog.viewing_platform),
            joinedload(UserMovieLog.tmdb_movie),
        )
        .where(UserMovieLog.user_id == user_id)
    )
    if movie_tmdb_id is not None:
        stmt = stmt.where(UserMovieLog.movie_tmdb_id == movie_tmdb_id)
    stmt = stmt.order_by(desc(UserMovieLog.watched_at), desc(UserMovieLog.created_at))
    return list(db.execute(stmt).scalars().all())


def get_movie_log(db: Session, log_id: int) -> Optional[UserMovieLog]:
    stmt = (
        select(UserMovieLog)
        .options(
            joinedload(UserMovieLog.viewing_platform),
            joinedload(UserMovieLog.tmdb_movie),
        )
        .where(UserMovieLog.id == log_id)
    )
    return db.execute(stmt).scalar_one_or_none()


def save_movie_log(db: Session, log: UserMovieLog) -> UserMovieLog:
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def delete_movie_log(db: Session, log: UserMovieLog) -> None:
    db.delete(log)
    db.commit()


# --- Quotes ---

def get_movie_quotes(
    db: Session, user_id: int, movie_tmdb_id: Optional[int] = None
) -> List[MovieQuote]:
    stmt = (
        select(MovieQuote)
        .options(joinedload(MovieQuote.tmdb_movie))
        .where(MovieQuote.user_id == user_id)
    )
    if movie_tmdb_id is not None:
        stmt = stmt.where(MovieQuote.movie_tmdb_id == movie_tmdb_id)
    stmt = stmt.order_by(desc(MovieQuote.created_at))
    return list(db.execute(stmt).scalars().all())


def get_movie_quote(db: Session, quote_id: int) -> Optional[MovieQuote]:
    stmt = (
        select(MovieQuote)
        .options(joinedload(MovieQuote.tmdb_movie))
        .where(MovieQuote.id == quote_id)
    )
    return db.execute(stmt).scalar_one_or_none()


def save_movie_quote(db: Session, quote: MovieQuote) -> MovieQuote:
    db.add(quote)
    db.commit()
    db.refresh(quote)
    return quote


def delete_movie_quote(db: Session, quote: MovieQuote) -> None:
    db.delete(quote)
    db.commit()


# --- Friends Reviews ---

def get_friends_movie_logs(
    db: Session, current_user_id: int, movie_tmdb_id: int
) -> List[dict]:
    friendships = db.query(Friendship).filter(
        or_(
            Friendship.requester_id == current_user_id,
            Friendship.addressee_id == current_user_id,
        ),
        Friendship.status == "accepted",
    ).all()

    friend_ids = [
        f.addressee_id if f.requester_id == current_user_id else f.requester_id
        for f in friendships
    ]

    if not friend_ids:
        return []

    stmt = (
        select(UserMovieTracking, User, UserMovieLog)
        .join(User, User.id == UserMovieTracking.user_id)
        .outerjoin(
            UserMovieLog,
            (UserMovieLog.user_id == UserMovieTracking.user_id)
            & (UserMovieLog.movie_tmdb_id == UserMovieTracking.movie_tmdb_id),
        )
        .options(
            joinedload(UserMovieLog.viewing_platform)
        )
        .where(
            UserMovieTracking.movie_tmdb_id == movie_tmdb_id,
            UserMovieTracking.user_id.in_(friend_ids),
        )
        .order_by(desc(UserMovieLog.watched_at), desc(UserMovieLog.created_at))
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
                    Interaction.interaction_type == "MOVIE_REVIEW_COMMENT",
                    Interaction.reference_id == log.id,
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
                    "created_at": c_int.created_at.isoformat() if c_int.created_at else "",
                }
                for c_int, c_user in comments_res
            ]

        platform_name = None
        if log and log.viewing_platform:
            platform_name = log.viewing_platform.name

        logs_data.append(
            {
                "id": log.id if log else -tracking.id,
                "friend_id": user.id,
                "friend_name": user.username,
                "friend_avatar": user.profile_picture_url,
                "status": tracking.status,
                "rating": log.rating if log else None,
                "notes": log.notes if log and log.review_visibility != "private" else None,
                "review_visibility": log.review_visibility if log else "friends_only",
                "watched_at": log.watched_at if log else None,
                "viewing_platform_name": platform_name,
                "comments": comments_list if log and log.review_visibility != "private" else [],
            }
        )

    return logs_data
