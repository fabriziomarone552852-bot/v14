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
from backend.domains.trackers.models import TMDBSeries, TMDBEpisode, UserSeriesTracking
from backend.domains.trackers.schemas import (
    TMDBPaginatedSearch,
    TMDBSeriesSearchResult,
    TVSeriesCreate,
    TVSeriesUpdate,
    TVSeriesResponse,
    TVEpisodeResponse
)
from backend.domains.users.models import User

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

    return TMDBPaginatedSearch(**response.json())


async def fetch_tmdb_series_details(tmdb_id: int) -> dict:
    url = f"{TMDB_BASE_URL}/tv/{tmdb_id}"
    params = {"language": "it-IT"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=get_tmdb_headers(), params=params)

    if response.status_code == 404:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serie non trovata su TMDB")
    elif response.status_code != 200:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Errore TMDB")

    return response.json()


def safe_date(date_str: str | None):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None


async def sync_tmdb_series_lazy(db: Session, tmdb_id: int) -> TMDBSeries:
    """Lazy update: fetches from TMDB and updates TMDBSeries and TMDBEpisodes."""
    tmdb_data = await fetch_tmdb_series_details(tmdb_id)
    
    # Estrazione stringhe dai metadati TMDB
    genres_str = ", ".join([g["name"] for g in tmdb_data.get("genres", [])])
    networks_str = ", ".join([n["name"] for n in tmdb_data.get("networks", [])])
    creators_str = ", ".join([c["name"] for c in tmdb_data.get("created_by", [])])

    series = TMDBSeries(
        tmdb_id=tmdb_data.get("id"),
        title=tmdb_data.get("name", "Titolo Sconosciuto"),
        original_title=tmdb_data.get("original_name"),
        overview=tmdb_data.get("overview"),
        poster_path=tmdb_data.get("poster_path"),
        backdrop_path=tmdb_data.get("backdrop_path"),
        tmdb_status=tmdb_data.get("status"),
        genres=genres_str,
        networks=networks_str,
        creators=creators_str,
        total_seasons=tmdb_data.get("number_of_seasons"),
        total_episodes=tmdb_data.get("number_of_episodes"),
        first_air_date=safe_date(tmdb_data.get("first_air_date")),
        last_air_date=safe_date(tmdb_data.get("last_air_date")),
        last_sync_at=datetime.now(timezone.utc)
    )
    series = repository.upsert_tmdb_series(db, series)
    
    # 2. Fetch and upsert all episodes concurrently
    seasons = tmdb_data.get("seasons", [])
    season_numbers = [s["season_number"] for s in seasons if s["season_number"] > 0] # Ignore specials (season 0) if desired, or keep them. Let's keep them if they exist, but usually season 0 is specials. We'll fetch all.
    season_numbers = [s["season_number"] for s in seasons]
    
    if season_numbers:
        import asyncio
        async def fetch_season(sn: int):
            url = f"{TMDB_BASE_URL}/tv/{tmdb_id}/season/{sn}"
            params = {"language": "it-IT"}
            async with httpx.AsyncClient() as client:
                resp = await client.get(url, headers=get_tmdb_headers(), params=params)
                if resp.status_code == 200:
                    return resp.json().get("episodes", [])
                return []
                
        seasons_data = await asyncio.gather(*[fetch_season(sn) for sn in season_numbers])
        
        episodes_to_upsert = []
        for season_eps in seasons_data:
            for ep_data in season_eps:
                episodes_to_upsert.append(
                    TMDBEpisode(
                        series_tmdb_id=tmdb_id,
                        season_number=ep_data.get("season_number"),
                        episode_number=ep_data.get("episode_number"),
                        title=ep_data.get("name"),
                        overview=ep_data.get("overview"),
                        air_date=safe_date(ep_data.get("air_date"))
                    )
                )
        
        if episodes_to_upsert:
            repository.upsert_tmdb_episodes(db, episodes_to_upsert)
            
    return series


async def add_series(db: Session, current_user: User, payload: TVSeriesCreate) -> TVSeriesResponse:
    existing = repository.get_user_series_tracking(db, tmdb_id=payload.tmdb_id, user_id=current_user.id)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hai già aggiunto questa serie.")

    # Lazy sync the global catalog
    series = repository.get_tmdb_series(db, payload.tmdb_id)
    if not series:
        series = await sync_tmdb_series_lazy(db, payload.tmdb_id)
        
    tracking = UserSeriesTracking(
        user_id=current_user.id,
        series_tmdb_id=series.tmdb_id,
        status=payload.status,
    )
    tracking = repository.add_user_series_tracking(db, tracking)
    
    return _build_series_response(tracking)


def list_user_series(db: Session, current_user: User) -> List[TVSeriesResponse]:
    trackings = repository.list_user_series(db, current_user.id)
    responses = []
    for t in trackings:
        if not t.tmdb_series:
            continue
        episodes_data = repository.get_series_episodes_with_user_tracking(db, t.series_tmdb_id, current_user.id)
        responses.append(_build_series_response_with_next(db, current_user, t, episodes_data))
    return responses


def update_series(db: Session, current_user: User, tmdb_id: int, payload: TVSeriesUpdate) -> TVSeriesResponse:
    tracking = repository.get_user_series_tracking(db, tmdb_id, current_user.id)
    if not tracking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serie non trovata.")

    if payload.status is not None:
        tracking.status = payload.status
    if payload.rating is not None:
        tracking.rating = payload.rating
    if payload.notes is not None:
        tracking.notes = payload.notes
    if payload.custom_poster_path is not None:
        tracking.custom_poster_path = payload.custom_poster_path
    if payload.custom_backdrop_path is not None:
        tracking.custom_backdrop_path = payload.custom_backdrop_path
    if payload.review_visibility is not None:
        tracking.review_visibility = payload.review_visibility

    tracking = repository.update_user_series_tracking(db, tracking)
    return _build_series_response(tracking)


def delete_series(db: Session, current_user: User, tmdb_id: int) -> None:
    tracking = repository.get_user_series_tracking(db, tmdb_id, current_user.id)
    if not tracking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serie non trovata.")
    repository.delete_user_series_tracking(db, tracking)


def _build_series_response(tracking: UserSeriesTracking) -> TVSeriesResponse:
    s = tracking.tmdb_series
    return TVSeriesResponse(
        id=tracking.id,
        tmdb_id=s.tmdb_id,
        title=s.title,
        original_title=s.original_title,
        overview=s.overview,
        poster_path=tracking.custom_poster_path or s.poster_path,
        backdrop_path=tracking.custom_backdrop_path or s.backdrop_path,
        tmdb_status=s.tmdb_status,
        genres=s.genres,
        networks=s.networks,
        creators=s.creators,
        total_seasons=s.total_seasons,
        total_episodes=s.total_episodes,
        first_air_date=s.first_air_date,
        last_air_date=s.last_air_date,
        last_sync_at=s.last_sync_at,
        status=tracking.status,
        rating=tracking.rating,
        notes=tracking.notes,
        custom_poster_path=tracking.custom_poster_path,
        custom_backdrop_path=tracking.custom_backdrop_path,
        review_visibility=tracking.review_visibility,
        added_at=tracking.added_at,
        updated_at=tracking.updated_at,
        episodes=[]
    )

def _build_episode_response(tmdb_ep: TMDBEpisode, user_logs: List["UserEpisodeLog"]) -> TVEpisodeResponse:
    from backend.domains.trackers.schemas import EpisodeLogResponse
    logs_resp = [
        EpisodeLogResponse(
            id=log.id,
            notes=log.notes,
            review_visibility=log.review_visibility,
            watched_at=log.watched_at
        ) for log in user_logs
    ]
    
    return TVEpisodeResponse(
        id=tmdb_ep.id,
        series_tmdb_id=tmdb_ep.series_tmdb_id,
        season_number=tmdb_ep.season_number,
        episode_number=tmdb_ep.episode_number,
        title=tmdb_ep.title,
        overview=tmdb_ep.overview,
        air_date=tmdb_ep.air_date,
        is_watched=len(user_logs) > 0,
        watch_count=len(user_logs),
        logs=logs_resp
    )

def watch_next_episode(db: Session, current_user: User, tmdb_id: int) -> TVSeriesResponse:
    tracking = repository.get_user_series_tracking(db, tmdb_id, current_user.id)
    if not tracking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serie non trovata.")

    episodes_data = repository.get_series_episodes_with_user_tracking(db, tmdb_id, current_user.id)
    
    next_ep = None
    for tmdb_ep, user_logs in episodes_data:
        if len(user_logs) == 0:
            # First unwatched episode found
            next_ep = tmdb_ep
            break
            
    if not next_ep:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nessun episodio da guardare. Serie completata?")
        
    repository.mark_episode_watched(db, current_user.id, next_ep.id)
    
    return _build_series_response_with_next(db, current_user, tracking, episodes_data)

def _build_series_response_with_next(db, current_user, tracking, episodes_data) -> TVSeriesResponse:
    response = _build_series_response(tracking)
    
    # Reload episodes_data in case we modified it
    episodes_data = repository.get_series_episodes_with_user_tracking(db, tracking.series_tmdb_id, current_user.id)
    response.episodes = [_build_episode_response(tmdb_ep, user_logs) for tmdb_ep, user_logs in episodes_data]
    
    # Trova il next_episode_to_watch
    for tmdb_ep, user_logs in episodes_data:
        if len(user_logs) == 0:
            response.next_episode_to_watch = _build_episode_response(tmdb_ep, user_logs)
            break
            
    return response

async def get_series_detail(db: Session, current_user: User, tmdb_id: int) -> TVSeriesResponse:
    tracking = repository.get_user_series_tracking(db, tmdb_id, current_user.id)
    if not tracking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serie non trovata.")

    episodes_data = repository.get_series_episodes_with_user_tracking(db, tmdb_id, current_user.id)
    return _build_series_response_with_next(db, current_user, tracking, episodes_data)

def toggle_episode_watched(db: Session, current_user: User, episode_id: int, watched: bool) -> TVEpisodeResponse:
    import sqlalchemy
    stmt = sqlalchemy.select(TMDBEpisode).where(TMDBEpisode.id == episode_id)
    tmdb_ep = db.execute(stmt).scalar_one_or_none()
    if not tmdb_ep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Episodio non trovato.")
        
    if watched:
        repository.mark_episode_watched(db, current_user.id, episode_id)
    else:
        repository.mark_episode_unwatched(db, current_user.id, episode_id)
        
    # Fetch logs to return
    from backend.domains.trackers.models import UserEpisodeLog
    logs_stmt = sqlalchemy.select(UserEpisodeLog).where(UserEpisodeLog.user_id == current_user.id, UserEpisodeLog.episode_id == episode_id).order_by(UserEpisodeLog.watched_at.desc())
    user_logs = list(db.execute(logs_stmt).scalars().all())
        
    return _build_episode_response(tmdb_ep, user_logs)

def update_episode_notes(db: Session, current_user: User, episode_id: int, notes: str | None, review_visibility: str | None = None) -> TVEpisodeResponse:
    import sqlalchemy
    from backend.domains.trackers.models import UserEpisodeLog
    stmt = sqlalchemy.select(TMDBEpisode).where(TMDBEpisode.id == episode_id)
    tmdb_ep = db.execute(stmt).scalar_one_or_none()
    if not tmdb_ep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Episodio non trovato.")
        
    # Trova l'ultimo log, o ne crea uno se non esiste
    latest_log_stmt = sqlalchemy.select(UserEpisodeLog).where(UserEpisodeLog.user_id == current_user.id, UserEpisodeLog.episode_id == episode_id).order_by(UserEpisodeLog.watched_at.desc()).limit(1)
    latest_log = db.execute(latest_log_stmt).scalar_one_or_none()
    
    if not latest_log:
        latest_log = repository.mark_episode_watched(db, current_user.id, episode_id)
        
    if notes is not None:
        latest_log.notes = notes
    if review_visibility is not None:
        latest_log.review_visibility = review_visibility
    db.commit()
    db.refresh(latest_log)
    
    # Ricarica tutti i log per la response
    logs_stmt = sqlalchemy.select(UserEpisodeLog).where(UserEpisodeLog.user_id == current_user.id, UserEpisodeLog.episode_id == episode_id).order_by(UserEpisodeLog.watched_at.desc())
    user_logs = list(db.execute(logs_stmt).scalars().all())
    
    return _build_episode_response(tmdb_ep, user_logs)

def add_quote(db: Session, current_user: User, episode_id: int, quote_text: str) -> TVQuoteResponse:
    from backend.domains.trackers.models import TVQuote
    from backend.domains.trackers.schemas import TVQuoteResponse
    quote = TVQuote(user_id=current_user.id, episode_id=episode_id, quote_text=quote_text)
    db.add(quote)
    db.commit()
    db.refresh(quote)
    return TVQuoteResponse.model_validate(quote)

def delete_quote(db: Session, current_user: User, quote_id: int) -> None:
    import sqlalchemy
    from backend.domains.trackers.models import TVQuote
    stmt = sqlalchemy.select(TVQuote).where(TVQuote.id == quote_id, TVQuote.user_id == current_user.id)
    quote = db.execute(stmt).scalar_one_or_none()
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Citazione non trovata.")
    db.delete(quote)
    db.commit()

def get_upcoming_episodes(db: Session, current_user: User) -> List[UpcomingEpisodeResponse]:
    from backend.domains.trackers.schemas import UpcomingEpisodeResponse
    results = repository.get_upcoming_episodes(db, current_user.id)
    return [
        UpcomingEpisodeResponse(
            episode_id=ep.id,
            series_tmdb_id=s.tmdb_id,
            series_title=s.title,
            series_poster_path=s.poster_path,
            season_number=ep.season_number,
            episode_number=ep.episode_number,
            episode_title=ep.title,
            air_date=ep.air_date
        )
        for ep, s in results
    ]

def get_user_quotes(db: Session, current_user: User) -> List[TVQuoteExtendedResponse]:
    from backend.domains.trackers.schemas import TVQuoteExtendedResponse
    results = repository.get_user_quotes_extended(db, current_user.id)
    return [
        TVQuoteExtendedResponse(
            id=q.id,
            episode_id=q.episode_id,
            quote_text=q.quote_text,
            created_at=q.created_at,
            series_title=s.title,
            season_number=ep.season_number,
            episode_number=ep.episode_number,
            series_poster_path=s.poster_path
        )
        for q, ep, s in results
    ]


def get_dashboard_stats(db: Session, current_user: User) -> TVDashboardStats:
    from backend.domains.trackers.schemas import TVDashboardStats
    stats = repository.get_dashboard_stats(db, current_user.id)
    return TVDashboardStats(
        episodes_watched_this_year=stats["ep_count"],
        series_completed_this_year=stats["series_comp"],
        total_series_tracked=stats["total_series"],
        last_added_series=stats["last_added"],
        last_watched_episode=stats["last_ep"],
        last_completed_series=stats["last_completed"]
    )
