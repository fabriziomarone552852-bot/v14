"""
Database models for Trackers domain (TV Series, Movies, Books).
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


class TVSeries(Base):
    """TV Series tracked by the user."""

    __tablename__ = "tracker_tv_series"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    tmdb_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    original_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    overview: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    poster_path: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    backdrop_path: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # User's personal status: 'to_watch', 'watching', 'watched', 'dropped'
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="to_watch", index=True)
    
    # TMDB status: 'Returning Series', 'Ended', 'Canceled', etc.
    tmdb_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    total_seasons: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    total_episodes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    first_air_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    last_air_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    # User rating (0 to 5, or 0 to 10)
    rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    acquired_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
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
    episodes: Mapped[List["TVEpisode"]] = relationship(
        "TVEpisode",
        back_populates="series",
        cascade="all, delete-orphan",
    )
    quotes: Mapped[List["TVQuote"]] = relationship(
        "TVQuote",
        back_populates="series",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<TVSeries id={self.id} title={self.title!r} status={self.status}>"


class TVEpisode(Base):
    """TV Series episode tracked by the user."""

    __tablename__ = "tracker_tv_episodes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    series_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("tracker_tv_series.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    tmdb_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    season_number: Mapped[int] = mapped_column(Integer, nullable=False)
    episode_number: Mapped[int] = mapped_column(Integer, nullable=False)
    
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    overview: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    air_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    watched: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    watched_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
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

    series: Mapped["TVSeries"] = relationship("TVSeries", back_populates="episodes")

    def __repr__(self) -> str:
        return f"<TVEpisode id={self.id} S{self.season_number}E{self.episode_number} watched={self.watched}>"


class TVQuote(Base):
    """Quotes from TV series saved by the user."""

    __tablename__ = "tracker_tv_quotes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    series_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("tracker_tv_series.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    quote_text: Mapped[str] = mapped_column(Text, nullable=False)
    character: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
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

    series: Mapped["TVSeries"] = relationship("TVSeries", back_populates="quotes")

    def __repr__(self) -> str:
        return f"<TVQuote id={self.id} series_id={self.series_id}>"
