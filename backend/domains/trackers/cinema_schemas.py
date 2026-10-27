"""
Pydantic schemas for ComingSoon Cinema integration in Movie Tracker.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class CinemaProvince(BaseModel):
    name: str = Field(..., description="Nome della provincia (es. Milano)")
    slug: str = Field(..., description="Slug URL per ComingSoon (es. milano)")
    region: Optional[str] = Field(None, description="Regione di appartenenza (es. Lombardia)")


class CinemaSummary(BaseModel):
    id: str = Field(..., description="ID del cinema su ComingSoon (es. 826)")
    name: str = Field(..., description="Nome del cinema (es. Anteo Palazzo del Cinema)")
    slug: str = Field(..., description="Slug del cinema (es. anteo-palazzo-del-cinema)")
    city: str = Field(..., description="Comune o quartiere (es. Milano, Melzo)")
    province_slug: str = Field(..., description="Slug provincia")
    url: str = Field(..., description="URL relativo o assoluto")


class MovieInCinemaSummary(BaseModel):
    idf: str = Field(..., description="ID del film su ComingSoon (es. 22579)")
    title: str = Field(..., description="Titolo italiano del film")
    original_title: Optional[str] = Field(None, description="Titolo originale")
    poster: Optional[str] = Field(None, description="URL locandina")
    genre: Optional[str] = Field(None, description="Genere del film")
    duration: Optional[str] = Field(None, description="Durata (es. 105 Minuti)")
    release_date: Optional[str] = Field(None, description="Data di uscita in sala")
    rating: Optional[str] = Field(None, description="Voto medio (es. 3,8)")
    ticket_search_url: Optional[str] = Field(None, description="URL ComingSoon per la ricerca sale")
    tmdb_id: Optional[int] = Field(None, description="ID TMDB corrispondente se trovato")


class ProvinceCinemaData(BaseModel):
    province_name: str
    province_slug: str
    movies: List[MovieInCinemaSummary] = Field(default_factory=list)
    cinemas: List[CinemaSummary] = Field(default_factory=list)


class CinemaRoomShowtime(BaseModel):
    sala: str = Field(..., description="Nome sala (es. Sala 1, Sala Excelsior)")
    posti: Optional[str] = Field(None, description="Posti a sedere (es. 220 o N.D.)")
    orari_raw: str = Field(..., description="Stringa originale degli orari e prezzi")
    showtimes: List[str] = Field(default_factory=list, description="Lista pulita degli orari (es. ['17:25', '20:30'])")


class MovieCinemaShowtimes(BaseModel):
    cinema_id: Optional[str] = None
    cinema_slug: Optional[str] = None
    cinema_name: str
    cinema_url: Optional[str] = None
    address: Optional[str] = None
    ticket_url: Optional[str] = None
    rooms: List[CinemaRoomShowtime] = Field(default_factory=list)


class CinemaScheduleMovie(BaseModel):
    idf: Optional[str] = None
    title: str
    poster: Optional[str] = None
    genre: Optional[str] = None
    duration: Optional[str] = None
    sala: Optional[str] = None
    orari: Optional[str] = None
    showtimes: List[str] = Field(default_factory=list)
    ticket_url: Optional[str] = None
    tmdb_id: Optional[int] = None


class CinemaSchedule(BaseModel):
    cinema_id: str
    cinema_slug: str
    cinema_name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    movies: List[CinemaScheduleMovie] = Field(default_factory=list)
