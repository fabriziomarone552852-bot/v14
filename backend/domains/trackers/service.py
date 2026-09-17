"""
Business logic and external API integrations for Trackers domain.
"""
from datetime import datetime, timezone
from typing import List, Optional

import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.core.settings import get_settings
from backend.domains.trackers import repository
from backend.domains.trackers.models import TVSeries, TVEpisode
from backend.domains.trackers.schemas import (
    TMDBPaginatedSearch,
    TMDBSeriesSearchResult,
    TVSeriesCreate,
    TVSeriesUpdate,
)
from backend.domains.users.models import User

# TMDB Base URL
TMDB_BASE_URL = "https://api.themoviedb.org/3"


def get_tmdb_headers() -> dict:
    settings = get_settings()
    if not settings.tmdb_read_access_token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="TMDB API non configurata (Token mancante)",
        )
    return {
        "Authorization": f"Bearer {settings.tmdb_read_access_token.get_secret_value()}",
        "accept": "application/json",
    }


async def search_tmdb_series(query: str, page: int = 1) -> TMDBPaginatedSearch:
    """Ricerca una serie TV tramite l'API di TMDB."""
    if not query.strip():
        return TMDBPaginatedSearch(page=1, results=[], total_pages=0, total_results=0)

    url = f"{TMDB_BASE_URL}/search/tv"
    params = {
        "query": query,
        "include_adult": "false",
        "language": "it-IT",
        "page": str(page),
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=get_tmdb_headers(), params=params)

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Errore nella comunicazione con TMDB",
        )

    data = response.json()
    return TMDBPaginatedSearch(**data)


async def get_tmdb_series_details(tmdb_id: int) -> dict:
    """Scarica i dettagli completi di una serie (inclusi i metadati stagioni)."""
    url = f"{TMDB_BASE_URL}/tv/{tmdb_id}"
    params = {"language": "it-IT"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=get_tmdb_headers(), params=params)

    if response.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Serie non trovata su TMDB",
        )
    elif response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Errore nella comunicazione con TMDB",
        )

    return response.json()


async def add_series(db: Session, current_user: User, payload: TVSeriesCreate) -> TVSeries:
    """Aggiunge una nuova serie TV tracker scaricando i dati da TMDB."""
    # 1. Controlla se la serie è già nel tracker dell'utente
    existing = repository.get_series_by_tmdb_id(db, tmdb_id=payload.tmdb_id, user_id=current_user.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hai già aggiunto questa serie ai tuoi tracker.",
        )

    # 2. Scarica i dettagli da TMDB
    tmdb_data = await get_tmdb_series_details(payload.tmdb_id)

    # 3. Mappa i dati TMDB nel modello SQLAlchemy
    # TMDB date fields can be empty strings, so parse safely.
    def safe_date(date_str: str | None):
        if not date_str:
            return None
        try:
            return datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return None

    new_series = TVSeries(
        user_id=current_user.id,
        tmdb_id=tmdb_data.get("id"),
        title=tmdb_data.get("name", "Titolo Sconosciuto"),
        original_title=tmdb_data.get("original_name"),
        overview=tmdb_data.get("overview"),
        poster_path=tmdb_data.get("poster_path"),
        backdrop_path=tmdb_data.get("backdrop_path"),
        status=payload.status,
        tmdb_status=tmdb_data.get("status"),
        total_seasons=tmdb_data.get("number_of_seasons"),
        total_episodes=tmdb_data.get("number_of_episodes"),
        first_air_date=safe_date(tmdb_data.get("first_air_date")),
        last_air_date=safe_date(tmdb_data.get("last_air_date")),
    )

    return repository.add_series(db, new_series)


def list_user_series(db: Session, current_user: User) -> List[TVSeries]:
    return repository.list_series(db, current_user.id)


def update_series(db: Session, current_user: User, series_id: int, payload: TVSeriesUpdate) -> TVSeries:
    series = repository.get_series_by_id(db, series_id, current_user.id)
    if not series:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serie non trovata.")

    if payload.status is not None:
        series.status = payload.status
    if payload.rating is not None:
        series.rating = payload.rating

    return repository.update_series(db, series)


def delete_series(db: Session, current_user: User, series_id: int) -> None:
    series = repository.get_series_by_id(db, series_id, current_user.id)
    if not series:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serie non trovata.")
    repository.delete_series(db, series)
