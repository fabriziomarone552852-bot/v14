"""
API router for the Trackers domain (TV Series).
"""
from typing import List, Optional
from datetime import date

from fastapi import APIRouter, Depends, Query, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.core.deps import get_db, get_current_app_user
from backend.domains.trackers import repository
from backend.domains.trackers.service import sync_tmdb_series_lazy, _build_series_response_with_next
from backend.domains.trackers.models import UserSeriesTracking
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


@router.get("/series/{tmdb_id}/extras")
async def get_series_extras(
    tmdb_id: int,
    current_user: User = Depends(get_current_app_user),
):
    return await service.get_tmdb_series_extras(tmdb_id)

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
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.get_upcoming_episodes(db, current_user, start_date, end_date)


@router.get("/series/stats", response_model=TVDashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.get_dashboard_stats(db, current_user)


@router.get("/series/{tmdb_id}", response_model=TVSeriesResponse)
async def get_series_detail(
    tmdb_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    series = repository.get_tmdb_series(db, tmdb_id)
    if series:
        from datetime import datetime, timezone, timedelta
        if not series.last_sync_at or datetime.utcnow().replace(tzinfo=None) - series.last_sync_at.replace(tzinfo=None) > timedelta(hours=24):
            background_tasks.add_task(service.background_full_sync_series, tmdb_id)
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



class SeriesLogCreate(BaseModel):
    rating: int | None = None
    notes: str | None = None
    review_visibility: str | None = None
    watched_at: str | None = None

@router.post("/series/{tmdb_id}/logs", response_model=TVSeriesResponse)
def add_series_log(
    tmdb_id: int,
    payload: SeriesLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.add_series_log(db, current_user, tmdb_id, payload)

@router.patch("/series/logs/{log_id}", response_model=TVSeriesResponse)
def update_series_log(
    log_id: int,
    payload: SeriesLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.update_series_log(db, current_user, log_id, payload)

@router.delete("/series/logs/{log_id}", response_model=TVSeriesResponse)
def delete_series_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.delete_series_log(db, current_user, log_id)


# --- Episodes ---

class EpisodeNotesUpdate(BaseModel):
    rating: int | None = None
    notes: str | None = None
    review_visibility: str | None = None
    watched_at: str | None = None

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
    return service.update_episode_notes(db, current_user, episode_id, payload.notes, payload.review_visibility, payload.rating, payload.watched_at)



# --- Episode Logs (Diary Pattern) ---

from datetime import date
class EpisodeLogCreate(BaseModel):
    rating: int | None = None
    notes: str | None = None
    review_visibility: str | None = "friends_only"
    watched_at: date | None = None

@router.post("/episodes/{episode_id}/logs", response_model=TVEpisodeResponse, status_code=status.HTTP_201_CREATED)
def add_episode_log(
    episode_id: int,
    payload: EpisodeLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.add_episode_log(db, current_user, episode_id, payload.notes, payload.review_visibility, payload.rating, payload.watched_at)

@router.patch("/episodes/logs/{log_id}", response_model=TVEpisodeResponse)
def update_episode_log(
    log_id: int,
    payload: EpisodeLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.update_episode_log(db, current_user, log_id, payload.notes, payload.review_visibility, payload.rating, payload.watched_at)

@router.delete("/episodes/logs/{log_id}", response_model=TVEpisodeResponse)
def delete_episode_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.delete_episode_log(db, current_user, log_id)

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


class QuoteUpdate(BaseModel):
    quote_text: str

@router.patch("/quotes/{quote_id}", response_model=TVQuoteResponse)
def update_quote(
    quote_id: int,
    payload: QuoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.update_quote(db, current_user, quote_id, payload.quote_text)


@router.delete("/quotes/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    service.delete_quote(db, current_user, quote_id)

# --- Media Lists ---
from backend.domains.trackers.schemas import MediaListCreate, MediaListUpdate, MediaListResponse, MediaListItemCreate, MediaListItemResponse

@router.get("/lists", response_model=List[MediaListResponse])
def get_media_lists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.get_user_media_lists(db, current_user)

@router.post("/lists", response_model=MediaListResponse, status_code=status.HTTP_201_CREATED)
def create_media_list(
    payload: MediaListCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.create_media_list(db, current_user, payload)

@router.get("/lists/{list_id}", response_model=MediaListResponse)
def get_media_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.get_media_list(db, current_user, list_id)

@router.patch("/lists/{list_id}", response_model=MediaListResponse)
def update_media_list(
    list_id: int,
    payload: MediaListUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.update_media_list(db, current_user, list_id, payload)

@router.delete("/lists/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media_list(
    list_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    service.delete_media_list(db, current_user, list_id)

@router.post("/lists/{list_id}/items", response_model=MediaListItemResponse, status_code=status.HTTP_201_CREATED)
async def add_item_to_list(
    list_id: int,
    payload: MediaListItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return await service.add_item_to_media_list(db, current_user, list_id, payload)

@router.delete("/lists/{list_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_item_from_list(
    list_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    service.remove_item_from_media_list(db, current_user, list_id, item_id)

from backend.domains.trackers.schemas import FriendSeriesLogResponse, FriendEpisodeLogResponse

@router.get("/series/{tmdb_id}/friends-reviews", response_model=List[FriendSeriesLogResponse])
def get_friends_series_reviews(
    tmdb_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.get_friends_series_logs(db, current_user, tmdb_id)

@router.get("/episodes/{episode_id}/friends-reviews", response_model=List[FriendEpisodeLogResponse])
def get_friends_episode_reviews(
    episode_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.get_friends_episode_logs(db, current_user, episode_id)

@router.get("/series/{tmdb_id}/providers")
async def get_series_providers(
    tmdb_id: int,
    current_user: User = Depends(get_current_app_user),
):
    return await service.fetch_tmdb_series_providers(tmdb_id)


@router.get("/series/{tmdb_id}/preview", response_model=TVSeriesResponse)
async def get_series_preview(
    tmdb_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    series = repository.get_tmdb_series(db, tmdb_id)
    episodes_data = repository.get_series_episodes_with_user_tracking(db, tmdb_id, current_user.id)
    from datetime import datetime, timezone, timedelta
    if not series:
        series, seasons = await service.sync_tmdb_series_metadata_only(db, tmdb_id)
        if seasons:
            background_tasks.add_task(service.background_sync_tmdb_episodes, tmdb_id, seasons)
        episodes_data = []
    else:
        if not series.last_sync_at or datetime.utcnow().replace(tzinfo=None) - series.last_sync_at.replace(tzinfo=None) > timedelta(hours=24):
            background_tasks.add_task(service.background_full_sync_series, tmdb_id)
        elif len(episodes_data) == 0:
            series, seasons = await service.sync_tmdb_series_metadata_only(db, tmdb_id)
            if seasons:
                background_tasks.add_task(service.background_sync_tmdb_episodes, tmdb_id, seasons)
            episodes_data = []
    
    from datetime import datetime
    dummy_tracking = UserSeriesTracking(
        user_id=current_user.id,
        series_tmdb_id=tmdb_id,
        status="to_watch",
        added_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    dummy_tracking.id = 0
    dummy_tracking.review_visibility = "private"
    dummy_tracking.tmdb_series = series

    return _build_series_response_with_next(db, current_user, dummy_tracking, episodes_data)

@router.post("/series/{tmdb_id}/watched-all")
def mark_all_episodes_watched_endpoint(
    tmdb_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    return service.mark_all_episodes_watched(db, current_user, tmdb_id)





