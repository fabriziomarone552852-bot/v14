"""
Pydantic schemas for Trackers People (Actors, Directors, Creators) and Credits.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class MediaCreditMember(BaseModel):
    """Lightweight credit entry persisted in DB and exposed on Movie/Series responses."""
    id: int
    name: str
    role: Optional[str] = None
    department: Optional[str] = None
    profile_path: Optional[str] = None


class MediaCreditPerson(BaseModel):
    """Clickable person reference returned in Movie/Series extras (directors, creators)."""
    id: int
    name: str
    profile_path: Optional[str] = None


class TMDBPersonAlternative(BaseModel):
    """Alternative TMDB person candidate when resolving free-text names."""
    id: int
    name: str
    profile_path: Optional[str] = None
    known_for_department: Optional[str] = None
    known_for_titles: List[str] = Field(default_factory=list)


class ResolvedPersonRef(BaseModel):
    """Resolved person metadata attached to search/discover responses."""
    query: str
    id: int
    name: str
    profile_path: Optional[str] = None
    known_for_department: Optional[str] = None
    alternatives: List[TMDBPersonAlternative] = Field(default_factory=list)


class TMDBPersonSearchItem(BaseModel):
    """Single person result returned by live autocomplete /people/search."""
    id: int
    name: str
    original_name: Optional[str] = None
    profile_path: Optional[str] = None
    known_for_department: Optional[str] = None
    popularity: Optional[float] = None
    known_for_titles: List[str] = Field(default_factory=list)


class TMDBPaginatedPersonSearch(BaseModel):
    """Paginated response for TMDB person search."""
    page: int
    results: List[TMDBPersonSearchItem]
    total_pages: int
    total_results: int


class PersonCreditMovieItem(BaseModel):
    """Movie entry inside a person's filmography."""
    id: int
    title: str
    original_title: Optional[str] = None
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    release_date: Optional[str] = None
    vote_average: Optional[float] = None
    popularity: Optional[float] = None
    roles: List[str] = Field(default_factory=list)


class PersonCreditSeriesItem(BaseModel):
    """TV Series entry inside a person's filmography."""
    id: int
    name: str
    original_name: Optional[str] = None
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    backdrop_path: Optional[str] = None
    first_air_date: Optional[str] = None
    vote_average: Optional[float] = None
    popularity: Optional[float] = None
    roles: List[str] = Field(default_factory=list)


class PersonDetailResponse(BaseModel):
    """Full TMDB person profile and deduplicated Movie/TV credits."""
    id: int
    name: str
    profile_path: Optional[str] = None
    biography: Optional[str] = None
    birthday: Optional[str] = None
    deathday: Optional[str] = None
    place_of_birth: Optional[str] = None
    known_for_department: Optional[str] = None
    popularity: Optional[float] = None
    movie_credits: List[PersonCreditMovieItem] = Field(default_factory=list)
    tv_credits: List[PersonCreditSeriesItem] = Field(default_factory=list)
