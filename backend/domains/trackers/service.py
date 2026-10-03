"""
Business logic and external API integrations for Trackers domain.
"""
from datetime import datetime, timezone
from typing import List, Optional
from collections import defaultdict

import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.core.settings import get_settings
from backend.domains.trackers import repository

def _sync_series_status(db: Session, user_id: int, tmdb_series_id: int):
    from backend.domains.trackers.models import TMDBEpisode, UserEpisodeLog, UserSeriesTracking, TMDBSeries
    import sqlalchemy
    
    tracking = db.execute(
        sqlalchemy.select(UserSeriesTracking)
        .where(UserSeriesTracking.user_id == user_id, UserSeriesTracking.series_tmdb_id == tmdb_series_id)
    ).scalar_one_or_none()
    
    if not tracking:
        return
        
    if tracking.status == "dropped":
        return

    total_eps_stmt = sqlalchemy.select(sqlalchemy.func.count(TMDBEpisode.id)).where(TMDBEpisode.series_tmdb_id == tmdb_series_id)
    total_eps = db.execute(total_eps_stmt).scalar() or 0

    watched_eps_stmt = sqlalchemy.select(sqlalchemy.func.count(sqlalchemy.func.distinct(UserEpisodeLog.episode_id)))        .join(TMDBEpisode, TMDBEpisode.id == UserEpisodeLog.episode_id)        .where(UserEpisodeLog.user_id == user_id, TMDBEpisode.series_tmdb_id == tmdb_series_id)
    watched_eps = db.execute(watched_eps_stmt).scalar() or 0

    if watched_eps == 0:
        tracking.status = "to_watch"
    elif watched_eps < total_eps:
        tracking.status = "watching"
    elif total_eps > 0 and watched_eps >= total_eps:
        tracking.status = "watched"
        
    db.commit()

from backend.domains.trackers.models import TMDBSeries, TMDBEpisode, UserSeriesTracking

def is_missing_overview(overview: str | None) -> bool:
    if not overview:
        return True
    lower_ov = overview.lower()
    missing_phrases = [
        "nessuna trama",
        "nessuna traduzione",
        "non abbiamo",
        "we don't have",
        "non ci sono",
        "nessun riassunto"
    ]
    return any(phrase in lower_ov for phrase in missing_phrases)

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



async def get_tmdb_series_extras(tmdb_id: int) -> dict:
    url = f"{TMDB_BASE_URL}/tv/{tmdb_id}"
    params = {
        "language": "it-IT",
        "append_to_response": "credits,recommendations"
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=get_tmdb_headers(), params=params)

    if response.status_code == 404:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serie non trovata su TMDB")
    elif response.status_code != 200:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Errore TMDB")

    data = response.json()
    
    # Estrai il cast principale (primi 10 attori)
    cast_data = data.get("credits", {}).get("cast", [])
    cast = [
        {
            "id": c.get("id"),
            "name": c.get("name"),
            "character": c.get("character"),
            "profile_path": c.get("profile_path")
        } for c in cast_data[:10]
    ]
    
    # Estrai le raccomandazioni (prime 10)
    recs_data = data.get("recommendations", {}).get("results", [])
    recommendations = [
        {
            "id": r.get("id"),
            "name": r.get("name"),
            "title": r.get("name"),
            "tmdb_id": r.get("id"),
            "backdrop_path": r.get("backdrop_path"),
            "poster_path": r.get("poster_path")
        } for r in recs_data[:10]
    ]

    return {
        "cast": cast,
        "recommendations": recommendations
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

    async with httpx.AsyncClient(timeout=15.0) as client:
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

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=get_tmdb_headers(), params=params)

    if response.status_code == 404:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serie non trovata su TMDB")
    elif response.status_code != 200:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Errore TMDB")

    data = response.json()
    if is_missing_overview(data.get("overview")):
        params_en = {"language": "en-US"}
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp_en = await client.get(url, headers=get_tmdb_headers(), params=params_en)
            if resp_en.status_code == 200:
                data_en = resp_en.json()
                if not is_missing_overview(data_en.get("overview")):
                    data["overview"] = data_en["overview"]

    return data

async def fetch_tmdb_series_providers(tmdb_id: int) -> dict:
    url = f"{TMDB_BASE_URL}/tv/{tmdb_id}/watch/providers"
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=get_tmdb_headers())
    
    if response.status_code != 200:
        return {}
    
    data = response.json()
    results = data.get("results", {})
    # Return IT providers if available, else empty
    it_providers = results.get("IT", {})
    return it_providers



def safe_date(date_str: str | None):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return None


async def sync_tmdb_series_lazy(db: Session, tmdb_id: int) -> TMDBSeries:
    """Lazy update: fetches from TMDB and updates TMDBSeries and TMDBEpisodes."""
    series, seasons = await sync_tmdb_series_metadata_only(db, tmdb_id)
    if seasons:
        await sync_tmdb_episodes_for_seasons(db, tmdb_id, seasons)
    return series

async def sync_tmdb_series_metadata_only(db: Session, tmdb_id: int):
    tmdb_data = await fetch_tmdb_series_details(tmdb_id)
    
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
        vote_average=tmdb_data.get("vote_average"),
        last_sync_at=datetime.now(timezone.utc)
    )
    series = repository.upsert_tmdb_series(db, series)
    seasons = tmdb_data.get("seasons", [])
    return series, seasons

async def sync_tmdb_episodes_for_seasons(db: Session, tmdb_id: int, seasons: list):
    season_numbers = [s["season_number"] for s in seasons]
    
    if season_numbers:
        import asyncio
        async def fetch_season(sn: int):
            url = f"{TMDB_BASE_URL}/tv/{tmdb_id}/season/{sn}"
            params = {"language": "it-IT"}
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(url, headers=get_tmdb_headers(), params=params)
                if resp.status_code == 200:
                    data = resp.json().get("episodes", [])
                    needs_en = any(is_missing_overview(ep.get("overview")) for ep in data)
                    if needs_en:
                        resp_en = await client.get(url, headers=get_tmdb_headers(), params={"language": "en-US"})
                        if resp_en.status_code == 200:
                            data_en = resp_en.json().get("episodes", [])
                            en_dict = {ep.get("episode_number"): ep.get("overview") for ep in data_en if not is_missing_overview(ep.get("overview"))}
                            for ep in data:
                                if is_missing_overview(ep.get("overview")) and ep.get("episode_number") in en_dict:
                                    ep["overview"] = en_dict[ep.get("episode_number")]
                    return data
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
                        air_date=safe_date(ep_data.get("air_date")),
                        still_path=ep_data.get("still_path"),
                        vote_average=ep_data.get("vote_average")
                    )
                )
        
        if episodes_to_upsert:
            repository.upsert_tmdb_episodes(db, episodes_to_upsert)

async def background_sync_tmdb_episodes(tmdb_id: int, seasons: list):
    from backend.core.database import SessionLocal
    db = SessionLocal()
    try:
        await sync_tmdb_episodes_for_seasons(db, tmdb_id, seasons)
    finally:
        db.close()

async def background_full_sync_series(tmdb_id: int):
    from backend.core.database import SessionLocal
    import logging
    db = SessionLocal()
    try:
        series, seasons = await sync_tmdb_series_metadata_only(db, tmdb_id)
        if seasons:
            await sync_tmdb_episodes_for_seasons(db, tmdb_id, seasons)
    except Exception as e:
        logging.error(f"Error in background full sync for {tmdb_id}: {e}")
    finally:
        db.close()


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
    
    episodes_data = repository.get_series_episodes_with_user_tracking(db, tracking.series_tmdb_id, current_user.id)
    return _build_series_response_with_next(db, current_user, tracking, episodes_data)


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

    update_data = payload.model_dump(exclude_unset=True)
    if "status" in update_data:
        tracking.status = update_data["status"]

    if "custom_poster_path" in update_data:
        tracking.custom_poster_path = update_data["custom_poster_path"]
    if "custom_backdrop_path" in update_data:
        tracking.custom_backdrop_path = update_data["custom_backdrop_path"]

    tracking = repository.update_user_series_tracking(db, tracking)
    return _build_series_response(tracking, db, current_user)


def delete_series(db: Session, current_user: User, tmdb_id: int) -> None:
    tracking = repository.get_user_series_tracking(db, tmdb_id, current_user.id)
    if not tracking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serie non trovata.")
    repository.delete_user_series_tracking(db, tracking)


def _build_series_response(tracking: UserSeriesTracking, db=None, current_user=None) -> TVSeriesResponse:
    s = tracking.tmdb_series
    
    logs_data = []
    if db and current_user:
        import sqlalchemy
        from backend.domains.trackers.models import UserSeriesLog
        from backend.domains.notifications.models import Interaction
        from backend.domains.users.models import User
        
        stmt = sqlalchemy.select(UserSeriesLog).options(sqlalchemy.orm.joinedload(UserSeriesLog.viewing_platform)).where(
            UserSeriesLog.user_id == current_user.id,
            UserSeriesLog.series_tmdb_id == tracking.series_tmdb_id
        ).order_by(UserSeriesLog.updated_at.desc())
        raw_logs = list(db.execute(stmt).scalars().all())
        
        for raw_log in raw_logs:
            comments_stmt = (
                sqlalchemy.select(Interaction, User)
                .join(User, User.id == Interaction.author_id)
                .where(
                    Interaction.interaction_type == "SERIES_REVIEW_COMMENT",
                    Interaction.reference_id == raw_log.id
                )
                .order_by(Interaction.created_at.asc())
            )
            comments_res = db.execute(comments_stmt).all()
            comments_list = [
                {
                    "id": c_int.id,
                    "author_id": c_user.id,
                    "author_name": c_user.username,
                    "author_avatar": c_user.profile_picture_url,
                    "text": c_int.content,
                    "created_at": c_int.created_at
                }
                for c_int, c_user in comments_res
            ]
            
            log_dict = {
                "id": raw_log.id,
                "user_id": raw_log.user_id,
                "series_tmdb_id": raw_log.series_tmdb_id,
                "rating": raw_log.rating,
                "notes": raw_log.notes,
                "review_visibility": raw_log.review_visibility,
                "viewing_platform_id": raw_log.viewing_platform_id,
                "viewing_platform_name": raw_log.viewing_platform.name if raw_log.viewing_platform else None,
                "watched_at": raw_log.watched_at,
                "updated_at": raw_log.updated_at,
                "comments": comments_list
            }
            logs_data.append(log_dict)
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
        vote_average=s.vote_average,
        last_sync_at=s.last_sync_at,
        status=tracking.status,
        custom_poster_path=tracking.custom_poster_path,
        custom_backdrop_path=tracking.custom_backdrop_path,
        added_at=tracking.added_at,
        logs=logs_data,
        updated_at=tracking.updated_at,
        episodes=[]
    )

def _build_episode_response(tmdb_ep: TMDBEpisode, user_logs: List["UserEpisodeLog"], quotes: List["TVQuote"] = None, db=None) -> TVEpisodeResponse:
    from backend.domains.trackers.schemas import EpisodeLogResponse, TVQuoteResponse
    from backend.domains.notifications.models import Interaction
    from backend.domains.users.models import User
    import sqlalchemy
    
    logs_resp = []
    for log in user_logs:
        comments_list = []
        if db:
            comments_stmt = (
                sqlalchemy.select(Interaction, User)
                .join(User, User.id == Interaction.author_id)
                .where(
                    Interaction.interaction_type == "EPISODE_REVIEW_COMMENT",
                    Interaction.reference_id == log.id
                )
                .order_by(Interaction.created_at.asc())
            )
            comments_res = db.execute(comments_stmt).all()
            comments_list = [
                {
                    "id": c_int.id,
                    "author_id": c_user.id,
                    "author_name": c_user.username,
                    "author_avatar": c_user.profile_picture_url,
                    "text": c_int.content,
                    "created_at": c_int.created_at
                }
                for c_int, c_user in comments_res
            ]
            
        logs_resp.append(EpisodeLogResponse(
            id=log.id,
            rating=log.rating,
            notes=log.notes,
            review_visibility=log.review_visibility,
            watched_at=log.watched_at,
            comments=comments_list
        ))
    
    quotes_resp = []
    if quotes:
        quotes_resp = [
            TVQuoteResponse(
                id=q.id,
                episode_id=q.episode_id,
                quote_text=q.quote_text,
                created_at=q.created_at
            ) for q in quotes
        ]
    
    return TVEpisodeResponse(
        id=tmdb_ep.id,
        series_tmdb_id=tmdb_ep.series_tmdb_id,
        season_number=tmdb_ep.season_number,
        episode_number=tmdb_ep.episode_number,
        title=tmdb_ep.title,
        overview=tmdb_ep.overview,
        air_date=tmdb_ep.air_date,
        still_path=tmdb_ep.still_path,
        vote_average=tmdb_ep.vote_average,
        is_watched=len(user_logs) > 0,
        watch_count=len(user_logs),
        logs=logs_resp,
        quotes=quotes_resp
    )

def watch_next_episode(db: Session, current_user: User, tmdb_id: int) -> TVSeriesResponse:
    tracking = repository.get_user_series_tracking(db, tmdb_id, current_user.id)
    if not tracking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Serie non trovata.")

    episodes_data = repository.get_series_episodes_with_user_tracking(db, tmdb_id, current_user.id)
    
    next_ep = None
    for tmdb_ep, user_logs, quotes in episodes_data:
        if len(user_logs) == 0:
            # First unwatched episode found
            next_ep = tmdb_ep
            break
            
    if not next_ep:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nessun episodio da guardare. Serie completata?")
        
    repository.mark_episode_watched(db, current_user.id, next_ep.id)
    _sync_series_status(db, current_user.id, next_ep.series_tmdb_id)
    
    return _build_series_response_with_next(db, current_user, tracking, episodes_data)

def _build_series_response_with_next(db, current_user, tracking, episodes_data) -> TVSeriesResponse:
    response = _build_series_response(tracking, db, current_user)
    
    # Reload episodes_data in case we modified it
    episodes_data = repository.get_series_episodes_with_user_tracking(db, tracking.series_tmdb_id, current_user.id)
    response.episodes = [_build_episode_response(tmdb_ep, user_logs, quotes, db=db) for tmdb_ep, user_logs, quotes in episodes_data]
    
    # Trova il next_episode_to_watch
    for tmdb_ep, user_logs, quotes in episodes_data:
        if len(user_logs) == 0:
            response.next_episode_to_watch = _build_episode_response(tmdb_ep, user_logs, quotes, db=db)
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
        
    _sync_series_status(db, current_user.id, tmdb_ep.series_tmdb_id)
        
    # Fetch logs and quotes to return
    from backend.domains.trackers.models import UserEpisodeLog, TVQuote
    logs_stmt = sqlalchemy.select(UserEpisodeLog).where(UserEpisodeLog.user_id == current_user.id, UserEpisodeLog.episode_id == episode_id).order_by(UserEpisodeLog.watched_at.desc())
    user_logs = list(db.execute(logs_stmt).scalars().all())
    
    quotes_stmt = sqlalchemy.select(TVQuote).where(TVQuote.user_id == current_user.id, TVQuote.episode_id == episode_id).order_by(TVQuote.created_at.desc())
    user_quotes = list(db.execute(quotes_stmt).scalars().all())
        
    return _build_episode_response(tmdb_ep, user_logs, user_quotes, db=db)

def mark_all_episodes_watched(db: Session, current_user: User, tmdb_series_id: int):
    tracking = repository.get_user_series_tracking(db, tmdb_series_id, current_user.id)
    if not tracking:
        tracking = repository.create_user_series_tracking(db, tmdb_series_id, current_user.id, status="watching")
        
    repository.mark_all_episodes_watched(db, current_user.id, tmdb_series_id)
    _sync_series_status(db, current_user.id, tmdb_series_id)
    return {"status": "success"}

def update_episode_notes(db: Session, current_user: User, episode_id: int, notes: str | None, review_visibility: str | None = None, rating: int | None = None, watched_at_str: str | None = None) -> TVEpisodeResponse:
    import sqlalchemy
    from datetime import datetime, timezone
    from backend.domains.trackers.models import UserEpisodeLog, TVQuote
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
    if rating is not None:
        latest_log.rating = rating
    if watched_at_str is not None:
        try:
            parsed_date = datetime.strptime(watched_at_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            latest_log.watched_at = parsed_date
        except Exception:
            pass

    tmdb_ep = db.execute(sqlalchemy.select(TMDBEpisode).where(TMDBEpisode.id == episode_id)).scalar_one_or_none()
    if tmdb_ep:
        _sync_series_status(db, current_user.id, tmdb_ep.series_tmdb_id)
    if review_visibility is not None:
        latest_log.review_visibility = review_visibility
    db.commit()
    db.refresh(latest_log)
    
    # Ricarica tutti i log e quotes per la response
    logs_stmt = sqlalchemy.select(UserEpisodeLog).where(UserEpisodeLog.user_id == current_user.id, UserEpisodeLog.episode_id == episode_id).order_by(UserEpisodeLog.watched_at.desc())
    user_logs = list(db.execute(logs_stmt).scalars().all())
    
    quotes_stmt = sqlalchemy.select(TVQuote).where(TVQuote.user_id == current_user.id, TVQuote.episode_id == episode_id).order_by(TVQuote.created_at.desc())
    user_quotes = list(db.execute(quotes_stmt).scalars().all())
    
    return _build_episode_response(tmdb_ep, user_logs, user_quotes, db=db)


def add_episode_log(db: Session, current_user: User, episode_id: int, notes: str | None, review_visibility: str | None = None, rating: int | None = None, watched_at_date: date | None = None) -> TVEpisodeResponse:
    import sqlalchemy
    from datetime import datetime, timezone
    from backend.domains.trackers.models import UserEpisodeLog, TMDBEpisode, TVQuote
    from fastapi import HTTPException, status
    
    stmt = sqlalchemy.select(TMDBEpisode).where(TMDBEpisode.id == episode_id)
    tmdb_ep = db.execute(stmt).scalar_one_or_none()
    if not tmdb_ep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Episodio non trovato.")
        
    watched_dt = datetime.now(timezone.utc)
    if watched_at_date:
        watched_dt = datetime.combine(watched_at_date, datetime.min.time()).replace(tzinfo=timezone.utc)
        
    new_log = UserEpisodeLog(
        user_id=current_user.id,
        episode_id=episode_id,
        rating=rating,
        notes=notes,
        review_visibility=review_visibility or "friends_only",
        watched_at=watched_dt
    )
    db.add(new_log)
    db.commit()
    
    # Ricarica e restituisci l'episodio
    logs_stmt = sqlalchemy.select(UserEpisodeLog).where(UserEpisodeLog.user_id == current_user.id, UserEpisodeLog.episode_id == episode_id).order_by(UserEpisodeLog.watched_at.desc())
    user_logs = list(db.execute(logs_stmt).scalars().all())
    quotes_stmt = sqlalchemy.select(TVQuote).where(TVQuote.user_id == current_user.id, TVQuote.episode_id == episode_id).order_by(TVQuote.created_at.desc())
    user_quotes = list(db.execute(quotes_stmt).scalars().all())
    return _build_episode_response(tmdb_ep, user_logs, user_quotes, db=db)

def update_episode_log(db: Session, current_user: User, log_id: int, notes: str | None, review_visibility: str | None = None, rating: int | None = None, watched_at_date: date | None = None) -> TVEpisodeResponse:
    import sqlalchemy
    from datetime import datetime, timezone
    from backend.domains.trackers.models import UserEpisodeLog, TMDBEpisode, TVQuote
    from fastapi import HTTPException, status
    
    stmt = sqlalchemy.select(UserEpisodeLog).where(UserEpisodeLog.id == log_id, UserEpisodeLog.user_id == current_user.id)
    log = db.execute(stmt).scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recensione non trovata.")
        
    log.notes = notes
    log.rating = rating
    if review_visibility:
        log.review_visibility = review_visibility
    if watched_at_date:
        log.watched_at = datetime.combine(watched_at_date, datetime.min.time()).replace(tzinfo=timezone.utc)
        
    db.commit()
    
    # Ricarica e restituisci
    ep_stmt = sqlalchemy.select(TMDBEpisode).where(TMDBEpisode.id == log.episode_id)
    tmdb_ep = db.execute(ep_stmt).scalar_one_or_none()
    
    logs_stmt = sqlalchemy.select(UserEpisodeLog).where(UserEpisodeLog.user_id == current_user.id, UserEpisodeLog.episode_id == log.episode_id).order_by(UserEpisodeLog.watched_at.desc())
    user_logs = list(db.execute(logs_stmt).scalars().all())
    quotes_stmt = sqlalchemy.select(TVQuote).where(TVQuote.user_id == current_user.id, TVQuote.episode_id == log.episode_id).order_by(TVQuote.created_at.desc())
    user_quotes = list(db.execute(quotes_stmt).scalars().all())
    return _build_episode_response(tmdb_ep, user_logs, user_quotes, db=db)

def delete_episode_log(db: Session, current_user: User, log_id: int) -> TVEpisodeResponse:
    import sqlalchemy
    from backend.domains.trackers.models import UserEpisodeLog, TMDBEpisode, TVQuote
    from fastapi import HTTPException, status
    
    stmt = sqlalchemy.select(UserEpisodeLog).where(UserEpisodeLog.id == log_id, UserEpisodeLog.user_id == current_user.id)
    log = db.execute(stmt).scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recensione non trovata.")
        
    episode_id = log.episode_id
    db.delete(log)
    db.commit()
    
    ep_stmt = sqlalchemy.select(TMDBEpisode).where(TMDBEpisode.id == episode_id)
    tmdb_ep = db.execute(ep_stmt).scalar_one_or_none()
    
    logs_stmt = sqlalchemy.select(UserEpisodeLog).where(UserEpisodeLog.user_id == current_user.id, UserEpisodeLog.episode_id == episode_id).order_by(UserEpisodeLog.watched_at.desc())
    user_logs = list(db.execute(logs_stmt).scalars().all())
    quotes_stmt = sqlalchemy.select(TVQuote).where(TVQuote.user_id == current_user.id, TVQuote.episode_id == episode_id).order_by(TVQuote.created_at.desc())
    user_quotes = list(db.execute(quotes_stmt).scalars().all())
    return _build_episode_response(tmdb_ep, user_logs, user_quotes, db=db)

def add_quote(db: Session, current_user: User, episode_id: int, quote_text: str) -> TVQuoteResponse:
    from backend.domains.trackers.models import TVQuote
    from backend.domains.trackers.schemas import TVQuoteResponse
    quote = TVQuote(user_id=current_user.id, episode_id=episode_id, quote_text=quote_text)
    db.add(quote)
    db.commit()
    db.refresh(quote)
    return TVQuoteResponse.model_validate(quote)

def update_quote(db: Session, current_user: User, quote_id: int, quote_text: str):
    import sqlalchemy
    from backend.domains.trackers.models import TVQuote
    from backend.domains.trackers.schemas import TVQuoteResponse
    from fastapi import HTTPException, status
    stmt = sqlalchemy.select(TVQuote).where(TVQuote.id == quote_id, TVQuote.user_id == current_user.id)
    quote = db.execute(stmt).scalar_one_or_none()
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Citazione non trovata.")
    quote.quote_text = quote_text
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

def get_upcoming_episodes(db: Session, current_user: User, start_date=None, end_date=None) -> List[UpcomingEpisodeResponse]:
    from backend.domains.trackers.schemas import UpcomingEpisodeResponse
    results = repository.get_upcoming_episodes(db, current_user.id, start_date, end_date)
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

from backend.domains.trackers.schemas import MediaListCreate, MediaListUpdate, MediaListResponse, MediaListItemCreate, MediaListItemResponse, MediaListItemUpdate, TMDBSeriesSimpleResponse
from backend.domains.trackers.models import MediaList, MediaListItem

def get_user_media_lists(db: Session, current_user: User) -> List[MediaListResponse]:
    lists = repository.get_media_lists(db, current_user.id)
    return [_build_media_list_response(l) for l in lists]

def get_media_list(db: Session, current_user: User, list_id: int) -> MediaListResponse:
    lst = repository.get_media_list(db, list_id, current_user.id)
    if not lst:
        raise HTTPException(status_code=404, detail="Lista non trovata")
    return _build_media_list_response(lst)

def create_media_list(db: Session, current_user: User, payload: MediaListCreate) -> MediaListResponse:
    lst = MediaList(
        user_id=current_user.id,
        name=payload.name,
        description=payload.description,
        visibility=payload.visibility
    )
    lst = repository.create_media_list(db, lst)
    return _build_media_list_response(lst)

def update_media_list(db: Session, current_user: User, list_id: int, payload: MediaListUpdate) -> MediaListResponse:
    lst = repository.get_media_list(db, list_id, current_user.id)
    if not lst:
        raise HTTPException(status_code=404, detail="Lista non trovata")
    if payload.name is not None:
        lst.name = payload.name
    if payload.description is not None:
        lst.description = payload.description
    if payload.visibility is not None:
        lst.visibility = payload.visibility
    lst = repository.update_media_list(db, lst)
    return _build_media_list_response(lst)

def delete_media_list(db: Session, current_user: User, list_id: int) -> None:
    lst = repository.get_media_list(db, list_id, current_user.id)
    if not lst:
        raise HTTPException(status_code=404, detail="Lista non trovata")
    repository.delete_media_list(db, lst)

async def add_item_to_media_list(db: Session, current_user: User, list_id: int, payload: MediaListItemCreate) -> MediaListItemResponse:
    lst = repository.get_media_list(db, list_id, current_user.id)
    if not lst:
        raise HTTPException(status_code=404, detail="Lista non trovata")

    # If adding a TMDB series, ensure it exists in our local catalog
    if payload.series_tmdb_id:
        series = repository.get_tmdb_series(db, payload.series_tmdb_id)
        if not series:
            await sync_tmdb_series_lazy(db, payload.series_tmdb_id)

    item = MediaListItem(
        list_id=list_id,
        series_tmdb_id=payload.series_tmdb_id,
        sort_order=payload.sort_order
    )
    item = repository.add_item_to_media_list(db, item)
    lst = repository.get_media_list(db, list_id, current_user.id)
    added = next((x for x in lst.items if x.id == item.id), item)
    return _build_media_list_item_response(added)

def remove_item_from_media_list(db: Session, current_user: User, list_id: int, item_id: int) -> None:
    lst = repository.get_media_list(db, list_id, current_user.id)
    if not lst:
        raise HTTPException(status_code=404, detail="Lista non trovata")
    item = repository.get_media_list_item(db, item_id)
    if not item or item.list_id != lst.id:
        raise HTTPException(status_code=404, detail="Elemento non trovato")
    repository.delete_item_from_media_list(db, item)

def _build_media_list_item_response(item: MediaListItem) -> MediaListItemResponse:
    series_resp = None
    if item.series:
        series_resp = TMDBSeriesSimpleResponse(
            tmdb_id=item.series.tmdb_id,
            title=item.series.title,
            poster_path=item.series.poster_path,
            backdrop_path=item.series.backdrop_path,
            genres=item.series.genres
        )
    return MediaListItemResponse(
        id=item.id,
        list_id=item.list_id,
        series_tmdb_id=item.series_tmdb_id,
        sort_order=item.sort_order,
        added_at=item.added_at,
        series=series_resp
    )

def _build_media_list_response(lst: MediaList) -> MediaListResponse:
    items = sorted([_build_media_list_item_response(i) for i in lst.items], key=lambda x: x.sort_order)
    return MediaListResponse(
        id=lst.id,
        user_id=lst.user_id,
        name=lst.name,
        description=lst.description,
        visibility=lst.visibility,
        created_at=lst.created_at,
        updated_at=lst.updated_at,
        items=items
    )

def get_friends_series_logs(db: Session, current_user: User, tmdb_id: int):
    return repository.get_friends_series_logs(db, current_user.id, tmdb_id)

def get_friends_episode_logs(db: Session, current_user: User, episode_id: int):
    return repository.get_friends_episode_logs(db, current_user.id, episode_id)












def _get_or_create_tv_platform(db: Session, user_id: int, platform_name: str) -> int:
    from backend.domains.trackers.models import UserTVPlatform
    import sqlalchemy
    platform_name = platform_name.strip()
    platform = db.execute(sqlalchemy.select(UserTVPlatform).where(UserTVPlatform.user_id == user_id, UserTVPlatform.name.ilike(platform_name))).scalar_one_or_none()
    if platform:
        return platform.id
    
    new_platform = UserTVPlatform(user_id=user_id, name=platform_name)
    db.add(new_platform)
    db.commit()
    return new_platform.id

def add_series_log(db, current_user, tmdb_id, payload):
    import sqlalchemy
    from backend.domains.trackers.models import UserSeriesLog
    from datetime import datetime, timezone
    
    platform_id = payload.viewing_platform_id
    if getattr(payload, "viewing_platform_name", None):
        platform_id = _get_or_create_tv_platform(db, current_user.id, payload.viewing_platform_name)
        
    # Ensure tracking exists
    tracking = repository.get_user_series_tracking(db, tmdb_id, current_user.id)
    if not tracking:
        from backend.domains.trackers.router import TVSeriesCreate
        tracking = create_series(db, current_user, TVSeriesCreate(tmdb_id=tmdb_id))
        
    log = UserSeriesLog(
        user_id=current_user.id,
        series_tmdb_id=tmdb_id,
        rating=payload.rating,
        notes=payload.notes,
        review_visibility=payload.review_visibility or "friends_only",
        viewing_platform_id=platform_id,
        updated_at=payload.watched_at or datetime.now(timezone.utc)
    )
    db.add(log)
    db.commit()
    db.expire_all() # Force fresh fetch, don't detach users
    
    # Reload tracking
    tracking = repository.get_user_series_tracking(db, tmdb_id, current_user.id)
    return _build_series_response(tracking, db, current_user)

def update_series_log(db, current_user, log_id, payload):
    import sqlalchemy
    from backend.domains.trackers.models import UserSeriesLog
    
    log = db.execute(sqlalchemy.select(UserSeriesLog).where(UserSeriesLog.id == log_id, UserSeriesLog.user_id == current_user.id)).scalar_one_or_none()
    if not log:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Log non trovato")
        
    if getattr(payload, "rating", None) is not None:
        log.rating = payload.rating
    if getattr(payload, "notes", None) is not None:
        log.notes = payload.notes
    if getattr(payload, "review_visibility", None) is not None:
        log.review_visibility = payload.review_visibility
        
    platform_id = payload.viewing_platform_id
    if getattr(payload, "viewing_platform_name", None):
        platform_id = _get_or_create_tv_platform(db, current_user.id, payload.viewing_platform_name)
    if platform_id is not None or getattr(payload, "viewing_platform_name", None) == "":
        log.viewing_platform_id = platform_id if platform_id else None
        
    if getattr(payload, "watched_at", None) is not None:
        log.updated_at = payload.watched_at
        
    series_tmdb_id = log.series_tmdb_id
    db.commit()
    db.expire_all() # Force fresh fetch, don't detach users
    tracking = repository.get_user_series_tracking(db, series_tmdb_id, current_user.id)
    return _build_series_response(tracking, db, current_user)

def delete_series_log(db, current_user, log_id):
    import sqlalchemy
    from backend.domains.trackers.models import UserSeriesLog
    from fastapi import HTTPException, status
    
    log = db.execute(sqlalchemy.select(UserSeriesLog).where(UserSeriesLog.id == log_id, UserSeriesLog.user_id == current_user.id)).scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Log non trovato")
        
    tmdb_id = log.series_tmdb_id
    db.delete(log)
    db.commit()
    
    tracking = repository.get_user_series_tracking(db, tmdb_id, current_user.id)
    return _build_series_response(tracking, db, current_user)

from collections import defaultdict
from datetime import timedelta
import math

def get_full_stats(db: Session, current_user: User):
    from backend.domains.trackers.schemas import (
        TVFullStats, GenreStat, TimeTrendStat, TotalWatchTime,
        CompletionRate, WatchlistForecast, PlatformStat, ViewingHabits,
        GraveyardStat, SatisfactionStat, PersonalRecords,
        RatingDistribution, GenreRating, TopSeries, RewatchStat, RewatchComparison, GeneralStats, GuiltyPleasureStat
    )
    from backend.domains.trackers.models import UserSeriesTracking, TMDBSeries, UserEpisodeLog, TMDBEpisode, UserSeriesLog
    
    # 1. Fetch user's series tracking
    trackings = db.query(UserSeriesTracking).filter(UserSeriesTracking.user_id == current_user.id).all()
    tmdb_ids = [t.series_tmdb_id for t in trackings]
    
    # 2. Fetch TMDB info for these series
    series_map = {}
    if tmdb_ids:
        series_info = db.query(TMDBSeries).filter(TMDBSeries.tmdb_id.in_(tmdb_ids)).all()
        series_map = {s.tmdb_id: s for s in series_info}
        
    # 3. Fetch user's episode logs
    episode_logs = db.query(UserEpisodeLog).filter(UserEpisodeLog.user_id == current_user.id).all()
    
    # We will assume a default runtime of 45 minutes for episodes for now
    DEFAULT_RUNTIME = 45
    
    now = datetime.now(timezone.utc)
    one_month_ago = now - timedelta(days=30)
    one_year_ago = now - timedelta(days=365)
    
    # --- General Stats ---
    episodes_last_month = sum(1 for log in episode_logs if log.watched_at and log.watched_at >= one_month_ago)
    episodes_last_year = sum(1 for log in episode_logs if log.watched_at and log.watched_at >= one_year_ago)
    
    series_completed_last_month = sum(1 for t in trackings if t.status == 'watched' and t.updated_at and t.updated_at >= one_month_ago)
    series_completed_last_year = sum(1 for t in trackings if t.status == 'watched' and t.updated_at and t.updated_at >= one_year_ago)
    
    series_watching_last_month = sum(1 for t in trackings if t.status == 'watching' and t.updated_at and t.updated_at >= one_month_ago)
    series_watching_last_year = sum(1 for t in trackings if t.status == 'watching' and t.updated_at and t.updated_at >= one_year_ago)
    
    series_to_watch_last_month = sum(1 for t in trackings if t.status == 'to_watch' and t.added_at and t.added_at >= one_month_ago)
    series_to_watch_last_year = sum(1 for t in trackings if t.status == 'to_watch' and t.added_at and t.added_at >= one_year_ago)
    
    series_dropped_last_month = sum(1 for t in trackings if t.status == 'dropped' and t.updated_at and t.updated_at >= one_month_ago)
    series_dropped_last_year = sum(1 for t in trackings if t.status == 'dropped' and t.updated_at and t.updated_at >= one_year_ago)
    
    general_stats = GeneralStats(
        episodes_last_month=episodes_last_month,
        episodes_last_year=episodes_last_year,
        series_completed_last_month=series_completed_last_month,
        series_completed_last_year=series_completed_last_year,
        series_watching_last_month=series_watching_last_month,
        series_watching_last_year=series_watching_last_year,
        series_to_watch_last_month=series_to_watch_last_month,
        series_to_watch_last_year=series_to_watch_last_year,
        series_dropped_last_month=series_dropped_last_month,
        series_dropped_last_year=series_dropped_last_year
    )
    
    # --- Genre Distribution ---
    genre_counts = defaultdict(int)
    total_genres = 0
    for t in trackings:
        s = series_map.get(t.series_tmdb_id)
        if s and s.genres:
            genres = [g.strip() for g in s.genres.split(",")]
            for g in genres:
                genre_counts[g] += 1
                total_genres += 1
    
    genres_distribution = []
    if total_genres > 0:
        for genre, count in sorted(genre_counts.items(), key=lambda x: x[1], reverse=True):
            genres_distribution.append(GenreStat(
                genre=genre,
                count=count,
                percentage=round((count / total_genres) * 100, 1)
            ))
            
    # --- Time Trend (By Year) ---
    time_trend_map = defaultdict(lambda: defaultdict(int))
    for log in episode_logs:
        if log.watched_at:
            year = log.watched_at.strftime("%Y")
            period = log.watched_at.strftime("%b").capitalize()  # e.g., 'Gen', 'Feb'
            time_trend_map[year][period] += 1
            
    time_trend = {}
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    # localized roughly
    month_names = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"]
    
    # Reprocess properly to have all 12 months for every year found
    years_found = list(time_trend_map.keys())
    if not years_found:
        years_found = [now.strftime("%Y")]
        
    for year in years_found:
        time_trend[year] = []
        for eng_m, ita_m in zip(months, month_names):
            # check both English and Italian just in case locale affects strftime
            count = time_trend_map[year].get(eng_m, 0) + time_trend_map[year].get(ita_m, 0)
            time_trend[year].append(TimeTrendStat(
                period=ita_m,
                episodes=count,
                hours=round((count * DEFAULT_RUNTIME) / 60, 1)
            ))
        
    # --- Total Watch Time ---
    total_minutes = len(episode_logs) * DEFAULT_RUNTIME
    days = total_minutes // 1440
    hours = (total_minutes % 1440) // 60
    minutes = total_minutes % 60
    total_watch_time = TotalWatchTime(days=days, hours=hours, minutes=minutes)
    
    # --- Completion Rate ---
    completed_count = sum(1 for t in trackings if t.status == "watched")
    dropped_count = sum(1 for t in trackings if t.status == "dropped")
    total_started = completed_count + dropped_count + sum(1 for t in trackings if t.status == "watching")
    
    completion_rate = CompletionRate(
        completed=completed_count,
        dropped=dropped_count,
        percentage=round((completed_count / total_started * 100) if total_started > 0 else 0, 1)
    )
    
    # --- Forecast ---
    # We need to find episodes watched more than once, and series watched more than once.
    # Group episode logs by episode_id
    ep_watch_counts = defaultdict(list)
    for log in episode_logs:
        ep_watch_counts[log.episode_id].append(log)
        
    # Need episode mapping early to calculate exact remaining episodes
    episodes_cache = db.query(TMDBEpisode).filter(TMDBEpisode.id.in_(ep_watch_counts.keys())).all()
    ep_map = {e.id: e for e in episodes_cache}
    
    watched_eps_by_series = defaultdict(int)
    for ep_id, logs in ep_watch_counts.items():
        ep = ep_map.get(ep_id)
        if ep and len(logs) > 0:
            watched_eps_by_series[ep.series_tmdb_id] += 1
            
    remaining_episodes = 0
    for t in trackings:
        if t.status in ("to_watch", "watching"):
            s = series_map.get(t.series_tmdb_id)
            tot_eps = s.total_episodes if (s and s.total_episodes) else 10
            watched = watched_eps_by_series.get(t.series_tmdb_id, 0)
            remaining_episodes += max(tot_eps - watched, 0)
            
    remaining_minutes = remaining_episodes * DEFAULT_RUNTIME
    
    daily_pace_minutes = (episodes_last_month * DEFAULT_RUNTIME) / 30 if episodes_last_month else DEFAULT_RUNTIME
    
    estimated_days = remaining_minutes / daily_pace_minutes if daily_pace_minutes > 0 else 0
    estimated_date = (now + timedelta(days=estimated_days)).strftime("%Y-%m-%d") if estimated_days > 0 else None
    
    watchlist_forecast = WatchlistForecast(
        estimated_date=estimated_date,
        remaining_minutes=remaining_minutes,
        daily_pace=round(daily_pace_minutes, 1)
    )
    
    # --- Platform Distribution ---
    from backend.domains.trackers.models import UserSeriesLog, UserTVPlatform
    import sqlalchemy
    series_logs_stmt = sqlalchemy.select(UserSeriesLog).options(sqlalchemy.orm.joinedload(UserSeriesLog.viewing_platform)).where(UserSeriesLog.user_id == current_user.id)
    series_logs = list(db.execute(series_logs_stmt).scalars().all())
    
    platform_counts = defaultdict(int)
    total_platforms = 0
    for log in series_logs:
        if log.viewing_platform and log.viewing_platform.name:
            platform = log.viewing_platform.name.strip()
            if platform:
                platform_counts[platform] += 1
                total_platforms += 1
                
    platform_distribution = []
    if total_platforms > 0:
        for platform, count in sorted(platform_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
            platform_distribution.append(PlatformStat(
                platform=platform,
                count=count,
                percentage=round((count / total_platforms) * 100, 1)
            ))
            
    # --- Viewing Habits ---
    by_day = {}
    by_time = {"Mattina (6-12)": 0, "Pomeriggio (12-18)": 0, "Sera (18-24)": 0, "Notte (0-6)": 0}
    
    weekdays = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
    
    # Initialize the last 7 days ending today (Today is first, then Yesterday, etc.)
    last_7_dates = [(now - timedelta(days=i)).date() for i in range(7)]
    for i, d in enumerate(last_7_dates):
        if i == 0:
            name = "Oggi"
        elif i == 1:
            name = "Ieri"
        else:
            name = weekdays[d.weekday()]
        by_day[name] = 0
        
    for log in episode_logs:
        if log.watched_at:
            d = log.watched_at.date()
            if d in last_7_dates:
                # Find the index to get the exact name
                idx = (now.date() - d).days
                if idx == 0:
                    name = "Oggi"
                elif idx == 1:
                    name = "Ieri"
                else:
                    name = weekdays[d.weekday()]
                by_day[name] += DEFAULT_RUNTIME
                
            h = log.watched_at.hour
            if 6 <= h < 12:
                by_time["Mattina (6-12)"] += 1
            elif 12 <= h < 18:
                by_time["Pomeriggio (12-18)"] += 1
            elif 18 <= h <= 23:
                by_time["Sera (18-24)"] += 1
            else:
                by_time["Notte (0-6)"] += 1
                
    viewing_habits = ViewingHabits(by_day=dict(by_day), by_time=by_time)
    
    # --- Graveyard ---
    graveyard = []
    for t in trackings:
        if t.status == "dropped":
            s = series_map.get(t.series_tmdb_id)
            graveyard.append(GraveyardStat(
                title=s.title if s else "Sconosciuto",
                abandoned_date=t.updated_at.strftime("%Y-%m-%d") if t.updated_at else None
            ))
            
    # --- Ratings & Satisfaction ---
    satisfaction_index = []
    
    series_rating_counts = {r / 2.0: 0 for r in range(1, 11)}
    episode_rating_counts = {r / 2.0: 0 for r in range(1, 11)}
        
    genre_ratings = defaultdict(list)
    top_series_list = []
    
    for log in series_logs:
        s = series_map.get(log.series_tmdb_id)
        if not s: continue
        
        if log.rating:
            r_val = log.rating / 2.0
            series_rating_counts[r_val] = series_rating_counts.get(r_val, 0) + 1
            if s.genres:
                for g in [g.strip() for g in s.genres.split(",")]:
                    genre_ratings[g].append(r_val)
                    
            satisfaction_index.append(SatisfactionStat(
                title=s.title,
                time_spent_hours=round((s.total_episodes or 0) * DEFAULT_RUNTIME / 60, 1),
                rating=r_val
            ))
            
            top_series_list.append((s.title, r_val, log.watched_at))
            
    for log in episode_logs:
        if log.rating:
            r_val = log.rating / 2.0
            episode_rating_counts[r_val] = episode_rating_counts.get(r_val, 0) + 1
            
    series_ratings_distribution = [RatingDistribution(rating=r, count=c) for r, c in sorted(series_rating_counts.items())]
    episode_ratings_distribution = [RatingDistribution(rating=r, count=c) for r, c in sorted(episode_rating_counts.items())]
    
    ratings_by_genre = []
    for genre, ratings in genre_ratings.items():
        if len(ratings) > 0:
            ratings_by_genre.append(GenreRating(
                genre=genre,
                average_rating=round(sum(ratings) / len(ratings), 1)
            ))
            
    series_avg_map = {}
    for title, r_val, watched_at in top_series_list:
        if title not in series_avg_map:
            series_avg_map[title] = []
        series_avg_map[title].append(r_val)
        
    avg_series_list = [(title, round(sum(ratings) / len(ratings), 1)) for title, ratings in series_avg_map.items()]
    top_10 = sorted(avg_series_list, key=lambda x: x[1], reverse=True)[:10]
    top_10_series = [TopSeries(title=t, rating=r) for t, r in top_10]
    
    # --- Personal Records ---
    date_counts = defaultdict(int)
    for log in episode_logs:
        if log.watched_at:
            d = log.watched_at.strftime("%Y-%m-%d")
            date_counts[d] += 1
            
    max_day = max(date_counts.items(), key=lambda x: x[1]) if date_counts else (None, 0)
    
    personal_records = PersonalRecords(
        max_episodes_in_day=max_day[1] if max_day else 0,
        max_episodes_day=max_day[0] if max_day else None,
        fastest_binge_series=None,
        fastest_binge_days=None
    )
    
    # --- Rewatch Stats ---
    # Calculate most rewatched series (by episodes rewatched) or most rewatched episodes.
    series_rewatch_counts = defaultdict(int)
    episode_rewatch_counts = defaultdict(int)
    total_rewatch_episodes = 0
    total_first_watch_episodes = 0
    
    # Series rating is in series_logs. Build a map of average user ratings for series.
    series_ratings_list = defaultdict(list)
    for log in series_logs:
        if log.rating:
            series_ratings_list[log.series_tmdb_id].append(log.rating)
    series_ratings_map = {tid: (sum(r)/len(r)) / 2 for tid, r in series_ratings_list.items()}
    
    series_ep_counts = defaultdict(list)
    
    for ep_id, logs in ep_watch_counts.items():
        count = len(logs)
        if count > 0:
            total_first_watch_episodes += 1
            ep = ep_map.get(ep_id)
            if ep:
                series_ep_counts[ep.series_tmdb_id].append(count)
            if count > 1:
                total_rewatch_episodes += (count - 1)
                if ep:
                    episode_rewatch_counts[ep_id] = count
                    
    # Calculate average watch count for each series
    series_watch_counts = {}
    for tmdb_id, counts in series_ep_counts.items():
        avg_watch = sum(counts) / len(counts)
        rounded_watch = round(avg_watch)
        if rounded_watch > 1:
            # We store a tuple (rounded_watch, sum_counts) to tie-break on total volume
            series_watch_counts[tmdb_id] = (rounded_watch, sum(counts))
            
    most_rewatched = []
    guilty_pleasures = []
    most_rewatched_episodes = []
    
    # Sort by rounded_watch DESC, then sum_counts DESC
    for tmdb_id, (watch_cnt, total_volume) in sorted(series_watch_counts.items(), key=lambda x: (x[1][0], x[1][1]), reverse=True):
        s = series_map.get(tmdb_id)
        if s:
            rating = series_ratings_map.get(tmdb_id)
            most_rewatched.append(RewatchStat(
                title=s.title,
                rewatch_count=watch_cnt,
                rating=round(rating, 1) if rating is not None else None
            ))
            if rating is not None and watch_cnt > 1:
                guilty_pleasures.append(GuiltyPleasureStat(
                    title=s.title,
                    rewatch_count=watch_cnt,
                    rating=round(rating, 1)
                ))
                
    for ep_id, rewatch_cnt in sorted(episode_rewatch_counts.items(), key=lambda x: x[1], reverse=True):
        ep = ep_map.get(ep_id)
        if ep:
            s = series_map.get(ep.series_tmdb_id)
            ep_title = f"{s.title if s else 'Serie ignota'} - S{ep.season_number}E{ep.episode_number} ({ep.title})"
            most_rewatched_episodes.append(RewatchStat(
                title=ep_title,
                rewatch_count=rewatch_cnt,
                rating=None
            ))
                
    most_rewatched = most_rewatched[:10]
    most_rewatched_episodes = most_rewatched_episodes[:10]
    
    # Guilty pleasures: order by rating ASC (lowest first)
    guilty_pleasures.sort(key=lambda x: x.rating)
    guilty_pleasures = guilty_pleasures[:5]
    
    rewatch_comparison = RewatchComparison(
        first_watch_hours=round(total_first_watch_episodes * DEFAULT_RUNTIME / 60, 1),
        rewatch_hours=round(total_rewatch_episodes * DEFAULT_RUNTIME / 60, 1)
    )

    return TVFullStats(
        general_stats=general_stats,
        genres_distribution=genres_distribution,
        time_trend=time_trend,
        total_watch_time=total_watch_time,
        completion_rate=completion_rate,
        watchlist_forecast=watchlist_forecast,
        platform_distribution=platform_distribution,
        viewing_habits=viewing_habits,
        graveyard=graveyard,
        satisfaction_index=satisfaction_index,
        personal_records=personal_records,
        series_ratings_distribution=series_ratings_distribution,
        episode_ratings_distribution=episode_ratings_distribution,
        ratings_by_genre=ratings_by_genre,
        top_10_series=top_10_series,
        most_rewatched=most_rewatched,
        rewatch_comparison=rewatch_comparison,
        guilty_pleasures=guilty_pleasures
    )
