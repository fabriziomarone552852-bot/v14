"""
Database models for Trackers domain (TV Series).
Splits TMDB global data from User Tracking data.
"""

from datetime import date, datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.database import Base

if TYPE_CHECKING:
    from backend.domains.users.models import User


class TMDBSeries(Base):
    """Global TMDB catalog data for a TV Series (Shared across all users)."""

    __tablename__ = "tmdb_series"

    tmdb_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=False)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    original_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    overview: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    poster_path: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    backdrop_path: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # TMDB status: 'Returning Series', 'Ended', 'Canceled', etc.
    tmdb_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    # Extra metadata from backlog
    genres: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    networks: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    creators: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    total_seasons: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    total_episodes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    first_air_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    last_air_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    last_sync_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    episodes: Mapped[List["TMDBEpisode"]] = relationship(
        "TMDBEpisode",
        back_populates="series",
        cascade="all, delete-orphan",
    )
    user_trackings: Mapped[List["UserSeriesTracking"]] = relationship(
        "UserSeriesTracking",
        back_populates="tmdb_series",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<TMDBSeries tmdb_id={self.tmdb_id} title={self.title!r}>"


class TMDBEpisode(Base):
    """Global TMDB catalog data for a TV Episode (Shared across all users)."""

    __tablename__ = "tmdb_episodes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    series_tmdb_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("tmdb_series.tmdb_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    season_number: Mapped[int] = mapped_column(Integer, nullable=False)
    episode_number: Mapped[int] = mapped_column(Integer, nullable=False)
    
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    overview: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    air_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    series: Mapped["TMDBSeries"] = relationship("TMDBSeries", back_populates="episodes")
    user_trackings: Mapped[List["UserEpisodeLog"]] = relationship(
        "UserEpisodeLog",
        back_populates="tmdb_episode",
        cascade="all, delete-orphan",
    )
    quotes: Mapped[List["TVQuote"]] = relationship(
        "TVQuote",
        back_populates="tmdb_episode",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<TMDBEpisode id={self.id} S{self.season_number}E{self.episode_number}>"


class UserSeriesTracking(Base):
    """User-specific tracking data for a TV Series."""

    __tablename__ = "user_series_tracking"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    series_tmdb_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("tmdb_series.tmdb_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    # User's personal status: 'to_watch', 'watching', 'watched', 'dropped'
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="to_watch", index=True)
    
    # User rating (0 to 5, or 0 to 10)
    rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # User personal notes/review
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Custom images
    custom_poster_path: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    custom_backdrop_path: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Privacy & Social Sharing (FEAT-007)
    review_visibility: Mapped[str] = mapped_column(String(50), nullable=False, default="friends_only")

    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship("User")
    tmdb_series: Mapped["TMDBSeries"] = relationship("TMDBSeries", back_populates="user_trackings")

    def __repr__(self) -> str:
        return f"<UserSeriesTracking id={self.id} user={self.user_id} series={self.series_tmdb_id} status={self.status}>"


class UserEpisodeLog(Base):
    """
    User progress for specific episodes (Diary pattern).
    Each row represents a specific viewing of the episode (rewatch).
    """
    __tablename__ = "tv_user_episode_logs"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    episode_id: Mapped[int] = mapped_column(Integer, ForeignKey("tmdb_episodes.id", ondelete="CASCADE"), nullable=False)
    
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Privacy & Social Sharing (FEAT-007)
    review_visibility: Mapped[str] = mapped_column(String(50), nullable=False, default="friends_only")
    
    watched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )
    
    # Relationships
    user: Mapped["User"] = relationship("User")
    tmdb_episode: Mapped["TMDBEpisode"] = relationship("TMDBEpisode", back_populates="user_trackings")

    def __repr__(self) -> str:
        return f"<UserEpisodeLog id={self.id} user={self.user_id} episode={self.episode_id}>"


class TVQuote(Base):
    """Quotes from TV series saved by the user.
    Linked directly to the specific episode.
    """

    __tablename__ = "tracker_tv_quotes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    episode_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("tmdb_episodes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    quote_text: Mapped[str] = mapped_column(Text, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user: Mapped["User"] = relationship("User")
    tmdb_episode: Mapped["TMDBEpisode"] = relationship("TMDBEpisode", back_populates="quotes")

    def __repr__(self) -> str:
        return f"<TVQuote id={self.id} episode_id={self.episode_id}>"
