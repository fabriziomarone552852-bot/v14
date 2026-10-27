"""
Pydantic schemas for Movie Tracker domain.
"""

from datetime import date, datetime
from typing import List, Optional, Dict, Any
from pydantic import Field, field_validator, BaseModel

from backend.core.schemas import ORMBaseModel, StrictBaseModel


class MovieCreate(StrictBaseModel):
    """Payload per aggiungere un film al tracker dell'utente."""
    tmdb_id: int
    status: str = Field(default="to_watch")
    review_visibility: str = Field(default="friends_only")
    obtained_at: Optional[datetime] = None
    is_obtained: Optional[bool] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        valid_statuses = {"to_watch", "watched"}
        if value not in valid_statuses:
            raise ValueError(f"Stato non valido per i film. Valori ammessi: {valid_statuses}")
        return value

    @field_validator("review_visibility")
    @classmethod
    def validate_visibility(cls, value: str) -> str:
        valid = {"private", "friends_only", "group", "public"}
        if value not in valid:
            raise ValueError(f"Visibilità non valida. Valori ammessi: {valid}")
        return value


class MovieUpdate(StrictBaseModel):
    """Payload per aggiornare un film tracciato."""
    status: Optional[str] = None
    is_rewatching: Optional[bool] = None
    custom_poster_path: Optional[str] = None
    custom_backdrop_path: Optional[str] = None
    obtained_at: Optional[datetime] = None
    is_obtained: Optional[bool] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        valid_statuses = {"to_watch", "watched"}
        if value not in valid_statuses:
            raise ValueError(f"Stato non valido per i film. Valori ammessi: {valid_statuses}")
        return value


class UserMovieLogCreate(BaseModel):
    """Creazione di una sessione di visione / recensione per un film."""
    rating: Optional[float] = Field(None, ge=1, le=10)
    notes: Optional[str] = None
    review_visibility: Optional[str] = "friends_only"
    viewing_platform_id: Optional[int] = None
    viewing_platform_name: Optional[str] = None
    watched_at: Optional[datetime] = None


class UserMovieLogUpdate(BaseModel):
    """Aggiornamento di una sessione di visione / recensione film."""
    rating: Optional[float] = Field(None, ge=1, le=10)
    notes: Optional[str] = None
    review_visibility: Optional[str] = None
    viewing_platform_id: Optional[int] = None
    viewing_platform_name: Optional[str] = None
    watched_at: Optional[datetime] = None


class UserMovieLogResponse(ORMBaseModel):
    """Risposta per una sessione di visione/recensione di un film."""
    id: int
    user_id: int
    movie_tmdb_id: int
    rating: Optional[float] = None
    notes: Optional[str] = None
    review_visibility: str
    viewing_platform_id: Optional[int] = None
    viewing_platform_name: Optional[str] = None
    watched_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    comments: List[dict] = Field(default_factory=list)


class FriendMovieLogResponse(ORMBaseModel):
    """Recensioni e voti degli amici per un film."""
    id: int
    friend_id: int
    friend_name: str
    friend_avatar: Optional[str] = None
    status: str = "watched"
    rating: Optional[float] = None
    notes: Optional[str] = None
    review_visibility: str
    watched_at: Optional[datetime] = None
    viewing_platform_name: Optional[str] = None
    comments: List[dict] = Field(default_factory=list)


class MovieQuoteCreate(BaseModel):
    quote_text: str = Field(..., min_length=1)


class MovieQuoteUpdate(BaseModel):
    quote_text: str = Field(..., min_length=1)


class MovieQuoteResponse(ORMBaseModel):
    id: int
    user_id: int
    movie_tmdb_id: int
    quote_text: str
    created_at: datetime
    movie_title: Optional[str] = None
    movie_poster_path: Optional[str] = None


class MovieCastMember(BaseModel):
    id: int
    name: str
    character: Optional[str] = None
    profile_path: Optional[str] = None


class MovieRecommendation(BaseModel):
    id: int
    title: str
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    vote_average: Optional[float] = None
    release_date: Optional[str] = None


class MovieCollectionPart(BaseModel):
    id: int
    title: str
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    release_date: Optional[str] = None
    vote_average: Optional[float] = None
    status: Optional[str] = None  # 'watched', 'to_watch', o None se non in lista
    in_watchlist: bool = False
    is_watched: bool = False
    my_rating: Optional[float] = None


class MovieCollectionDetail(BaseModel):
    id: int
    name: str
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    parts: List[MovieCollectionPart] = Field(default_factory=list)


class MovieExtrasResponse(BaseModel):
    cast: List[MovieCastMember] = Field(default_factory=list)
    director: Optional[str] = None
    recommendations: List[MovieRecommendation] = Field(default_factory=list)
    collection: Optional[MovieCollectionDetail] = None


class MovieResponse(ORMBaseModel):
    """Risposta completa per un Film, con catalogo TMDB e tracking personale."""
    id: int  # ID tracking personale (o 0 se anteprima)
    tmdb_id: int
    title: str
    original_title: Optional[str] = None
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    custom_poster_path: Optional[str] = None
    custom_backdrop_path: Optional[str] = None
    genres: Optional[str] = None
    runtime: Optional[int] = None
    release_date: Optional[date] = None
    italy_release_date: Optional[date] = None
    vote_average: Optional[float] = None
    collection_id: Optional[int] = None
    collection_name: Optional[str] = None
    collection_poster_path: Optional[str] = None
    collection_backdrop_path: Optional[str] = None
    last_sync_at: Optional[datetime] = None

    # Campi utente
    status: str = "to_watch"
    is_rewatching: bool = False
    obtained_at: Optional[datetime] = None
    is_obtained: bool = False
    added_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    watch_count: int = 0
    my_rating: Optional[float] = None
    my_last_watched_at: Optional[datetime] = None
    logs: List[UserMovieLogResponse] = Field(default_factory=list)
    quotes: List[MovieQuoteResponse] = Field(default_factory=list)


class TMDBMovieSearchResult(BaseModel):
    id: int
    title: str
    original_title: Optional[str] = None
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    release_date: Optional[str] = None
    italy_release_date: Optional[str] = None
    vote_average: Optional[float] = None


class TMDBPaginatedMovieSearch(BaseModel):
    page: int
    results: List[TMDBMovieSearchResult]
    total_pages: int
    total_results: int


class UpcomingMovieResponse(BaseModel):
    movie_tmdb_id: int
    title: str
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    release_date: Optional[date] = None
    italy_release_date: Optional[date] = None
    is_recent_release: bool = False  # True se uscito negli ultimi 14 giorni (Al cinema / Novità)
    days_since_release: Optional[int] = None
    is_watched: bool = False


class MovieDashboardStats(BaseModel):
    movies_watched_this_year: int
    total_movies_tracked: int
    movies_in_watchlist: int
    last_added_movie: Optional[str] = None
    last_watched_movie: Optional[str] = None


class MovieFullStats(BaseModel):
    total_watch_time: Dict[str, int]  # days, hours, minutes, total_minutes
    completion_rate: Dict[str, float]  # percentage, watched, to_watch
    watchlist_forecast: Dict[str, Optional[str]]  # estimated_date
    personal_records: Dict[str, Optional[str]]  # max_movies_in_day, max_movies_day
    general_stats: Dict[str, float]
    ratings_distribution: List[Dict[str, float]]
    ratings_by_genre: List[Dict[str, float]]
    top_10_movies: List[Dict[str, float]]
    most_rewatched: List[Dict[str, Any]]
    rewatch_comparison: Optional[Dict[str, float]] = None
    guilty_pleasures: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    platform_distribution: List[Dict[str, float]]
    viewing_habits: Dict[str, Dict[str, int]]
    genres_distribution: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    time_trend: Optional[Dict[str, List[Dict[str, Any]]]] = Field(default_factory=dict)
