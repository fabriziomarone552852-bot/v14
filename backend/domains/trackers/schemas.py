"""
Schemas for Trackers domain (TV Series, Movies, Books).
"""

from datetime import date, datetime, timezone
from typing import List, Optional
from pydantic import Field, field_validator, model_validator, BaseModel

from backend.core.schemas import ORMBaseModel, StrictBaseModel


class TVSeriesCreate(StrictBaseModel):
    """Payload to add a new TV Series to the user's tracker."""

    tmdb_id: int
    status: str = Field(default="to_watch")

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        valid_statuses = {"to_watch", "watching", "watched", "dropped"}
        if value not in valid_statuses:
            raise ValueError(f"Stato non valido. Valori ammessi: {valid_statuses}")
        return value


class TVSeriesUpdate(StrictBaseModel):
    """Payload to update an existing tracked TV Series."""

    status: Optional[str] = None
    rating: Optional[int] = Field(None, ge=0, le=5)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        valid_statuses = {"to_watch", "watching", "watched", "dropped"}
        if value not in valid_statuses:
            raise ValueError(f"Stato non valido. Valori ammessi: {valid_statuses}")
        return value


class TVQuoteResponse(ORMBaseModel):
    """Response model for a TV Quote."""

    id: int
    quote_text: str
    character: Optional[str] = None
    created_at: datetime


class TVEpisodeResponse(ORMBaseModel):
    """Response model for a TV Episode."""

    id: int
    tmdb_id: Optional[int] = None
    season_number: int
    episode_number: int
    title: Optional[str] = None
    air_date: Optional[date] = None
    watched: bool
    watched_at: Optional[datetime] = None


class TVSeriesResponse(ORMBaseModel):
    """Response model for a tracked TV Series."""

    id: int
    tmdb_id: Optional[int] = None
    title: str
    original_title: Optional[str] = None
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    status: str
    tmdb_status: Optional[str] = None
    total_seasons: Optional[int] = None
    total_episodes: Optional[int] = None
    first_air_date: Optional[date] = None
    last_air_date: Optional[date] = None
    rating: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # We might not want to return all episodes every time, but for the basic schema it's fine.
    episodes: List[TVEpisodeResponse] = Field(default_factory=list)


# --- TMDB External API Schemas ---

class TMDBSeriesSearchResult(BaseModel):
    """Schema for TMDB search results."""
    model_config = {"extra": "ignore"}

    id: int
    name: str
    original_name: Optional[str] = None
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    first_air_date: Optional[str] = None
    vote_average: Optional[float] = None


class TMDBPaginatedSearch(BaseModel):
    """Schema for TMDB paginated search response."""
    model_config = {"extra": "ignore"}

    page: int
    results: List[TMDBSeriesSearchResult]
    total_pages: int
    total_results: int
