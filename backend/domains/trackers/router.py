"""
API router for the Trackers domain (TV Series).
"""
from typing import List

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.core.deps import get_db, get_current_app_user
from backend.domains.trackers import service
from backend.domains.trackers.schemas import (
    TMDBPaginatedSearch,
    TVSeriesCreate,
    TVSeriesResponse,
    TVSeriesUpdate,
    TVEpisodeResponse,
    TVQuoteResponse,
    UpcomingEpisodeResponse,
    TVDashboardStats,
    TVQuoteExtendedResponse
)
from backend.domains.users.models import User

router = APIRouter(prefix="/trackers", tags=["Trackers - Series"])

# --- Series ---

@router.get("/series/search", response_model=TMDBPaginatedSearch)
async def search_series(
    query: str = Query(..., min_length=1, description="Termine di ricerca per la serie TV (su TMDB)"),
    page: int = Query(1, ge=1, description="Numero di pagina per la paginazione"),
    current_user: User = Depends(get_current_app_user),
):
    return await service.search_tmdb_series(query=query, page=page)


@router.get("/series", response_model=List[TVSeriesResponse])
def get_my_series(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.list_user_series(db, current_user)


@router.post("/series", response_model=TVSeriesResponse, status_code=status.HTTP_201_CREATED)
async def add_series(
    payload: TVSeriesCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return await service.add_series(db, current_user, payload)


@router.get("/series/upcoming", response_model=List[UpcomingEpisodeResponse])
def get_upcoming(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.get_upcoming_episodes(db, current_user)


@router.get("/series/stats", response_model=TVDashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.get_dashboard_stats(db, current_user)


@router.get("/series/{tmdb_id}", response_model=TVSeriesResponse)
async def get_series_detail(
    tmdb_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return await service.get_series_detail(db, current_user, tmdb_id)


@router.patch("/series/{tmdb_id}", response_model=TVSeriesResponse)
def update_series(
    tmdb_id: int,
    payload: TVSeriesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.update_series(db, current_user, tmdb_id, payload)


@router.delete("/series/{tmdb_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_series(
    tmdb_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    service.delete_series(db, current_user, tmdb_id)


@router.post("/series/{tmdb_id}/watch-next", response_model=TVSeriesResponse)
def watch_next_episode(
    tmdb_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """
    Pulsante rapido '+1': segna come visto il prossimo episodio disponibile.
    """
    return service.watch_next_episode(db, current_user, tmdb_id)

# --- Episodes ---

class EpisodeNotesUpdate(BaseModel):
    notes: str | None
    review_visibility: str | None = None

@router.post("/episodes/{episode_id}/watched", response_model=TVEpisodeResponse)
def mark_episode_watched(
    episode_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.toggle_episode_watched(db, current_user, episode_id, watched=True)


@router.delete("/episodes/{episode_id}/watched", response_model=TVEpisodeResponse)
def mark_episode_unwatched(
    episode_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.toggle_episode_watched(db, current_user, episode_id, watched=False)


@router.patch("/episodes/{episode_id}", response_model=TVEpisodeResponse)
def update_episode_notes(
    episode_id: int,
    payload: EpisodeNotesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.update_episode_notes(db, current_user, episode_id, payload.notes, payload.review_visibility)


# --- Quotes ---

class QuoteCreate(BaseModel):
    episode_id: int
    quote_text: str

@router.post("/quotes", response_model=TVQuoteResponse, status_code=status.HTTP_201_CREATED)
def add_quote(
    payload: QuoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.add_quote(db, current_user, payload.episode_id, payload.quote_text)


@router.get("/quotes", response_model=List[TVQuoteExtendedResponse])
def get_user_quotes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.get_user_quotes(db, current_user)


@router.delete("/quotes/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    service.delete_quote(db, current_user, quote_id)
