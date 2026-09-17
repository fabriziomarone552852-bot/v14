"""
API router for the Trackers domain (TV Series).
"""
from typing import List

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.core.deps import get_db, get_current_app_user
from backend.domains.trackers import service
from backend.domains.trackers.schemas import (
    TMDBPaginatedSearch,
    TVSeriesCreate,
    TVSeriesResponse,
    TVSeriesUpdate,
)
from backend.domains.users.models import User

router = APIRouter(prefix="/trackers/series", tags=["Trackers - Series"])


@router.get("/search", response_model=TMDBPaginatedSearch)
async def search_series(
    query: str = Query(..., min_length=1, description="Termine di ricerca per la serie TV (su TMDB)"),
    page: int = Query(1, ge=1, description="Numero di pagina per la paginazione"),
    current_user: User = Depends(get_current_app_user),
):
    """
    Ricerca una serie TV tramite TMDB.
    """
    return await service.search_tmdb_series(query=query, page=page)


@router.get("", response_model=List[TVSeriesResponse])
def get_my_series(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """
    Restituisce l'elenco delle serie TV tracciate dall'utente.
    """
    return service.list_user_series(db, current_user)


@router.post("", response_model=TVSeriesResponse, status_code=status.HTTP_201_CREATED)
async def add_series(
    payload: TVSeriesCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """
    Aggiunge una nuova serie TV ai tracker scaricando i dati da TMDB.
    """
    return await service.add_series(db, current_user, payload)


@router.patch("/{series_id}", response_model=TVSeriesResponse)
def update_series(
    series_id: int,
    payload: TVSeriesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """
    Aggiorna lo stato o il voto di una serie tracciata.
    """
    return service.update_series(db, current_user, series_id, payload)


@router.delete("/{series_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_series(
    series_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """
    Rimuove una serie dai tracker.
    """
    service.delete_series(db, current_user, series_id)
