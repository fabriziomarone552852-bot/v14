"""
Service layer for Movie Tracker domain.
Manages TMDB API interactions, movie catalog synchronization,
user tracking, logs/reviews, stats, collections/saghe, and upcoming releases.
"""

from datetime import date, datetime, timezone, timedelta
from typing import List, Optional, Dict, Any, Tuple
import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from backend.core.settings import get_settings
from backend.domains.trackers.models import (
    TMDBMovie,
    UserMovieTracking,
    UserMovieLog,
    MovieQuote,
    UserTVPlatform,
)
from backend.domains.notifications.models import Interaction
from backend.domains.trackers.movie_schemas import (
    MovieCreate,
    MovieUpdate,
    MovieResponse,
    UserMovieLogCreate,
    UserMovieLogUpdate,
    UserMovieLogResponse,
    MovieQuoteCreate,
    MovieQuoteUpdate,
    MovieQuoteResponse,
    TMDBMovieSearchResult,
    TMDBPaginatedMovieSearch,
    UpcomingMovieResponse,
    MovieDashboardStats,
    MovieFullStats,
    MovieExtrasResponse,
    MovieCastMember,
    MovieRecommendation,
    MovieCollectionDetail,
    MovieCollectionPart,
)
from backend.domains.trackers import movie_repository as repo
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


# ==========================================
# 🔍 TMDB API CLIENT (FILM & SAGHE)
# ==========================================

async def search_tmdb_movies(query: str, page: int = 1) -> TMDBPaginatedMovieSearch:
    url = f"{TMDB_BASE_URL}/search/movie"
    params = {"query": query, "page": page, "language": "it-IT"}

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=get_tmdb_headers(), params=params)

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Errore nella ricerca film su TMDB: {response.text}",
        )

    data = response.json()
    results: List[TMDBMovieSearchResult] = []
    for item in data.get("results", []):
        results.append(
            TMDBMovieSearchResult(
                id=item["id"],
                title=item.get("title") or item.get("original_title") or "Senza Titolo",
                original_title=item.get("original_title"),
                overview=item.get("overview"),
                poster_path=item.get("poster_path"),
                backdrop_path=item.get("backdrop_path"),
                release_date=item.get("release_date") or None,
                vote_average=item.get("vote_average"),
            )
        )

    return TMDBPaginatedMovieSearch(
        page=data.get("page", 1),
        results=results,
        total_pages=data.get("total_pages", 1),
        total_results=data.get("total_results", len(results)),
    )


async def discover_tmdb_movies(
    with_genres: Optional[str] = None,
    with_watch_providers: Optional[str] = None,
    primary_release_year: Optional[str] = None,
    sort_by: Optional[str] = "popularity.desc",
    page: int = 1,
) -> TMDBPaginatedMovieSearch:
    url = f"{TMDB_BASE_URL}/discover/movie"
    params: Dict[str, Any] = {
        "language": "it-IT",
        "page": page,
        "sort_by": sort_by or "popularity.desc",
    }
    if with_genres and with_genres != "all":
        params["with_genres"] = with_genres
    if with_watch_providers and with_watch_providers != "all":
        params["with_watch_providers"] = with_watch_providers
        params["watch_region"] = "IT"
    if primary_release_year and primary_release_year != "all":
        params["primary_release_year"] = primary_release_year

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=get_tmdb_headers(), params=params)

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Errore nel discover film su TMDB: {response.text}",
        )

    data = response.json()
    results: List[TMDBMovieSearchResult] = []
    for item in data.get("results", []):
        results.append(
            TMDBMovieSearchResult(
                id=item["id"],
                title=item.get("title") or item.get("original_title") or "Senza Titolo",
                original_title=item.get("original_title"),
                overview=item.get("overview"),
                poster_path=item.get("poster_path"),
                backdrop_path=item.get("backdrop_path"),
                release_date=item.get("release_date") or None,
                vote_average=item.get("vote_average"),
            )
        )

    return TMDBPaginatedMovieSearch(
        page=data.get("page", 1),
        results=results,
        total_pages=data.get("total_pages", 1),
        total_results=data.get("total_results", len(results)),
    )


async def get_tmdb_movie_genres() -> List[dict]:
    url = f"{TMDB_BASE_URL}/genre/movie/list"
    params = {"language": "it-IT"}

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=get_tmdb_headers(), params=params)

    if response.status_code != 200:
        return []
    return response.json().get("genres", [])


async def get_tmdb_movie_providers() -> List[dict]:
    url = f"{TMDB_BASE_URL}/watch/providers/movie"
    params = {"language": "it-IT", "watch_region": "IT"}

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=get_tmdb_headers(), params=params)

    if response.status_code != 200:
        return []
    return response.json().get("results", [])


async def fetch_tmdb_movie_providers(tmdb_id: int) -> dict:
    url = f"{TMDB_BASE_URL}/movie/{tmdb_id}/watch/providers"
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=get_tmdb_headers())

    if response.status_code != 200:
        return {}

    data = response.json()
    results = data.get("results", {})
    return results.get("IT", {})


async def fetch_tmdb_movie_detail_raw(tmdb_id: int) -> dict:
    url = f"{TMDB_BASE_URL}/movie/{tmdb_id}"
    params = {
        "language": "it-IT",
        "append_to_response": "release_dates,credits,recommendations",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=get_tmdb_headers(), params=params)

    if response.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Film TMDB ID {tmdb_id} non trovato.",
        )
    elif response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Errore TMDB nel recupero dettagli film: {response.text}",
        )

    return response.json()


def _extract_italy_release_date(raw_data: dict) -> Optional[date]:
    """
    Estrae la data di uscita in Italia analizzando release_dates per iso_3166_1 == 'IT'.
    Priorità:
    1. Theatrical (type 3)
    2. Theatrical (limited) (type 2)
    3. Digital (type 4)
    4. Qualsiasi data IT disponibile
    Fallback: release_date globale
    """
    rd_results = raw_data.get("release_dates", {}).get("results", [])
    it_entry = next((item for item in rd_results if item.get("iso_3166_1") == "IT"), None)

    if it_entry:
        dates_list = it_entry.get("release_dates", [])
        # Cerca per priorità di tipo
        for target_type in [3, 2, 4]:
            match = next((d for d in dates_list if d.get("type") == target_type and d.get("release_date")), None)
            if match:
                try:
                    return datetime.fromisoformat(match["release_date"].replace("Z", "+00:00")).date()
                except Exception:
                    pass

        # Se non trovato per tipo prioritario, prendi la prima data IT valida
        for d in dates_list:
            if d.get("release_date"):
                try:
                    return datetime.fromisoformat(d["release_date"].replace("Z", "+00:00")).date()
                except Exception:
                    pass

    # Fallback su data globale
    global_date_str = raw_data.get("release_date")
    if global_date_str:
        try:
            return date.fromisoformat(global_date_str)
        except Exception:
            pass

    return None


async def sync_tmdb_movie_metadata(db: Session, tmdb_id: int) -> TMDBMovie:
    """
    Scarica da TMDB e memorizza o aggiorna le informazioni del film nella tabella globale tmdb_movies.
    """
    raw = await fetch_tmdb_movie_detail_raw(tmdb_id)

    movie = repo.get_tmdb_movie(db, tmdb_id)
    if not movie:
        movie = TMDBMovie(tmdb_id=tmdb_id, title=raw.get("title") or "Senza Titolo")

    movie.title = raw.get("title") or raw.get("original_title") or "Senza Titolo"
    movie.original_title = raw.get("original_title")
    movie.overview = raw.get("overview")
    movie.poster_path = raw.get("poster_path")
    movie.backdrop_path = raw.get("backdrop_path")

    # Generi separati da virgola
    genres = [g.get("name") for g in raw.get("genres", []) if g.get("name")]
    movie.genres = ", ".join(genres) if genres else None

    movie.runtime = raw.get("runtime")

    # Data globale
    global_date_str = raw.get("release_date")
    if global_date_str:
        try:
            movie.release_date = date.fromisoformat(global_date_str)
        except Exception:
            movie.release_date = None

    # Data uscita in Italia
    movie.italy_release_date = _extract_italy_release_date(raw)

    movie.vote_average = raw.get("vote_average")

    # Saga / Collezione
    collection_info = raw.get("belongs_to_collection")
    if collection_info:
        movie.collection_id = collection_info.get("id")
        movie.collection_name = collection_info.get("name")
        movie.collection_poster_path = collection_info.get("poster_path")
        movie.collection_backdrop_path = collection_info.get("backdrop_path")
    else:
        movie.collection_id = None
        movie.collection_name = None
        movie.collection_poster_path = None
        movie.collection_backdrop_path = None

    movie.last_sync_at = datetime.now(timezone.utc)
    return repo.save_tmdb_movie(db, movie)


# ==========================================
# 🧩 EXTRAS, CAST, CONSIGLIATI E SAGHE
# ==========================================

async def get_tmdb_movie_extras(
    db: Session, current_user_id: int, tmdb_id: int
) -> MovieExtrasResponse:
    raw = await fetch_tmdb_movie_detail_raw(tmdb_id)

    # 1. Cast
    cast_data = raw.get("credits", {}).get("cast", [])
    cast = [
        MovieCastMember(
            id=c.get("id", 0),
            name=c.get("name", ""),
            character=c.get("character"),
            profile_path=c.get("profile_path"),
        )
        for c in cast_data[:12]
    ]

    # 2. Regista
    crew_data = raw.get("credits", {}).get("crew", [])
    director = next((c.get("name") for c in crew_data if c.get("job") == "Director"), None)

    # 3. Raccomandazioni
    recs_data = raw.get("recommendations", {}).get("results", [])
    recommendations = [
        MovieRecommendation(
            id=r["id"],
            title=r.get("title") or r.get("original_title") or "Senza Titolo",
            poster_path=r.get("poster_path"),
            backdrop_path=r.get("backdrop_path"),
            vote_average=r.get("vote_average"),
            release_date=r.get("release_date"),
        )
        for r in recs_data[:15]
    ]

    # 4. Collezione / Saga TMDB (se presente)
    collection_detail: Optional[MovieCollectionDetail] = None
    collection_meta = raw.get("belongs_to_collection")
    if collection_meta and collection_meta.get("id"):
        coll_id = collection_meta["id"]
        url = f"{TMDB_BASE_URL}/collection/{coll_id}"
        params = {"language": "it-IT"}

        async with httpx.AsyncClient(timeout=15.0) as client:
            c_resp = await client.get(url, headers=get_tmdb_headers(), params=params)

        if c_resp.status_code == 200:
            c_data = c_resp.json()
            parts_raw = c_data.get("parts", [])

            # Recupera tracking e voti dell'utente per tutti i film della saga
            part_ids = [p["id"] for p in parts_raw if "id" in p]
            user_trackings = {
                t.movie_tmdb_id: t
                for t in repo.list_user_movie_trackings(db, current_user_id)
                if t.movie_tmdb_id in part_ids
            }
            user_logs = repo.get_user_movie_logs(db, current_user_id)
            user_logs_map: Dict[int, List[UserMovieLog]] = {}
            for l in user_logs:
                user_logs_map.setdefault(l.movie_tmdb_id, []).append(l)

            collection_parts: List[MovieCollectionPart] = []
            for p in parts_raw:
                p_id = p["id"]
                tracking = user_trackings.get(p_id)
                logs_for_p = user_logs_map.get(p_id, [])

                p_status = tracking.status if tracking else None
                is_watched = p_status == "watched"
                in_watchlist = p_status == "to_watch"

                # Voto più recente se presente
                my_rating = None
                for log_item in logs_for_p:
                    if log_item.rating is not None:
                        my_rating = log_item.rating
                        break

                collection_parts.append(
                    MovieCollectionPart(
                        id=p_id,
                        title=p.get("title") or p.get("original_title") or "Senza Titolo",
                        overview=p.get("overview"),
                        poster_path=p.get("poster_path"),
                        backdrop_path=p.get("backdrop_path"),
                        release_date=p.get("release_date"),
                        vote_average=p.get("vote_average"),
                        status=p_status,
                        in_watchlist=in_watchlist,
                        is_watched=is_watched,
                        my_rating=my_rating,
                    )
                )

            # Ordina le parti della saga in ordine cronologico di uscita
            collection_parts.sort(key=lambda x: x.release_date or "9999-99-99")

            collection_detail = MovieCollectionDetail(
                id=coll_id,
                name=c_data.get("name") or collection_meta.get("name") or "Collezione",
                overview=c_data.get("overview"),
                poster_path=c_data.get("poster_path"),
                backdrop_path=c_data.get("backdrop_path"),
                parts=collection_parts,
            )

    return MovieExtrasResponse(
        cast=cast,
        director=director,
        recommendations=recommendations,
        collection=collection_detail,
    )


# ==========================================
# 🎬 CRUD FILM PERSONALI & BUILDER RISPOSTE
# ==========================================

def _get_comments_for_log_ids(db: Session, log_ids: List[int]) -> Dict[int, List[dict]]:
    if not log_ids:
        return {}
    comments_stmt = (
        select(Interaction, User)
        .join(User, User.id == Interaction.author_id)
        .where(
            Interaction.interaction_type == "MOVIE_REVIEW_COMMENT",
            Interaction.reference_id.in_(log_ids),
        )
        .order_by(Interaction.created_at.asc())
    )
    comments_res = db.execute(comments_stmt).all()
    comments_map: Dict[int, List[dict]] = {}
    for c_int, c_user in comments_res:
        if c_int.reference_id is not None:
            comments_map.setdefault(c_int.reference_id, []).append({
                "id": str(c_int.id),
                "author_id": str(c_user.id),
                "author_name": c_user.username,
                "author_avatar": c_user.profile_picture_url,
                "text": c_int.content,
                "created_at": c_int.created_at.isoformat() if c_int.created_at else "",
            })
    return comments_map


def _build_movie_response(
    tracking: Optional[UserMovieTracking],
    tmdb_movie: TMDBMovie,
    logs: List[UserMovieLog],
    quotes: List[MovieQuote],
    comments_map: Optional[Dict[int, List[dict]]] = None,
) -> MovieResponse:
    log_responses: List[UserMovieLogResponse] = []
    my_rating: Optional[float] = None
    my_last_watched_at: Optional[datetime] = None

    for l in logs:
        platform_name = l.viewing_platform.name if l.viewing_platform else None
        if my_rating is None and l.rating is not None:
            my_rating = l.rating
        if my_last_watched_at is None and l.watched_at:
            my_last_watched_at = l.watched_at

        log_responses.append(
            UserMovieLogResponse(
                id=l.id,
                user_id=l.user_id,
                movie_tmdb_id=l.movie_tmdb_id,
                rating=l.rating,
                notes=l.notes,
                review_visibility=l.review_visibility,
                viewing_platform_id=l.viewing_platform_id,
                viewing_platform_name=platform_name,
                watched_at=l.watched_at,
                created_at=l.created_at,
                updated_at=l.updated_at,
                comments=comments_map.get(l.id, []) if comments_map else [],
            )
        )

    quote_responses = [
        MovieQuoteResponse(
            id=q.id,
            user_id=q.user_id,
            movie_tmdb_id=q.movie_tmdb_id,
            quote_text=q.quote_text,
            created_at=q.created_at,
            movie_title=tmdb_movie.title,
            movie_poster_path=tmdb_movie.poster_path,
        )
        for q in quotes
    ]

    return MovieResponse(
        id=tracking.id if tracking else 0,
        tmdb_id=tmdb_movie.tmdb_id,
        title=tmdb_movie.title,
        original_title=tmdb_movie.original_title,
        overview=tmdb_movie.overview,
        poster_path=tmdb_movie.poster_path,
        backdrop_path=tmdb_movie.backdrop_path,
        custom_poster_path=tracking.custom_poster_path if tracking else None,
        custom_backdrop_path=tracking.custom_backdrop_path if tracking else None,
        genres=tmdb_movie.genres,
        runtime=tmdb_movie.runtime,
        release_date=tmdb_movie.release_date,
        italy_release_date=tmdb_movie.italy_release_date,
        vote_average=tmdb_movie.vote_average,
        collection_id=tmdb_movie.collection_id,
        collection_name=tmdb_movie.collection_name,
        collection_poster_path=tmdb_movie.collection_poster_path,
        collection_backdrop_path=tmdb_movie.collection_backdrop_path,
        last_sync_at=tmdb_movie.last_sync_at,
        status=tracking.status if tracking else "to_watch",
        is_rewatching=tracking.is_rewatching if tracking else False,
        obtained_at=tracking.obtained_at if tracking else None,
        is_obtained=bool(tracking.obtained_at) if tracking else False,
        added_at=tracking.added_at if tracking else None,
        updated_at=tracking.updated_at if tracking else None,
        watch_count=len(logs),
        my_rating=my_rating,
        my_last_watched_at=my_last_watched_at,
        logs=log_responses,
        quotes=quote_responses,
    )


def list_user_movies(db: Session, current_user: User) -> List[MovieResponse]:
    trackings = repo.list_user_movie_trackings(db, current_user.id)
    all_logs = repo.get_user_movie_logs(db, current_user.id)
    all_quotes = repo.get_movie_quotes(db, current_user.id)
    comments_map = _get_comments_for_log_ids(db, [l.id for l in all_logs])

    logs_map: Dict[int, List[UserMovieLog]] = {}
    for l in all_logs:
        logs_map.setdefault(l.movie_tmdb_id, []).append(l)

    quotes_map: Dict[int, List[MovieQuote]] = {}
    for q in all_quotes:
        quotes_map.setdefault(q.movie_tmdb_id, []).append(q)

    responses: List[MovieResponse] = []
    for t in trackings:
        if t.tmdb_movie:
            responses.append(
                _build_movie_response(
                    tracking=t,
                    tmdb_movie=t.tmdb_movie,
                    logs=logs_map.get(t.movie_tmdb_id, []),
                    quotes=quotes_map.get(t.movie_tmdb_id, []),
                    comments_map=comments_map,
                )
            )

    return responses


async def get_movie_detail(
    db: Session, current_user: User, tmdb_id: int
) -> MovieResponse:
    movie = repo.get_tmdb_movie(db, tmdb_id)
    if not movie:
        movie = await sync_tmdb_movie_metadata(db, tmdb_id)

    tracking = repo.get_user_movie_tracking(db, current_user.id, tmdb_id)
    logs = repo.get_user_movie_logs(db, current_user.id, tmdb_id)
    quotes = repo.get_movie_quotes(db, current_user.id, tmdb_id)
    comments_map = _get_comments_for_log_ids(db, [l.id for l in logs])

    return _build_movie_response(tracking, movie, logs, quotes, comments_map)


async def add_movie(
    db: Session, current_user: User, payload: MovieCreate
) -> MovieResponse:
    tracking = repo.get_user_movie_tracking(db, current_user.id, payload.tmdb_id)
    if tracking:
        # Se già presente, aggiorna lo stato se diverso
        if tracking.status != payload.status:
            tracking.status = payload.status
        if "obtained_at" in payload.model_fields_set:
            tracking.obtained_at = payload.obtained_at
        elif payload.is_obtained is not None:
            tracking.obtained_at = datetime.now(timezone.utc) if payload.is_obtained else None
        repo.save_user_movie_tracking(db, tracking)
    else:
        # Assicurati che il catalogo TMDB globale sia sincronizzato
        movie = repo.get_tmdb_movie(db, payload.tmdb_id)
        if not movie:
            movie = await sync_tmdb_movie_metadata(db, payload.tmdb_id)

        obtained_val: Optional[datetime] = None
        if "obtained_at" in payload.model_fields_set:
            obtained_val = payload.obtained_at
        elif payload.is_obtained is not None:
            obtained_val = datetime.now(timezone.utc) if payload.is_obtained else None

        tracking = UserMovieTracking(
            user_id=current_user.id,
            movie_tmdb_id=payload.tmdb_id,
            status=payload.status,
            obtained_at=obtained_val,
            added_at=datetime.now(timezone.utc),
        )
        repo.save_user_movie_tracking(db, tracking)

    # Se aggiunto come già 'watched', registra una sessione di log se non esiste
    logs = repo.get_user_movie_logs(db, current_user.id, payload.tmdb_id)
    if payload.status == "watched" and not logs:
        initial_log = UserMovieLog(
            user_id=current_user.id,
            movie_tmdb_id=payload.tmdb_id,
            review_visibility=payload.review_visibility,
            watched_at=datetime.now(timezone.utc),
        )
        repo.save_movie_log(db, initial_log)
        logs = [initial_log]

    movie = repo.get_tmdb_movie(db, payload.tmdb_id)
    quotes = repo.get_movie_quotes(db, current_user.id, payload.tmdb_id)
    comments_map = _get_comments_for_log_ids(db, [l.id for l in logs])
    return _build_movie_response(tracking, movie, logs, quotes, comments_map)


def update_movie(
    db: Session, current_user: User, tmdb_id: int, payload: MovieUpdate
) -> MovieResponse:
    tracking = repo.get_user_movie_tracking(db, current_user.id, tmdb_id)
    if not tracking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Film non trovato nella libreria dell'utente.",
        )

    if payload.status is not None:
        tracking.status = payload.status
    if payload.is_rewatching is not None:
        tracking.is_rewatching = payload.is_rewatching
    if payload.custom_poster_path is not None:
        tracking.custom_poster_path = payload.custom_poster_path
    if payload.custom_backdrop_path is not None:
        tracking.custom_backdrop_path = payload.custom_backdrop_path
    if "obtained_at" in payload.model_fields_set:
        tracking.obtained_at = payload.obtained_at
    elif payload.is_obtained is not None:
        tracking.obtained_at = datetime.now(timezone.utc) if payload.is_obtained else None

    tracking.updated_at = datetime.now(timezone.utc)
    repo.save_user_movie_tracking(db, tracking)

    movie = repo.get_tmdb_movie(db, tmdb_id)
    logs = repo.get_user_movie_logs(db, current_user.id, tmdb_id)
    quotes = repo.get_movie_quotes(db, current_user.id, tmdb_id)
    comments_map = _get_comments_for_log_ids(db, [l.id for l in logs])
    return _build_movie_response(tracking, movie, logs, quotes, comments_map)


def delete_movie(db: Session, current_user: User, tmdb_id: int) -> None:
    tracking = repo.get_user_movie_tracking(db, current_user.id, tmdb_id)
    if tracking:
        repo.delete_user_movie_tracking(db, tracking)


# ==========================================
# 📝 LOGS / RECENSIONI & DIARIO FILM
# ==========================================

def add_movie_log(
    db: Session, current_user: User, tmdb_id: int, payload: UserMovieLogCreate
) -> MovieResponse:
    # 1. Recupera o crea il tracking utente se non esiste
    tracking = repo.get_user_movie_tracking(db, current_user.id, tmdb_id)
    if not tracking:
        tracking = UserMovieTracking(
            user_id=current_user.id,
            movie_tmdb_id=tmdb_id,
            status="watched",
            added_at=datetime.now(timezone.utc),
        )
        repo.save_user_movie_tracking(db, tracking)
    else:
        # Se il film era in watchlist, passa automaticamente a watched
        if tracking.status != "watched":
            tracking.status = "watched"
            tracking.updated_at = datetime.now(timezone.utc)
            repo.save_user_movie_tracking(db, tracking)

    # 2. Risolvi piattaforma se passata per nome
    platform_id = payload.viewing_platform_id
    if payload.viewing_platform_name is not None:
        if payload.viewing_platform_name.strip():
            from backend.domains.trackers.service import _get_or_create_tv_platform
            platform_id = _get_or_create_tv_platform(db, current_user.id, payload.viewing_platform_name)
        else:
            platform_id = None

    # 3. Crea la nuova sessione nel diario
    log = UserMovieLog(
        user_id=current_user.id,
        movie_tmdb_id=tmdb_id,
        rating=payload.rating,
        notes=payload.notes,
        review_visibility=payload.review_visibility or "friends_only",
        viewing_platform_id=platform_id,
        watched_at=payload.watched_at or datetime.now(timezone.utc),
    )
    repo.save_movie_log(db, log)

    movie = repo.get_tmdb_movie(db, tmdb_id)
    logs = repo.get_user_movie_logs(db, current_user.id, tmdb_id)
    quotes = repo.get_movie_quotes(db, current_user.id, tmdb_id)
    comments_map = _get_comments_for_log_ids(db, [l.id for l in logs])
    return _build_movie_response(tracking, movie, logs, quotes, comments_map)


def update_movie_log(
    db: Session, current_user: User, log_id: int, payload: UserMovieLogUpdate
) -> MovieResponse:
    log = repo.get_movie_log(db, log_id)
    if not log or log.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sessione di visione / recensione non trovata.",
        )

    if payload.rating is not None:
        log.rating = payload.rating
    if payload.notes is not None:
        log.notes = payload.notes
    if payload.review_visibility is not None:
        log.review_visibility = payload.review_visibility
    if payload.viewing_platform_name is not None:
        if payload.viewing_platform_name.strip():
            from backend.domains.trackers.service import _get_or_create_tv_platform
            log.viewing_platform_id = _get_or_create_tv_platform(db, current_user.id, payload.viewing_platform_name)
        else:
            log.viewing_platform_id = None
    elif payload.viewing_platform_id is not None:
        log.viewing_platform_id = payload.viewing_platform_id if payload.viewing_platform_id > 0 else None
    if payload.watched_at is not None:
        log.watched_at = payload.watched_at

    log.updated_at = datetime.now(timezone.utc)
    repo.save_movie_log(db, log)

    tracking = repo.get_user_movie_tracking(db, current_user.id, log.movie_tmdb_id)
    movie = repo.get_tmdb_movie(db, log.movie_tmdb_id)
    logs = repo.get_user_movie_logs(db, current_user.id, log.movie_tmdb_id)
    quotes = repo.get_movie_quotes(db, current_user.id, log.movie_tmdb_id)
    comments_map = _get_comments_for_log_ids(db, [l.id for l in logs])
    return _build_movie_response(tracking, movie, logs, quotes, comments_map)


def delete_movie_log(db: Session, current_user: User, log_id: int) -> MovieResponse:
    log = repo.get_movie_log(db, log_id)
    if not log or log.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sessione di visione / recensione non trovata.",
        )

    tmdb_id = log.movie_tmdb_id
    repo.delete_movie_log(db, log)

    tracking = repo.get_user_movie_tracking(db, current_user.id, tmdb_id)
    movie = repo.get_tmdb_movie(db, tmdb_id)
    logs = repo.get_user_movie_logs(db, current_user.id, tmdb_id)
    quotes = repo.get_movie_quotes(db, current_user.id, tmdb_id)
    comments_map = _get_comments_for_log_ids(db, [l.id for l in logs])
    return _build_movie_response(tracking, movie, logs, quotes, comments_map)


# ==========================================
# 💬 CITAZIONI FILM
# ==========================================

def get_user_quotes(db: Session, current_user: User) -> List[MovieQuoteResponse]:
    quotes = repo.get_movie_quotes(db, current_user.id)
    return [
        MovieQuoteResponse(
            id=q.id,
            user_id=q.user_id,
            movie_tmdb_id=q.movie_tmdb_id,
            quote_text=q.quote_text,
            created_at=q.created_at,
            movie_title=q.tmdb_movie.title if q.tmdb_movie else None,
            movie_poster_path=q.tmdb_movie.poster_path if q.tmdb_movie else None,
        )
        for q in quotes
    ]


def add_movie_quote(
    db: Session, current_user: User, tmdb_id: int, payload: MovieQuoteCreate
) -> MovieQuoteResponse:
    quote = MovieQuote(
        user_id=current_user.id,
        movie_tmdb_id=tmdb_id,
        quote_text=payload.quote_text,
    )
    repo.save_movie_quote(db, quote)
    movie = repo.get_tmdb_movie(db, tmdb_id)
    return MovieQuoteResponse(
        id=quote.id,
        user_id=quote.user_id,
        movie_tmdb_id=tmdb_id,
        quote_text=quote.quote_text,
        created_at=quote.created_at,
        movie_title=movie.title if movie else None,
        movie_poster_path=movie.poster_path if movie else None,
    )


def delete_movie_quote(db: Session, current_user: User, quote_id: int) -> None:
    quote = repo.get_movie_quote(db, quote_id)
    if quote and quote.user_id == current_user.id:
        repo.delete_movie_quote(db, quote)


def update_movie_quote(
    db: Session, current_user: User, quote_id: int, payload: MovieQuoteUpdate
) -> MovieQuoteResponse:
    quote = repo.get_movie_quote(db, quote_id)
    if not quote or quote.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Citazione non trovata.")
    quote.quote_text = payload.quote_text
    repo.save_movie_quote(db, quote)
    movie = repo.get_tmdb_movie(db, quote.movie_tmdb_id)
    return MovieQuoteResponse(
        id=quote.id,
        user_id=quote.user_id,
        movie_tmdb_id=quote.movie_tmdb_id,
        quote_text=quote.quote_text,
        created_at=quote.created_at,
        movie_title=movie.title if movie else None,
        movie_poster_path=movie.poster_path if movie else None,
    )


# ==========================================
# 🍿 PROSSIME USCITE CON FINESTRA 14 GIORNI
# ==========================================

def get_upcoming_movies(
    db: Session,
    current_user: User,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> List[UpcomingMovieResponse]:
    """
    Restituisce le uscite dei film presenti nella libreria/watchlist dell'utente.
    Se specificati start_date e end_date, filtra l'intervallo temporale (es. navigazione calendario).
    Altrimenti applica la regola speciale dei 14 giorni per la watchlist.
    """
    trackings = repo.list_user_movie_trackings(db, current_user.id)
    today = date.today()
    cutoff_recent = today - timedelta(days=14)

    upcoming_list: List[UpcomingMovieResponse] = []

    for t in trackings:
        if not t.tmdb_movie:
            continue
        # Se non è specificato un intervallo di date, consideriamo solo la watchlist ('to_watch')
        if start_date is None and end_date is None and t.status != "to_watch":
            continue

        m = t.tmdb_movie
        rel_date = m.italy_release_date or m.release_date
        if not rel_date:
            continue

        if start_date is not None or end_date is not None:
            if start_date and rel_date < start_date:
                continue
            if end_date and rel_date > end_date:
                continue
            is_recent = cutoff_recent <= rel_date <= today
            days_since = (today - rel_date).days if is_recent else None
            upcoming_list.append(
                UpcomingMovieResponse(
                    movie_tmdb_id=m.tmdb_id,
                    title=m.title,
                    poster_path=m.poster_path,
                    backdrop_path=m.backdrop_path,
                    release_date=m.release_date,
                    italy_release_date=m.italy_release_date,
                    is_recent_release=is_recent,
                    days_since_release=days_since,
                    is_watched=t.status == "watched",
                )
            )
        else:
            if rel_date >= cutoff_recent:
                is_recent = cutoff_recent <= rel_date <= today
                days_since = (today - rel_date).days if is_recent else None
                upcoming_list.append(
                    UpcomingMovieResponse(
                        movie_tmdb_id=m.tmdb_id,
                        title=m.title,
                        poster_path=m.poster_path,
                        backdrop_path=m.backdrop_path,
                        release_date=m.release_date,
                        italy_release_date=m.italy_release_date,
                        is_recent_release=is_recent,
                        days_since_release=days_since,
                        is_watched=False,
                    )
                )

    if start_date is not None or end_date is not None:
        upcoming_list.sort(key=lambda x: x.italy_release_date or x.release_date or date.min)
        return upcoming_list

    # Ordina: prima le uscite recenti (dal più fresco al più remoto dei 14gg), poi le uscite future crescenti
    recent_movies = [m for m in upcoming_list if m.is_recent_release]
    future_movies = [m for m in upcoming_list if not m.is_recent_release]

    recent_movies.sort(key=lambda x: x.italy_release_date or x.release_date or date.min, reverse=True)
    future_movies.sort(key=lambda x: x.italy_release_date or x.release_date or date.max)

    return recent_movies + future_movies


# ==========================================
# 📊 STATISTICHE FILM (RUNTIME REALE & NO CIMITERO)
# ==========================================

def get_movie_dashboard_stats(db: Session, current_user: User) -> MovieDashboardStats:
    trackings = repo.list_user_movie_trackings(db, current_user.id)
    logs = repo.get_user_movie_logs(db, current_user.id)

    current_year = date.today().year
    watched_this_year = sum(
        1
        for l in logs
        if l.watched_at and l.watched_at.year == current_year
    )

    # Ultimo aggiunto in watchlist
    last_added = trackings[0].tmdb_movie.title if trackings and trackings[0].tmdb_movie else None
    # Ultimo guardato
    last_watched = None
    if logs and logs[0].tmdb_movie:
        last_watched = logs[0].tmdb_movie.title

    to_watch_count = sum(1 for t in trackings if t.status == "to_watch")

    return MovieDashboardStats(
        movies_watched_this_year=watched_this_year,
        total_movies_tracked=len(trackings),
        movies_in_watchlist=to_watch_count,
        last_added_movie=last_added,
        last_watched_movie=last_watched,
    )


def get_movie_full_stats(db: Session, current_user: User) -> MovieFullStats:
    trackings = repo.list_user_movie_trackings(db, current_user.id)
    logs = repo.get_user_movie_logs(db, current_user.id)

    today = date.today()
    one_month_ago = datetime.now(timezone.utc) - timedelta(days=30)
    one_year_ago = datetime.now(timezone.utc) - timedelta(days=365)

    # 1. Calcolo Tempo Totale basato sul runtime reale dei film visti
    total_minutes = 0
    days_counter: Dict[str, int] = {}
    hours_counter: Dict[str, int] = {}
    day_movie_count: Dict[str, int] = {}

    movies_last_month = 0
    movies_last_year = 0
    minutes_last_month = 0
    minutes_last_year = 0

    # Mappa film -> runtime
    movie_runtime_map = {
        t.movie_tmdb_id: (t.tmdb_movie.runtime or 100)
        for t in trackings
        if t.tmdb_movie
    }

    for l in logs:
        m_runtime = movie_runtime_map.get(l.movie_tmdb_id, 100)
        total_minutes += m_runtime

        if l.watched_at:
            w_at = l.watched_at
            if w_at.tzinfo is None:
                w_at = w_at.replace(tzinfo=timezone.utc)

            if w_at >= one_month_ago:
                movies_last_month += 1
                minutes_last_month += m_runtime
            if w_at >= one_year_ago:
                movies_last_year += 1
                minutes_last_year += m_runtime

            day_str = w_at.strftime("%Y-%m-%d")
            day_movie_count[day_str] = day_movie_count.get(day_str, 0) + 1

            weekday_name = w_at.strftime("%A")
            days_counter[weekday_name] = days_counter.get(weekday_name, 0) + 1

            hour_str = str(w_at.hour)
            hours_counter[hour_str] = hours_counter.get(hour_str, 0) + 1

    days_watch = total_minutes // (60 * 24)
    hours_watch = (total_minutes % (60 * 24)) // 60
    mins_watch = total_minutes % 60

    # 2. Record Binge (Massimo numero di film visti in un singolo giorno)
    max_movies_day = None
    max_movies_in_day = 0
    for d_str, count in day_movie_count.items():
        if count > max_movies_in_day:
            max_movies_in_day = count
            max_movies_day = d_str

    # 3. Completamento Watchlist
    watched_count = sum(1 for t in trackings if t.status == "watched")
    to_watch_count = sum(1 for t in trackings if t.status == "to_watch")
    total_tracked = watched_count + to_watch_count
    completion_pct = (watched_count / total_tracked * 100) if total_tracked > 0 else 0.0

    # 4. Data Stimata completamento watchlist
    estimated_date = None
    if to_watch_count > 0 and movies_last_year > 0:
        daily_rate = movies_last_year / 365.0
        if daily_rate > 0:
            days_needed = int(to_watch_count / daily_rate)
            estimated_date = (today + timedelta(days=days_needed)).strftime("%Y-%m-%d")

    # 5. Distribuzione Voti
    rating_counts: Dict[int, int] = {i: 0 for i in range(1, 11)}
    for l in logs:
        if l.rating:
            rounded_rating = int(round(l.rating))
            if 1 <= rounded_rating <= 10:
                rating_counts[rounded_rating] += 1

    ratings_dist = [{"rating": r, "count": count} for r, count in rating_counts.items()]

    # 6. Top 10 Film & Generi
    film_rating_map: Dict[str, List[float]] = {}
    genre_ratings: Dict[str, List[float]] = {}
    genre_counts: Dict[str, int] = {}
    platform_counts: Dict[str, int] = {}

    for l in logs:
        if l.tmdb_movie and l.rating:
            film_rating_map.setdefault(l.tmdb_movie.title, []).append(l.rating)
            if l.tmdb_movie.genres:
                for g in l.tmdb_movie.genres.split(","):
                    g_clean = g.strip()
                    if g_clean:
                        genre_ratings.setdefault(g_clean, []).append(l.rating)
                        genre_counts[g_clean] = genre_counts.get(g_clean, 0) + 1
        if l.viewing_platform:
            platform_counts[l.viewing_platform.name] = (
                platform_counts.get(l.viewing_platform.name, 0) + 1
            )

    top_10: List[Dict[str, float]] = []
    for title, r_list in film_rating_map.items():
        avg_r = sum(r_list) / len(r_list)
        top_10.append({"title": title, "rating": round(avg_r, 1)})
    top_10.sort(key=lambda x: x["rating"], reverse=True)
    top_10 = top_10[:10]

    ratings_by_genre = [
        {"genre": g, "average_rating": round(sum(r) / len(r), 1)}
        for g, r in genre_ratings.items()
    ]
    ratings_by_genre.sort(key=lambda x: x["average_rating"], reverse=True)

    # 7. Rewatch & Confronto Esplorazione vs Nostalgia & Guilty Pleasures
    movie_log_counts: Dict[str, int] = {}
    movie_first_watch_minutes = 0
    movie_rewatch_minutes = 0

    for l in logs:
        if l.tmdb_movie:
            title = l.tmdb_movie.title
            movie_log_counts[title] = movie_log_counts.get(title, 0) + 1

    for title, count in movie_log_counts.items():
        matching_log = next((l for l in logs if l.tmdb_movie and l.tmdb_movie.title == title), None)
        runtime = movie_runtime_map.get(matching_log.movie_tmdb_id, 100) if matching_log else 100
        movie_first_watch_minutes += runtime
        if count > 1:
            movie_rewatch_minutes += (count - 1) * runtime

    most_rewatched: List[Dict[str, Any]] = []
    guilty_pleasures: List[Dict[str, Any]] = []

    for title, count in movie_log_counts.items():
        if count > 1:
            r_list = film_rating_map.get(title, [])
            avg_r = round(sum(r_list) / len(r_list), 1) if r_list else None
            item = {
                "title": title,
                "rewatch_count": count,
                "rating": avg_r,
            }
            most_rewatched.append(item)
            if avg_r is not None:
                guilty_pleasures.append(item)

    most_rewatched.sort(key=lambda x: x["rewatch_count"], reverse=True)
    most_rewatched = most_rewatched[:10]

    # Guilty pleasures: voto più basso in cima
    guilty_pleasures.sort(key=lambda x: x["rating"])
    guilty_pleasures = guilty_pleasures[:5]

    rewatch_comparison = {
        "first_watch_hours": round(movie_first_watch_minutes / 60.0, 1),
        "rewatch_hours": round(movie_rewatch_minutes / 60.0, 1),
    }

    # 8. Piattaforme
    total_platform_logs = sum(platform_counts.values()) or 1
    platform_dist = [
        {"platform": name, "percentage": round(count / total_platform_logs * 100, 1)}
        for name, count in platform_counts.items()
    ]

    # 9. Distribuzione Generi (Top generi guardati)
    total_genre_logs = sum(genre_counts.values()) or 1
    genres_distribution = [
        {"genre": g, "percentage": round((count / total_genre_logs) * 100, 1), "count": count}
        for g, count in sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    # 10. Andamento Mensile per Anno (Time Trend)
    time_trend_map: Dict[str, Dict[int, Dict[str, Any]]] = {}
    for l in logs:
        if l.watched_at:
            w_year = l.watched_at.strftime("%Y")
            w_month_idx = l.watched_at.month - 1
            m_runtime = movie_runtime_map.get(l.movie_tmdb_id, 100)

            if w_year not in time_trend_map:
                time_trend_map[w_year] = {
                    i: {"count": 0, "minutes": 0} for i in range(12)
                }
            time_trend_map[w_year][w_month_idx]["count"] += 1
            time_trend_map[w_year][w_month_idx]["minutes"] += m_runtime

    month_names_ita = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"]
    now_year = str(today.year)
    if now_year not in time_trend_map:
        time_trend_map[now_year] = {i: {"count": 0, "minutes": 0} for i in range(12)}

    time_trend: Dict[str, List[Dict[str, Any]]] = {}
    for y_str, m_dict in time_trend_map.items():
        time_trend[y_str] = [
            {
                "period": month_names_ita[idx],
                "movies": m_dict[idx]["count"],
                "hours": round(m_dict[idx]["minutes"] / 60.0, 1),
            }
            for idx in range(12)
        ]

    return MovieFullStats(
        total_watch_time={
            "days": days_watch,
            "hours": hours_watch,
            "minutes": mins_watch,
            "total_minutes": total_minutes,
        },
        completion_rate={
            "percentage": round(completion_pct, 1),
            "watched": watched_count,
            "to_watch": to_watch_count,
        },
        watchlist_forecast={"estimated_date": estimated_date},
        personal_records={
            "max_movies_in_day": str(max_movies_in_day),
            "max_movies_day": max_movies_day,
        },
        general_stats={
            "movies_last_month": movies_last_month,
            "movies_last_year": movies_last_year,
            "hours_last_month": round(minutes_last_month / 60.0, 1),
            "hours_last_year": round(minutes_last_year / 60.0, 1),
            "minutes_last_month": minutes_last_month,
            "minutes_last_year": minutes_last_year,
            "movies_watched_total": watched_count,
            "movies_to_watch_total": to_watch_count,
        },
        ratings_distribution=ratings_dist,
        ratings_by_genre=ratings_by_genre,
        top_10_movies=top_10,
        most_rewatched=most_rewatched,
        rewatch_comparison=rewatch_comparison,
        guilty_pleasures=guilty_pleasures,
        platform_distribution=platform_dist,
        viewing_habits={
            "by_day": days_counter,
            "by_hour": hours_counter,
        },
        genres_distribution=genres_distribution,
        time_trend=time_trend,
    )
