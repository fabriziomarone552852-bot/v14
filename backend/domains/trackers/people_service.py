"""
Service layer for Trackers People (Actors, Directors, Creators) and Credits.
Handles TMDB /search/person, /person/{id}, multi-person AND/OR filmography
resolution, credits summary extraction, and batch backfill for local DB.
"""

from __future__ import annotations

import asyncio
import math
import time
from typing import Any, Dict, Generic, List, Optional, Set, Tuple, TypeVar

import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.domains.trackers import movie_repository as movie_repo
from backend.domains.trackers import repository as series_repo
from backend.domains.trackers.models import TMDBMovie, TMDBSeries
from backend.domains.trackers.people_schemas import (
    MediaCreditPerson,
    PersonCreditMovieItem,
    PersonCreditSeriesItem,
    PersonDetailResponse,
    ResolvedPersonRef,
    TMDBPaginatedPersonSearch,
    TMDBPersonAlternative,
    TMDBPersonSearchItem,
)
from backend.domains.trackers.tmdb_filter_utils import (
    TMDB_BASE_URL,
    filter_candidates_by_providers_and_status,
    get_tmdb_headers,
    item_matches_genres_and_year,
    normalize_tmdb_sort_by,
    parse_genre_constraints,
    parse_int_set,
    parse_tv_status_tokens,
    sort_raw_tmdb_items,
)
from backend.domains.users.models import User

T = TypeVar("T")

_JOB_LABELS_IT: Dict[str, str] = {
    "Director": "Regista",
    "Screenplay": "Sceneggiatura",
    "Writer": "Sceneggiatura",
    "Creator": "Creatore",
    "Executive Producer": "Produttore esecutivo",
    "Producer": "Produttore",
}


class _TTLCache(Generic[T]):
    """Lightweight bounded in-memory TTL cache for TMDB person lookups."""

    def __init__(self, ttl_seconds: float, max_entries: int = 500) -> None:
        self._ttl = ttl_seconds
        self._max_entries = max_entries
        self._store: Dict[Any, Tuple[float, T]] = {}

    def get(self, key: Any) -> Optional[T]:
        entry = self._store.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if time.monotonic() > expires_at:
            self._store.pop(key, None)
            return None
        return value

    def set(self, key: Any, value: T) -> None:
        now = time.monotonic()
        if len(self._store) >= self._max_entries:
            expired = [k for k, (exp, _) in self._store.items() if now > exp]
            for k in expired:
                self._store.pop(k, None)
            while len(self._store) >= self._max_entries:
                oldest_key = next(iter(self._store))
                self._store.pop(oldest_key, None)
        self._store[key] = (now + self._ttl, value)


_PERSON_SEARCH_CACHE: _TTLCache[TMDBPaginatedPersonSearch] = _TTLCache(1800, 400)
_PERSON_SUMMARY_CACHE: _TTLCache[TMDBPersonSearchItem] = _TTLCache(1800, 800)
_PERSON_CREDITS_CACHE: _TTLCache[Dict[int, Dict[str, Any]]] = _TTLCache(900, 400)


def _translate_job(job: Optional[str]) -> str:
    clean = (job or "").strip()
    if not clean:
        return "Cast/Crew"
    return _JOB_LABELS_IT.get(clean, clean)


def _extract_known_for_titles(raw_item: Dict[str, Any]) -> List[str]:
    titles: List[str] = []
    for k in raw_item.get("known_for") or []:
        t = (k.get("title") or k.get("name") or "").strip()
        if t and t not in titles:
            titles.append(t)
        if len(titles) >= 3:
            break
    return titles


def _parse_person_search_item(raw_item: Dict[str, Any]) -> TMDBPersonSearchItem:
    return TMDBPersonSearchItem(
        id=int(raw_item["id"]),
        name=(raw_item.get("name") or "").strip() or "Sconosciuto",
        original_name=raw_item.get("original_name"),
        profile_path=raw_item.get("profile_path"),
        known_for_department=raw_item.get("known_for_department"),
        popularity=raw_item.get("popularity"),
        known_for_titles=_extract_known_for_titles(raw_item),
    )


# ==========================================
# 🧩 ESTRAZIONE CREDITS SUMMARY PER DB LOCALE
# ==========================================


def extract_movie_directors(raw_movie: Dict[str, Any]) -> List[MediaCreditPerson]:
    """Extracts unique Director entries with TMDB person IDs from raw movie payload."""
    crew_data = (raw_movie.get("credits") or {}).get("crew") or []
    seen: Set[int] = set()
    directors: List[MediaCreditPerson] = []
    for member in crew_data:
        if member.get("job") != "Director":
            continue
        pid = member.get("id")
        name = (member.get("name") or "").strip()
        if isinstance(pid, int) and name and pid not in seen:
            seen.add(pid)
            directors.append(
                MediaCreditPerson(
                    id=pid,
                    name=name,
                    profile_path=member.get("profile_path"),
                )
            )
    return directors


def extract_movie_credits_summary(raw_movie: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extracts directors + top 20 cast members for compact JSON DB storage."""
    credits = raw_movie.get("credits") or {}
    by_id: Dict[int, Dict[str, Any]] = {}

    for director in extract_movie_directors(raw_movie):
        by_id[director.id] = {
            "id": director.id,
            "name": director.name,
            "role": "Regista",
            "department": "Directing",
            "profile_path": director.profile_path,
        }

    for actor in (credits.get("cast") or [])[:20]:
        pid = actor.get("id")
        name = (actor.get("name") or "").strip()
        if not isinstance(pid, int) or not name:
            continue
        character = (actor.get("character") or "").strip()
        if pid in by_id:
            if character:
                by_id[pid]["role"] = f"Regista • {character}"
        else:
            by_id[pid] = {
                "id": pid,
                "name": name,
                "role": character or "Attore",
                "department": "Acting",
                "profile_path": actor.get("profile_path"),
            }

    return list(by_id.values())


def extract_series_creators(raw_series: Dict[str, Any]) -> List[MediaCreditPerson]:
    """Extracts unique series creators (`created_by`) with TMDB person IDs."""
    seen: Set[int] = set()
    creators: List[MediaCreditPerson] = []
    for c in raw_series.get("created_by") or []:
        pid = c.get("id")
        name = (c.get("name") or "").strip()
        if isinstance(pid, int) and name and pid not in seen:
            seen.add(pid)
            creators.append(
                MediaCreditPerson(
                    id=pid,
                    name=name,
                    profile_path=c.get("profile_path"),
                )
            )
    return creators


def extract_series_credits_summary(raw_series: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Extracts creators + top directors + top 20 aggregate cast members
    (covering all seasons) for compact JSON DB storage.
    """
    by_id: Dict[int, Dict[str, Any]] = {}

    for creator in extract_series_creators(raw_series):
        by_id[creator.id] = {
            "id": creator.id,
            "name": creator.name,
            "role": "Creatore",
            "department": "Creator",
            "profile_path": creator.profile_path,
        }

    agg = raw_series.get("aggregate_credits") or raw_series.get("credits") or {}

    director_candidates: List[Tuple[int, Dict[str, Any]]] = []
    for crew_member in agg.get("crew") or []:
        jobs = crew_member.get("jobs") or []
        is_dir = crew_member.get("job") == "Director" or any(
            j.get("job") in ("Director", "Series Director") for j in jobs
        )
        if not is_dir:
            continue
        ep_count = int(crew_member.get("total_episode_count") or 1)
        director_candidates.append((ep_count, crew_member))

    director_candidates.sort(key=lambda pair: pair[0], reverse=True)
    for _, member in director_candidates[:3]:
        pid = member.get("id")
        name = (member.get("name") or "").strip()
        if not isinstance(pid, int) or not name:
            continue
        if pid in by_id:
            if "Regista" not in (by_id[pid].get("role") or ""):
                by_id[pid]["role"] = f"{by_id[pid]['role']} • Regista"
        else:
            by_id[pid] = {
                "id": pid,
                "name": name,
                "role": "Regista",
                "department": "Directing",
                "profile_path": member.get("profile_path"),
            }

    for actor in (agg.get("cast") or [])[:20]:
        pid = actor.get("id")
        name = (actor.get("name") or "").strip()
        if not isinstance(pid, int) or not name:
            continue
        roles = actor.get("roles") or []
        character = ""
        if roles and isinstance(roles[0], dict):
            character = (roles[0].get("character") or "").strip()
        else:
            character = (actor.get("character") or "").strip()

        if pid in by_id:
            if character:
                by_id[pid]["role"] = f"{by_id[pid]['role']} • {character}"
        else:
            by_id[pid] = {
                "id": pid,
                "name": name,
                "role": character or "Attore",
                "department": "Acting",
                "profile_path": actor.get("profile_path"),
            }

    return list(by_id.values())


# ==========================================
# 🔍 TMDB PEOPLE SEARCH & FILMOGRAFIA
# ==========================================


async def search_tmdb_people(query: str, page: int = 1) -> TMDBPaginatedPersonSearch:
    """Live search on TMDB /search/person for autocomplete suggestions & resolution."""
    clean = (query or "").strip()
    if not clean:
        return TMDBPaginatedPersonSearch(page=1, results=[], total_pages=0, total_results=0)

    cache_key = (clean.lower(), page)
    cached = _PERSON_SEARCH_CACHE.get(cache_key)
    if cached is not None:
        return cached

    url = f"{TMDB_BASE_URL}/search/person"
    params = {
        "query": clean,
        "page": str(page),
        "language": "it-IT",
        "include_adult": "false",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=get_tmdb_headers(), params=params)

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Errore nella ricerca persone su TMDB",
        )

    data = response.json()
    items: List[TMDBPersonSearchItem] = []
    for raw in data.get("results") or []:
        if raw.get("adult") is True or not isinstance(raw.get("id"), int):
            continue
        item = _parse_person_search_item(raw)
        items.append(item)
        _PERSON_SUMMARY_CACHE.set(item.id, item)

    parsed = TMDBPaginatedPersonSearch(
        page=int(data.get("page") or page),
        results=items,
        total_pages=int(data.get("total_pages") or 0) if items else 0,
        total_results=int(data.get("total_results") or len(items)) if items else 0,
    )
    _PERSON_SEARCH_CACHE.set(cache_key, parsed)
    return parsed


async def _fetch_person_summary_by_id(person_id: int) -> Optional[TMDBPersonSearchItem]:
    cached = _PERSON_SUMMARY_CACHE.get(person_id)
    if cached is not None:
        return cached

    url = f"{TMDB_BASE_URL}/person/{person_id}"
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            url, headers=get_tmdb_headers(), params={"language": "it-IT"}
        )
    if resp.status_code != 200:
        return None
    raw = resp.json()
    if raw.get("adult") is True:
        return None
    item = _parse_person_search_item(raw)
    _PERSON_SUMMARY_CACHE.set(person_id, item)
    return item


async def get_person_detail(person_id: int) -> PersonDetailResponse:
    """Fetches full TMDB person profile and deduplicated Movie + TV filmography."""
    url = f"{TMDB_BASE_URL}/person/{person_id}"
    params = {
        "language": "it-IT",
        "append_to_response": "combined_credits",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=get_tmdb_headers(), params=params)
        if response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Persona non trovata su TMDB",
            )
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Errore TMDB nel recupero scheda persona",
            )
        data = response.json()

        biography = (data.get("biography") or "").strip()
        if not biography:
            resp_en = await client.get(
                url, headers=get_tmdb_headers(), params={"language": "en-US"}
            )
            if resp_en.status_code == 200:
                biography = (resp_en.json().get("biography") or "").strip()

    combined = data.get("combined_credits") or {}
    movies_by_id: Dict[int, PersonCreditMovieItem] = {}
    tv_by_id: Dict[int, PersonCreditSeriesItem] = {}

    def _add_credit(raw: Dict[str, Any], role_label: str) -> None:
        if raw.get("adult") is True:
            return
        mid = raw.get("id")
        if not isinstance(mid, int):
            return
        media_type = raw.get("media_type")
        if not media_type:
            media_type = "tv" if "first_air_date" in raw or "name" in raw else "movie"

        if media_type == "movie":
            existing = movies_by_id.get(mid)
            if existing is None:
                movies_by_id[mid] = PersonCreditMovieItem(
                    id=mid,
                    title=(raw.get("title") or raw.get("original_title") or "Senza Titolo"),
                    original_title=raw.get("original_title"),
                    overview=raw.get("overview"),
                    poster_path=raw.get("poster_path"),
                    backdrop_path=raw.get("backdrop_path"),
                    release_date=raw.get("release_date") or None,
                    vote_average=raw.get("vote_average"),
                    popularity=raw.get("popularity"),
                    roles=[role_label] if role_label else [],
                )
            elif role_label and role_label not in existing.roles:
                existing.roles.append(role_label)
        elif media_type == "tv":
            existing_tv = tv_by_id.get(mid)
            if existing_tv is None:
                tv_by_id[mid] = PersonCreditSeriesItem(
                    id=mid,
                    name=(raw.get("name") or raw.get("original_name") or "Senza Titolo"),
                    original_name=raw.get("original_name"),
                    overview=raw.get("overview"),
                    poster_path=raw.get("poster_path"),
                    backdrop_path=raw.get("backdrop_path"),
                    first_air_date=raw.get("first_air_date") or None,
                    vote_average=raw.get("vote_average"),
                    popularity=raw.get("popularity"),
                    roles=[role_label] if role_label else [],
                )
            elif role_label and role_label not in existing_tv.roles:
                existing_tv.roles.append(role_label)

    for c in combined.get("cast") or []:
        char = (c.get("character") or "").strip()
        _add_credit(c, char or "Cast")

    for c in combined.get("crew") or []:
        job = _translate_job(c.get("job"))
        _add_credit(c, job)

    movie_credits = sorted(
        movies_by_id.values(),
        key=lambda m: float(m.popularity or 0.0),
        reverse=True,
    )
    tv_credits = sorted(
        tv_by_id.values(),
        key=lambda s: float(s.popularity or 0.0),
        reverse=True,
    )

    return PersonDetailResponse(
        id=int(data["id"]),
        name=(data.get("name") or "").strip() or "Sconosciuto",
        profile_path=data.get("profile_path"),
        biography=biography or None,
        birthday=data.get("birthday") or None,
        deathday=data.get("deathday") or None,
        place_of_birth=data.get("place_of_birth") or None,
        known_for_department=data.get("known_for_department"),
        popularity=data.get("popularity"),
        movie_credits=movie_credits,
        tv_credits=tv_credits,
    )


# ==========================================
# 🎯 RISOLUZIONE MULTI-PERSONA & FILTRO AND/OR
# ==========================================


def parse_people_tokens(raw_people: Optional[str]) -> List[str]:
    """Splits comma-separated person names/IDs ignoring blank trailing segments."""
    if not raw_people:
        return []
    tokens: List[str] = []
    seen_lower: Set[str] = set()
    for part in raw_people.split(","):
        clean = part.strip()
        if not clean:
            continue
        low = clean.lower()
        if low not in seen_lower:
            seen_lower.add(low)
            tokens.append(clean)
    return tokens


def normalize_people_mode(people_mode: Optional[str]) -> str:
    if people_mode and people_mode.strip().upper() == "OR":
        return "OR"
    return "AND"


def _pick_best_person_match(
    token: str, candidates: List[TMDBPersonSearchItem]
) -> Tuple[TMDBPersonSearchItem, List[TMDBPersonAlternative]]:
    low = token.strip().lower()
    exact = [
        c
        for c in candidates[:5]
        if c.name.strip().lower() == low
        or (c.original_name and c.original_name.strip().lower() == low)
    ]
    if exact:
        best = max(exact, key=lambda c: float(c.popularity or 0.0))
    else:
        best = candidates[0]

    alternatives = [
        TMDBPersonAlternative(
            id=c.id,
            name=c.name,
            profile_path=c.profile_path,
            known_for_department=c.known_for_department,
            known_for_titles=c.known_for_titles,
        )
        for c in candidates[:6]
        if c.id != best.id
    ][:4]
    return best, alternatives


async def resolve_people_input(
    raw_people: Optional[str],
    people_mode: Optional[str] = "AND",
) -> Tuple[List[ResolvedPersonRef], str, bool]:
    """
    Resolves comma-separated names and/or numeric TMDB person IDs in parallel.
    Returns (resolved_refs, normalized_mode, all_tokens_matched).
    """
    mode = normalize_people_mode(people_mode)
    tokens = parse_people_tokens(raw_people)
    if not tokens:
        return [], mode, True

    async def _resolve_one(token: str) -> Optional[ResolvedPersonRef]:
        if token.isdigit():
            pid = int(token)
            summary = await _fetch_person_summary_by_id(pid)
            if summary is None:
                return None
            return ResolvedPersonRef(
                query=token,
                id=summary.id,
                name=summary.name,
                profile_path=summary.profile_path,
                known_for_department=summary.known_for_department,
                alternatives=[],
            )

        res = await search_tmdb_people(token, page=1)
        if not res.results:
            return None
        best, alternatives = _pick_best_person_match(token, res.results)
        return ResolvedPersonRef(
            query=token,
            id=best.id,
            name=best.name,
            profile_path=best.profile_path,
            known_for_department=best.known_for_department,
            alternatives=alternatives,
        )

    resolved_raw = await asyncio.gather(*(_resolve_one(tok) for tok in tokens))
    all_matched = all(item is not None for item in resolved_raw)

    deduped: List[ResolvedPersonRef] = []
    seen_ids: Set[int] = set()
    for item in resolved_raw:
        if item is not None and item.id not in seen_ids:
            seen_ids.add(item.id)
            deduped.append(item)

    return deduped, mode, all_matched


async def fetch_person_media_credits_map(
    person_id: int,
    media_type: str,
) -> Dict[int, Dict[str, Any]]:
    """
    Fetches and caches all movie or TV credits (cast + crew combined)
    for a single TMDB person ID, deduplicated by media TMDB ID.
    """
    cache_key = (person_id, media_type)
    cached = _PERSON_CREDITS_CACHE.get(cache_key)
    if cached is not None:
        return cached

    url = f"{TMDB_BASE_URL}/person/{person_id}/{media_type}_credits"
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            url, headers=get_tmdb_headers(), params={"language": "it-IT"}
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Errore TMDB nel recupero crediti ({media_type}) per persona {person_id}",
        )

    payload = resp.json()
    by_media_id: Dict[int, Dict[str, Any]] = {}
    for bucket in (payload.get("cast") or [], payload.get("crew") or []):
        for entry in bucket:
            if entry.get("adult") is True:
                continue
            mid = entry.get("id")
            if not isinstance(mid, int):
                continue
            if mid not in by_media_id:
                by_media_id[mid] = entry
            elif not by_media_id[mid].get("poster_path") and entry.get("poster_path"):
                by_media_id[mid] = entry

    _PERSON_CREDITS_CACHE.set(cache_key, by_media_id)
    return by_media_id


def _item_matches_text_query(
    item: Dict[str, Any],
    query_clean: str,
    media_type: str,
) -> bool:
    if not query_clean:
        return True
    q_low = query_clean.lower()
    title_key = "name" if media_type == "tv" else "title"
    orig_key = "original_name" if media_type == "tv" else "original_title"
    t1 = str(item.get(title_key) or "").lower()
    t2 = str(item.get(orig_key) or "").lower()
    if q_low in t1 or q_low in t2:
        return True
    words = [w for w in q_low.split() if w]
    if len(words) > 1:
        combined = f"{t1} {t2}"
        return all(w in combined for w in words)
    return False


async def search_or_discover_media_by_people(
    *,
    media_type: str,
    with_people: str,
    people_mode: Optional[str] = "AND",
    query: Optional[str] = None,
    page: int = 1,
    with_genres: Optional[str] = None,
    without_genres: Optional[str] = None,
    with_watch_providers: Optional[str] = None,
    with_status: Optional[str] = None,
    year: Optional[str] = None,
    sort_by: Optional[str] = None,
    db: Optional[Session] = None,
) -> Tuple[List[Dict[str, Any]], int, int, List[ResolvedPersonRef]]:
    """
    Executes multi-person AND/OR filmography search & cross-filtering
    using TMDB person credits, supporting optional title query, genres,
    years, watch providers, TV production status, and sorting.
    """
    resolved, mode, all_matched = await resolve_people_input(with_people, people_mode)
    if not resolved or (mode == "AND" and not all_matched):
        return [], 0, 0, resolved

    credit_maps = await asyncio.gather(
        *(fetch_person_media_credits_map(p.id, media_type) for p in resolved)
    )

    if mode == "AND":
        common_ids: Set[int] = set(credit_maps[0].keys())
        for cmap in credit_maps[1:]:
            common_ids &= set(cmap.keys())
        merged_map = {mid: credit_maps[0][mid] for mid in common_ids}
    else:
        merged_map = {}
        for cmap in credit_maps:
            for mid, item in cmap.items():
                if mid not in merged_map:
                    merged_map[mid] = item

    include_genres, genre_mode, exclude_genres = parse_genre_constraints(
        with_genres, without_genres
    )
    clean_year = year.strip() if year and year != "all" else None
    clean_query = (query or "").strip()
    date_field = "first_air_date" if media_type == "tv" else "release_date"
    title_field = "name" if media_type == "tv" else "title"

    candidates: List[Dict[str, Any]] = []
    for item in merged_map.values():
        if not _item_matches_text_query(item, clean_query, media_type):
            continue
        if not item_matches_genres_and_year(
            item, include_genres, genre_mode, exclude_genres, clean_year, date_field
        ):
            continue
        candidates.append(item)

    tmdb_sort = normalize_tmdb_sort_by(sort_by, media_type)
    candidates = sort_raw_tmdb_items(
        candidates,
        tmdb_sort,
        title_field,
        date_field,
        sort_popularity_explicitly=True,
    )

    provider_ids = parse_int_set(with_watch_providers)
    tv_statuses = parse_tv_status_tokens(with_status) if media_type == "tv" else set()

    if provider_ids or tv_statuses:
        chunk_size = 40
        total_candidates = len(candidates)
        virtual_total_pages = math.ceil(total_candidates / chunk_size) if total_candidates > 0 else 0
        start_idx = (page - 1) * chunk_size
        page_slice = candidates[start_idx : start_idx + chunk_size]
        if not page_slice:
            return [], virtual_total_pages, 0, resolved

        async with httpx.AsyncClient(timeout=15.0) as client:
            filtered_slice = await filter_candidates_by_providers_and_status(
                client=client,
                base_url=TMDB_BASE_URL,
                headers=get_tmdb_headers(),
                media_type=media_type,
                candidates=page_slice,
                provider_ids=provider_ids,
                tv_statuses=tv_statuses,
                db=db,
            )
        return filtered_slice, virtual_total_pages, len(filtered_slice), resolved

    per_page = 20
    total_results = len(candidates)
    total_pages = math.ceil(total_results / per_page) if total_results > 0 else 0
    start_idx = (page - 1) * per_page
    return candidates[start_idx : start_idx + per_page], total_pages, total_results, resolved


# ==========================================
# 🔄 BACKFILL CREDITS PER LIBRERIA ESISTENTE
# ==========================================


async def sync_missing_user_movie_credits(db: Session, current_user: User) -> Dict[str, int]:
    """Populates `credits_summary` in batches of 50 for existing user movies."""
    trackings = movie_repo.list_user_movie_trackings(db, current_user.id)
    sorted_trackings = sorted(
        trackings,
        key=lambda t: 0 if t.status == "to_watch" else 1,
    )

    to_sync: List[TMDBMovie] = []
    seen_ids: Set[int] = set()
    for t in sorted_trackings:
        m = t.tmdb_movie
        if not m or m.tmdb_id in seen_ids:
            continue
        seen_ids.add(m.tmdb_id)
        if m.credits_summary is None:
            to_sync.append(m)

    if not to_sync:
        return {"synced_count": 0, "remaining_count": 0}

    batch = to_sync[:50]
    remaining = max(0, len(to_sync) - len(batch))
    headers = get_tmdb_headers()
    sem = asyncio.Semaphore(8)

    async def _fetch_one(
        client: httpx.AsyncClient, tmdb_id: int
    ) -> Tuple[int, Optional[List[Dict[str, Any]]]]:
        async with sem:
            try:
                resp = await client.get(
                    f"{TMDB_BASE_URL}/movie/{tmdb_id}",
                    headers=headers,
                    params={"language": "it-IT", "append_to_response": "credits"},
                )
                if resp.status_code == 200:
                    return tmdb_id, extract_movie_credits_summary(resp.json())
            except Exception:
                pass
            return tmdb_id, None

    async with httpx.AsyncClient(timeout=15.0) as client:
        results = await asyncio.gather(*(_fetch_one(client, m.tmdb_id) for m in batch))

    movie_map = {m.tmdb_id: m for m in batch}
    synced_count = 0
    for tmdb_id, summary in results:
        if summary is not None and tmdb_id in movie_map:
            movie_map[tmdb_id].credits_summary = summary
            synced_count += 1

    if synced_count > 0:
        db.commit()

    return {"synced_count": synced_count, "remaining_count": remaining}


async def sync_missing_user_series_credits(db: Session, current_user: User) -> Dict[str, int]:
    """Populates `credits_summary` in batches of 50 for existing user TV series."""
    trackings = series_repo.list_user_series(db, current_user.id)
    sorted_trackings = sorted(
        trackings,
        key=lambda t: 0 if t.status in ("watching", "to_watch") else 1,
    )

    to_sync: List[TMDBSeries] = []
    seen_ids: Set[int] = set()
    for t in sorted_trackings:
        s = t.tmdb_series
        if not s or s.tmdb_id in seen_ids:
            continue
        seen_ids.add(s.tmdb_id)
        if s.credits_summary is None:
            to_sync.append(s)

    if not to_sync:
        return {"synced_count": 0, "remaining_count": 0}

    batch = to_sync[:50]
    remaining = max(0, len(to_sync) - len(batch))
    headers = get_tmdb_headers()
    sem = asyncio.Semaphore(8)

    async def _fetch_one(
        client: httpx.AsyncClient, tmdb_id: int
    ) -> Tuple[int, Optional[List[Dict[str, Any]]], Optional[str]]:
        async with sem:
            try:
                resp = await client.get(
                    f"{TMDB_BASE_URL}/tv/{tmdb_id}",
                    headers=headers,
                    params={"language": "it-IT", "append_to_response": "aggregate_credits"},
                )
                if resp.status_code == 200:
                    payload = resp.json()
                    creators_str = ", ".join(
                        [c["name"] for c in (payload.get("created_by") or []) if c.get("name")]
                    )
                    return tmdb_id, extract_series_credits_summary(payload), creators_str or None
            except Exception:
                pass
            return tmdb_id, None, None

    async with httpx.AsyncClient(timeout=15.0) as client:
        results = await asyncio.gather(*(_fetch_one(client, s.tmdb_id) for s in batch))

    series_map = {s.tmdb_id: s for s in batch}
    synced_count = 0
    for tmdb_id, summary, creators_str in results:
        if summary is not None and tmdb_id in series_map:
            target = series_map[tmdb_id]
            target.credits_summary = summary
            if not target.creators and creators_str:
                target.creators = creators_str
            synced_count += 1

    if synced_count > 0:
        db.commit()

    return {"synced_count": synced_count, "remaining_count": remaining}
