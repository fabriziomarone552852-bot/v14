"""
Schemas for Trackers domain (TV Series).
"""

from datetime import date, datetime
from typing import List, Optional
from pydantic import Field, field_validator, BaseModel

from backend.core.schemas import ORMBaseModel, StrictBaseModel


class TVSeriesCreate(StrictBaseModel):
    """Payload to add a new TV Series to the user's tracker."""
    tmdb_id: int
    status: str = Field(default="to_watch")
    review_visibility: str = Field(default="friends_only")

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        valid_statuses = {"to_watch", "watching", "waiting", "watched", "dropped"}
        if value not in valid_statuses:
            raise ValueError(f"Stato non valido. Valori ammessi: {valid_statuses}")
        return value

    @field_validator("review_visibility")
    @classmethod
    def validate_visibility(cls, value: str) -> str:
        valid = {"private", "friends_only", "group", "public"}
        if value not in valid:
            raise ValueError(f"Visibilità non valida. Valori ammessi: {valid}")
        return value


class TVSeriesUpdate(StrictBaseModel):
    """Payload to update an existing tracked TV Series."""
    status: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None
    custom_poster_path: Optional[str] = None
    custom_backdrop_path: Optional[str] = None
    review_visibility: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        valid_statuses = {"to_watch", "watching", "waiting", "watched", "dropped"}
        if value not in valid_statuses:
            raise ValueError(f"Stato non valido. Valori ammessi: {valid_statuses}")
        return value

    @field_validator("review_visibility")
    @classmethod
    def validate_visibility(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        valid = {"private", "friends_only", "group", "public"}
        if value not in valid:
            raise ValueError(f"Visibilità non valida. Valori ammessi: {valid}")
        return value


class TVQuoteResponse(ORMBaseModel):
    """Response model for a TV Quote."""
    id: int
    episode_id: int
    quote_text: str
    created_at: datetime


class EpisodeLogResponse(ORMBaseModel):
    """A single view (rewatch) of an episode."""
    id: int
    rating: Optional[int] = None
    notes: Optional[str] = None
    review_visibility: str
    watched_at: datetime


class TVEpisodeResponse(ORMBaseModel):
    """Response model for a TV Episode, combining global data and user tracking logs."""
    id: int
    series_tmdb_id: int
    season_number: int
    episode_number: int
    title: Optional[str] = None
    overview: Optional[str] = None
    air_date: Optional[date] = None
    still_path: Optional[str] = None
    vote_average: Optional[float] = None
    
    # User specific fields
    is_watched: bool
    watch_count: int
    logs: List[EpisodeLogResponse] = Field(default_factory=list)
    quotes: List[TVQuoteResponse] = Field(default_factory=list)




class UserSeriesLogCreate(BaseModel):
    rating: Optional[int] = None
    notes: Optional[str] = None
    review_visibility: Optional[str] = "friends_only"
    watched_at: Optional[datetime] = None

class UserSeriesLogUpdate(BaseModel):
    rating: Optional[int] = None
    notes: Optional[str] = None
    review_visibility: Optional[str] = None
    watched_at: Optional[datetime] = None

class UserSeriesLogResponse(ORMBaseModel):
    id: int
    user_id: int
    series_tmdb_id: int
    rating: Optional[int] = None
    notes: Optional[str] = None
    review_visibility: str
    watched_at: datetime
    updated_at: Optional[datetime] = None
    comments: List[dict] = Field(default_factory=list)

class TVSeriesResponse(ORMBaseModel):
    """Response model for a tracked TV Series, combining global data and user tracking."""
    # TMDB Global fields
    tmdb_id: int
    title: str
    original_title: Optional[str] = None
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    tmdb_status: Optional[str] = None
    genres: Optional[str] = None
    networks: Optional[str] = None
    creators: Optional[str] = None
    total_seasons: Optional[int] = None
    total_episodes: Optional[int] = None
    first_air_date: Optional[date] = None
    last_air_date: Optional[date] = None
    vote_average: Optional[float] = None
    last_sync_at: datetime

    # User Tracking fields
    id: int  # The tracking record ID
    status: str
    custom_poster_path: Optional[str] = None
    custom_backdrop_path: Optional[str] = None
    added_at: datetime
    logs: List[UserSeriesLogResponse] = Field(default_factory=list)
    updated_at: Optional[datetime] = None
    
    # Used for the quick "+1 episode" button and tracking display in the grid
    next_episode_to_watch: Optional[TVEpisodeResponse] = None
    
    episodes: List[TVEpisodeResponse] = Field(default_factory=list)


class UpcomingEpisodeResponse(BaseModel):
    """Schema per il carousel 'Prossime Uscite'."""
    episode_id: int
    series_tmdb_id: int
    series_title: str
    series_poster_path: Optional[str] = None
    season_number: int
    episode_number: int
    episode_title: Optional[str] = None
    air_date: date


class TVDashboardStats(BaseModel):
    """Schema per gli obiettivi annuali e statistiche della top bar."""
    episodes_watched_this_year: int
    series_completed_this_year: int
    total_series_tracked: int
    
    # Per la Top Bar a 3 indicatori: ("Ultima Aggiunta", "Ultimo Episodio", "Ultima Completata")
    last_added_series: Optional[str] = None
    last_watched_episode: Optional[str] = None
    last_completed_series: Optional[str] = None


class TVQuoteExtendedResponse(TVQuoteResponse):
    """Quote con informazioni aggiuntive sulla serie/episodio."""
    series_title: str
    season_number: int
    episode_number: int
    series_poster_path: Optional[str] = None


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

# --- Media Lists ---

class MediaListCreate(BaseModel):
    name: str
    description: Optional[str] = None
    visibility: Optional[str] = "private"

class MediaListUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[str] = None

class TMDBSeriesSimpleResponse(ORMBaseModel):
    tmdb_id: int
    title: str
    poster_path: Optional[str] = None
    first_air_date: Optional[date] = None
    genres: Optional[str] = None

class MediaListItemCreate(BaseModel):
    series_tmdb_id: Optional[int] = None
    sort_order: Optional[int] = 0

class MediaListItemUpdate(BaseModel):
    sort_order: Optional[int] = None

class MediaListItemResponse(ORMBaseModel):
    id: int
    list_id: int
    series_tmdb_id: Optional[int] = None
    sort_order: int
    added_at: datetime
    series: Optional[TMDBSeriesSimpleResponse] = None

class MediaListResponse(ORMBaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str] = None
    visibility: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[MediaListItemResponse] = Field(default_factory=list)


# --- Friends Reviews ---

class FriendSeriesLogResponse(ORMBaseModel):
    id: int
    friend_id: int
    friend_name: str
    friend_avatar: Optional[str] = None
    status: str
    rating: Optional[int] = None
    notes: Optional[str] = None
    review_visibility: str
    updated_at: datetime
    comments: Optional[List[dict]] = Field(default_factory=list)

class FriendEpisodeLogResponse(ORMBaseModel):
    id: int
    friend_id: int
    friend_name: str
    friend_avatar: Optional[str] = None
    rating: Optional[int] = None
    notes: Optional[str] = None
    review_visibility: str
    watched_at: datetime
    comments: Optional[List[dict]] = Field(default_factory=list)

