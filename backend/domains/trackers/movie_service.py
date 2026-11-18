"""
Service layer for Movie Tracker domain.
Manages TMDB API interactions, movie catalog synchronization,
user tracking, logs/reviews, stats, collections/saghe, and upcoming releases.
"""

import asyncio
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

async def search_tmdb_movies(
    query: str,
    page: int = 1,
    with_genres: Optional[str] = None,
    without_genres: Optional[str] = None,
    with_watch_providers: Optional[str] = None,
    primary_release_year: Optional[str] = None,
    sort_by: Optional[str] = None,
    with_people: Optional[str] = None,
    people_mode: Optional[str] = "AND",
    db: Optional[Session] = None,
) -> TMDBPaginatedMovieSearch:
    from backend.domains.trackers.people_service import (
        parse_people_tokens,
        search_or_discover_media_by_people,
    )

    if parse_people_tokens(with_people):
        items, total_pages, total_results, resolved = await search_or_discover_media_by_people(
            media_type="movie",
            with_people=with_people or "",
            people_mode=people_mode,
            query=query,
            page=page,
            with_genres=with_genres,
            without_genres=without_genres,
            with_watch_providers=with_watch_providers,
            year=primary_release_year,
            sort_by=sort_by,
            db=db,
        )
        results = [
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
            for item in items
        ]
        return TMDBPaginatedMovieSearch(
            page=page,
            results=results,
            total_pages=total_pages,
            total_results=total_results,
            resolved_people=resolved,
        )

    if not query.strip():
        return TMDBPaginatedMovieSearch(page=1, results=[], total_pages=0, total_results=0)

    has_extra_filters = any(
        val and val != "all"
        for val in (
            with_genres,
            without_genres,
            with_watch_providers,
            primary_release_year,
        )
    ) or (
        sort_by is not None
        and sort_by not in ("", "date_added_desc", "obtained_desc", "popularity.desc")
    )

    if has_extra_filters:
        from backend.domains.trackers.tmdb_filter_utils import (
            fetch_filtered_tmdb_search_pages,
        )

        items, virtual_pages, approx_total = await fetch_filtered_tmdb_search_pages(
            base_url=TMDB_BASE_URL,
            headers=get_tmdb_headers(),
            media_type="movie",
            query=query,
            page=page,
            with_genres=with_genres,
            without_genres=without_genres,
            with_watch_providers=with_watch_providers,
            year=primary_release_year,
            sort_by=sort_by,
            db=db,
        )
        results = [
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
            for item in items
        ]
        return TMDBPaginatedMovieSearch(
            page=page,
            results=results,
            total_pages=virtual_pages,
            total_results=approx_total,
        )

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
    without_genres: Optional[str] = None,
    with_watch_providers: Optional[str] = None,
    primary_release_year: Optional[str] = None,
    sort_by: Optional[str] = "popularity.desc",
    with_people: Optional[str] = None,
    people_mode: Optional[str] = "AND",
    page: int = 1,
) -> TMDBPaginatedMovieSearch:
    from backend.domains.trackers.tmdb_filter_utils import (
        execute_tmdb_discover_variants,
        normalize_tmdb_sort_by,
    )
    from backend.domains.trackers.people_service import (
        parse_people_tokens,
        resolve_people_input,
    )

    resolved_people = []
    url = f"{TMDB_BASE_URL}/discover/movie"
    tmdb_sort = normalize_tmdb_sort_by(sort_by, "movie")
    params: Dict[str, Any] = {
        "include_adult": "false",
        "language": "it-IT",
        "page": page,
        "sort_by": tmdb_sort,
    }
    if parse_people_tokens(with_people):
        resolved_people, mode, all_matched = await resolve_people_input(
            with_people, people_mode
        )
        if not resolved_people or (mode == "AND" and not all_matched):
            return TMDBPaginatedMovieSearch(
                page=page,
                results=[],
                total_pages=0,
                total_results=0,
                resolved_people=resolved_people,
            )
        sep = "," if mode == "AND" else "|"
        params["with_people"] = sep.join(str(p.id) for p in resolved_people)

    if with_genres and with_genres != "all":
        params["with_genres"] = with_genres
    if without_genres and without_genres != "all":
        params["without_genres"] = without_genres
    if with_watch_providers and with_watch_providers != "all":
        params["with_watch_providers"] = with_watch_providers
        params["watch_region"] = "IT"

    try:
        raw_items, max_pages, total_res = await execute_tmdb_discover_variants(
            url=url,
            headers=get_tmdb_headers(),
            base_params=params,
            year_raw=primary_release_year,
            year_param_name="primary_release_year",
            date_range_prefix="primary_release_date",
            extra_variants=[],
            tmdb_sort=tmdb_sort,
            title_field="title",
            date_field="release_date",
        )
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Errore nel discover film su TMDB: {exc}",
        )

    results: List[TMDBMovieSearchResult] = []
    for item in raw_items:
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
        page=page,
        results=results,
        total_pages=max_pages,
        total_results=total_res,
        resolved_people=resolved_people,
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


def _extract_italy_watch_providers_from_it_dict(it_data: Optional[dict]) -> List[dict]:
    """Estrae i provider streaming inclusi in Italia (flatrate, free, ads) deduplicati per provider_id."""
    if not it_data or not isinstance(it_data, dict):
        return []
    seen_ids: set[int] = set()
    extracted: List[dict] = []
    for bucket in ("flatrate", "free", "ads"):
        for p in it_data.get(bucket, []) or []:
            pid = p.get("provider_id")
            pname = p.get("provider_name")
            if isinstance(pid, int) and pname and pid not in seen_ids:
                seen_ids.add(pid)
                extracted.append(
                    {
                        "provider_id": pid,
                        "provider_name": pname,
                        "logo_path": p.get("logo_path"),
                    }
                )
    return extracted


async def fetch_tmdb_movie_providers(tmdb_id: int, db: Optional[Session] = None) -> dict:
    url = f"{TMDB_BASE_URL}/movie/{tmdb_id}/watch/providers"
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=get_tmdb_headers())

    if response.status_code != 200:
        return {}

    data = response.json()
    results = data.get("results", {})
    it_data = results.get("IT", {})

    if db is not None:
        movie = repo.get_tmdb_movie(db, tmdb_id)
        if movie is not None:
            movie.watch_providers = _extract_italy_watch_providers_from_it_dict(it_data)
            movie.providers_synced_at = datetime.now(timezone.utc)
            repo.save_tmdb_movie(db, movie)

    return it_data


async def fetch_tmdb_movie_detail_raw(tmdb_id: int) -> dict:
    url = f"{TMDB_BASE_URL}/movie/{tmdb_id}"
    params = {
        "language": "it-IT",
        "append_to_response": "release_dates,credits,recommendations,watch/providers",
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

    from backend.domains.trackers.people_service import extract_movie_credits_summary

    it_wp = raw.get("watch/providers", {}).get("results", {}).get("IT", {})
    movie.watch_providers = _extract_italy_watch_providers_from_it_dict(it_wp)
    movie.providers_synced_at = datetime.now(timezone.utc)
    movie.credits_summary = extract_movie_credits_summary(raw)
    movie.last_sync_at = datetime.now(timezone.utc)
    return repo.save_tmdb_movie(db, movie)


async def sync_missing_user_movie_providers(db: Session, current_user: User) -> Dict[str, int]:
    """
    Sincronizza in blocco i watch_providers IT per i film del catalogo utente
    che non sono mai stati sincronizzati o il cui sync è più vecchio di 14 giorni.
    """
    trackings = repo.list_user_movie_trackings(db, current_user.id)
    now = datetime.now(timezone.utc)
    stale_cutoff = now - timedelta(days=14)

    # Priorità ai film ancora da guardare ('to_watch')
    sorted_trackings = sorted(
        trackings,
        key=lambda t: 0 if t.status == "to_watch" else 1,
    )

    to_sync_movies: List[TMDBMovie] = []
    seen_movie_ids: set[int] = set()

    for t in sorted_trackings:
        m = t.tmdb_movie
        if not m or m.tmdb_id in seen_movie_ids:
            continue
        seen_movie_ids.add(m.tmdb_id)

        synced_at = m.providers_synced_at
        if synced_at is not None and synced_at.tzinfo is None:
            synced_at = synced_at.replace(tzinfo=timezone.utc)

        if m.watch_providers is None or synced_at is None or synced_at < stale_cutoff:
            to_sync_movies.append(m)

    if not to_sync_movies:
        return {"synced_count": 0, "remaining_count": 0}

    batch = to_sync_movies[:50]
    remaining = max(0, len(to_sync_movies) - len(batch))
    headers = get_tmdb_headers()
    sem = asyncio.Semaphore(8)

    async def _fetch_one(client: httpx.AsyncClient, tmdb_id: int) -> Tuple[int, Optional[List[dict]]]:
        async with sem:
            try:
                resp = await client.get(
                    f"{TMDB_BASE_URL}/movie/{tmdb_id}/watch/providers",
                    headers=headers,
                )
                if resp.status_code == 200:
                    it_dict = resp.json().get("results", {}).get("IT", {})
                    return tmdb_id, _extract_italy_watch_providers_from_it_dict(it_dict)
            except Exception:
                pass
            return tmdb_id, None

    async with httpx.AsyncClient(timeout=15.0) as client:
        results = await asyncio.gather(*[_fetch_one(client, m.tmdb_id) for m in batch])

    movie_map = {m.tmdb_id: m for m in batch}
    synced_count = 0
    for tmdb_id, providers_list in results:
        if providers_list is not None and tmdb_id in movie_map:
            target = movie_map[tmdb_id]
            target.watch_providers = providers_list
            target.providers_synced_at = now
            synced_count += 1

    if synced_count > 0:
        db.commit()

    return {"synced_count": synced_count, "remaining_count": remaining}


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
    from backend.domains.trackers.people_service import (
        extract_movie_credits_summary,
        extract_movie_directors,
    )

    directors = extract_movie_directors(raw)
    director = ", ".join(d.name for d in directors) if directors else None

    existing_movie = repo.get_tmdb_movie(db, tmdb_id)
    if existing_movie is not None and existing_movie.credits_summary is None:
        existing_movie.credits_summary = extract_movie_credits_summary(raw)
        repo.save_tmdb_movie(db, existing_movie)

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
        directors=directors,
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
        watch_providers=tmdb_movie.watch_providers,
        providers_synced_at=tmdb_movie.providers_synced_at,
        credits_summary=tmdb_movie.credits_summary,
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
# 🍿 PROSSIME USCITE & STATISTICHE (DELEGATE A movie_stats_service.py)
# ==========================================

from backend.domains.trackers.movie_stats_service import (  # noqa: E402, F401
    get_upcoming_movies,
    get_movie_dashboard_stats,
    get_movie_full_stats,
)
