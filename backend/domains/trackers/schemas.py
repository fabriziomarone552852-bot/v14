"""
Schemas for Trackers domain (TV Series).
"""

from datetime import date, datetime
from typing import List, Optional, Dict
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
    rating: Optional[float] = Field(None, ge=1, le=5)
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
    rating: Optional[float] = None
    notes: Optional[str] = None
    review_visibility: str
    watched_at: datetime
    comments: List[dict] = Field(default_factory=list)


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




class UserTVPlatformResponse(ORMBaseModel):
    id: int
    user_id: int
    name: str

class UserSeriesLogCreate(BaseModel):
    rating: Optional[float] = None
    notes: Optional[str] = None
    review_visibility: Optional[str] = "friends_only"
    viewing_platform_id: Optional[int] = None
    viewing_platform_name: Optional[str] = None  # To allow auto-creation
    watched_at: Optional[datetime] = None

class UserSeriesLogUpdate(BaseModel):
    rating: Optional[float] = None
    notes: Optional[str] = None
    review_visibility: Optional[str] = None
    viewing_platform_id: Optional[int] = None
    viewing_platform_name: Optional[str] = None
    watched_at: Optional[datetime] = None

class UserSeriesLogResponse(ORMBaseModel):
    id: int
    user_id: int
    series_tmdb_id: int
    rating: Optional[float] = None
    notes: Optional[str] = None
    review_visibility: str
    viewing_platform_id: Optional[int] = None
    viewing_platform_name: Optional[str] = None  # We'll map this from the relation
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
    rating: Optional[float] = None
    notes: Optional[str] = None
    review_visibility: str
    updated_at: datetime
    comments: Optional[List[dict]] = Field(default_factory=list)

class FriendEpisodeLogResponse(ORMBaseModel):
    id: int
    friend_id: int
    friend_name: str
    friend_avatar: Optional[str] = None
    rating: Optional[float] = None
    notes: Optional[str] = None
    review_visibility: str
    watched_at: datetime
    comments: Optional[List[dict]] = Field(default_factory=list)

class GenreStat(BaseModel):
    genre: str
    count: int
    percentage: float

class TimeTrendStat(BaseModel):
    period: str
    episodes: int
    hours: float

class TotalWatchTime(BaseModel):
    days: int
    hours: int
    minutes: int

class CompletionRate(BaseModel):
    completed: int
    dropped: int
    percentage: float

class WatchlistForecast(BaseModel):
    estimated_date: Optional[str]
    remaining_minutes: int
    daily_pace: float

class PlatformStat(BaseModel):
    platform: str
    count: int
    percentage: float

class ViewingHabits(BaseModel):
    by_day: Dict[str, int]
    by_time: Dict[str, int]

class GraveyardStat(BaseModel):
    title: str
    abandoned_date: Optional[str]

class SatisfactionStat(BaseModel):
    title: str
    time_spent_hours: float
    rating: float

class PersonalRecords(BaseModel):
    max_episodes_in_day: int
    max_episodes_day: Optional[str]
    fastest_binge_series: Optional[str]
    fastest_binge_days: Optional[int]

class RatingDistribution(BaseModel):
    rating: float
    count: int

class GenreRating(BaseModel):
    genre: str
    average_rating: float

class TopSeries(BaseModel):
    title: str
    rating: float

class RewatchStat(BaseModel):
    title: str
    rewatch_count: int
    rating: Optional[float] = None

class RewatchComparison(BaseModel):
    first_watch_hours: float
    rewatch_hours: float


class GuiltyPleasureStat(BaseModel):
    title: str
    rewatch_count: int
    rating: float

class GeneralStats(BaseModel):
    episodes_last_month: int
    episodes_last_year: int
    series_completed_last_month: int
    series_completed_last_year: int
    series_watching_last_month: int
    series_watching_last_year: int
    series_to_watch_last_month: int
    series_to_watch_last_year: int
    series_dropped_last_month: int
    series_dropped_last_year: int

class TVFullStats(BaseModel):
    genres_distribution: List[GenreStat]
    time_trend: Dict[str, List[TimeTrendStat]]
    total_watch_time: TotalWatchTime
    completion_rate: CompletionRate
    watchlist_forecast: WatchlistForecast
    platform_distribution: List[PlatformStat]
    viewing_habits: ViewingHabits
    graveyard: List[GraveyardStat]
    satisfaction_index: List[SatisfactionStat]
    personal_records: PersonalRecords
    series_ratings_distribution: List[RatingDistribution]
    episode_ratings_distribution: List[RatingDistribution]
    general_stats: GeneralStats
    ratings_by_genre: List[GenreRating]
    top_10_series: List[TopSeries]
    most_rewatched: List[RewatchStat]
    most_rewatched_episodes: List[RewatchStat] = Field(default_factory=list)
    rewatch_comparison: RewatchComparison
    guilty_pleasures: List[GuiltyPleasureStat] = Field(default_factory=list)
