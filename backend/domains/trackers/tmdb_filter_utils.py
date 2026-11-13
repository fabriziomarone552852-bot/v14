"""
Shared helpers for cross-filtering TMDB /search and /discover endpoints
across TV Series and Movies (multi-genre AND/OR + NOT exclusions,
multi-provider OR in region IT, year, TV production status, and sorting).
"""

from __future__ import annotations

import asyncio
import math
from typing import Any, Dict, List, Optional, Set, Tuple

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.domains.trackers.models import TMDBMovie, TMDBSeries

VALID_TMDB_TV_SORTS = {
    "popularity.desc",
    "popularity.asc",
    "vote_average.desc",
    "vote_average.asc",
    "first_air_date.desc",
    "first_air_date.asc",
    "name.asc",
    "name.desc",
}

VALID_TMDB_MOVIE_SORTS = {
    "popularity.desc",
    "popularity.asc",
    "vote_average.desc",
    "vote_average.asc",
    "primary_release_date.desc",
    "primary_release_date.asc",
    "release_date.desc",
    "release_date.asc",
    "title.asc",
    "title.desc",
    "original_title.asc",
    "original_title.desc",
}

TV_STATUS_NAME_TO_TMDB_CODE: Dict[str, str] = {
    "returning series": "0",
    "0": "0",
    "ended": "3",
    "3": "3",
    "canceled": "4",
    "cancelled": "4",
    "4": "4",
}


def normalize_tmdb_sort_by(sort_by: Optional[str], media_type: str) -> str:
    if not sort_by:
        return "popularity.desc"

    clean = sort_by.strip()
    if media_type == "tv":
        if clean in VALID_TMDB_TV_SORTS:
            return clean
        mapping = {
            "rating_desc": "vote_average.desc",
            "name_asc": "name.asc",
            "name_desc": "name.desc",
            "release_date_desc": "first_air_date.desc",
            "release_date_asc": "first_air_date.asc",
        }
        return mapping.get(clean, "popularity.desc")

    if clean in VALID_TMDB_MOVIE_SORTS:
        return clean
    mapping = {
        "rating_desc": "vote_average.desc",
        "name_asc": "title.asc",
        "name_desc": "title.desc",
        "release_date_desc": "primary_release_date.desc",
        "release_date_asc": "primary_release_date.asc",
    }
    return mapping.get(clean, "popularity.desc")


def parse_int_set(raw: Optional[str]) -> Set[int]:
    if not raw or raw == "all":
        return set()
    out: Set[int] = set()
    for part in raw.replace(",", "|").split("|"):
        token = part.strip()
        if token.isdigit():
            out.add(int(token))
    return out


def parse_genre_constraints(
    with_genres: Optional[str],
    without_genres: Optional[str],
) -> Tuple[List[int], str, Set[int]]:
    exclude_ids = parse_int_set(without_genres)
    if not with_genres or with_genres == "all":
        return [], "OR", exclude_ids

    mode = "AND" if ("," in with_genres and "|" not in with_genres) else "OR"
    sep = "," if mode == "AND" else "|"
    include_ids: List[int] = []
    for part in with_genres.split(sep):
        token = part.strip()
        if token.isdigit():
            val = int(token)
            if val not in include_ids:
                include_ids.append(val)
    return include_ids, mode, exclude_ids


def parse_tv_status_tokens(with_status: Optional[str]) -> Set[str]:
    if not with_status or with_status == "all":
        return set()
    out: Set[str] = set()
    code_to_name = {
        "0": "Returning Series",
        "3": "Ended",
        "4": "Canceled",
    }
    for part in with_status.replace(",", "|").split("|"):
        token = part.strip()
        if not token:
            continue
        if token in code_to_name:
            out.add(code_to_name[token])
        else:
            out.add(token)
    return out


def map_tv_statuses_for_discover(
    with_status: Optional[str],
) -> Tuple[Optional[str], bool]:
    tokens = parse_tv_status_tokens(with_status)
    if not tokens:
        return None, False

    codes: List[str] = []
    include_miniseries = False
    for tok in tokens:
        lower = tok.lower()
        if lower == "miniseries":
            include_miniseries = True
        elif lower in TV_STATUS_NAME_TO_TMDB_CODE:
            code = TV_STATUS_NAME_TO_TMDB_CODE[lower]
            if code not in codes:
                codes.append(code)

    status_param = "|".join(codes) if codes else None
    return status_param, include_miniseries


def parse_year_tokens(raw_year: Optional[str]) -> List[str]:
    if not raw_year or raw_year == "all":
        return []
    out: List[str] = []
    for part in raw_year.replace(",", "|").split("|"):
        token = part.strip()
        if len(token) == 4 and token.isdigit() and token not in out:
            out.append(token)
    return out


def item_matches_genres_and_year(
    item: Dict[str, Any],
    include_ids: List[int],
    genre_mode: str,
    exclude_ids: Set[int],
    year: Optional[str],
    date_field: str,
) -> bool:
    raw_genre_ids = item.get("genre_ids")
    if isinstance(raw_genre_ids, list):
        item_genres: Set[int] = {int(g) for g in raw_genre_ids if isinstance(g, int)}
    else:
        item_genres = {
            int(g["id"])
            for g in (item.get("genres") or [])
            if isinstance(g, dict) and isinstance(g.get("id"), int)
        }

    if exclude_ids and (item_genres & exclude_ids):
        return False

    if include_ids:
        if genre_mode == "AND":
            if not all(gid in item_genres for gid in include_ids):
                return False
        else:
            if not any(gid in item_genres for gid in include_ids):
                return False

    year_tokens = parse_year_tokens(year)
    if year_tokens:
        raw_date = str(item.get(date_field) or "")
        if not any(raw_date.startswith(yr) for yr in year_tokens):
            return False

    return True


def _extract_it_provider_ids_from_tmdb_dict(it_data: Optional[Dict[str, Any]]) -> Set[int]:
    if not it_data or not isinstance(it_data, dict):
        return set()
    pids: Set[int] = set()
    for bucket in ("flatrate", "free", "ads"):
        for entry in it_data.get(bucket) or []:
            pid = entry.get("provider_id")
            if isinstance(pid, int):
                pids.add(pid)
    return pids


def sort_raw_tmdb_items(
    items: List[Dict[str, Any]],
    sort_by: Optional[str],
    title_field: str,
    date_field: str,
) -> List[Dict[str, Any]]:
    if not sort_by or sort_by in ("date_added_desc", "obtained_desc", "popularity.desc"):
        return items

    if sort_by in ("rating_desc", "vote_average.desc"):
        return sorted(items, key=lambda x: float(x.get("vote_average") or 0.0), reverse=True)
    if sort_by in ("name_asc", "name.asc", "title.asc"):
        return sorted(items, key=lambda x: str(x.get(title_field) or "").lower())
    if sort_by in ("name_desc", "name.desc", "title.desc"):
        return sorted(items, key=lambda x: str(x.get(title_field) or "").lower(), reverse=True)
    if sort_by in ("release_date_desc", "first_air_date.desc", "primary_release_date.desc"):
        return sorted(items, key=lambda x: str(x.get(date_field) or ""), reverse=True)
    if sort_by in ("release_date_asc", "first_air_date.asc", "primary_release_date.asc"):
        return sorted(items, key=lambda x: str(x.get(date_field) or "9999-99-99"))
    return items


async def fetch_filtered_tmdb_search_pages(
    *,
    base_url: str,
    headers: Dict[str, str],
    media_type: str,
    query: str,
    page: int,
    with_genres: Optional[str] = None,
    without_genres: Optional[str] = None,
    with_watch_providers: Optional[str] = None,
    with_status: Optional[str] = None,
    year: Optional[str] = None,
    sort_by: Optional[str] = None,
    db: Optional[Session] = None,
) -> Tuple[List[Dict[str, Any]], int, int]:
    """
    Executes TMDB /search/{tv|movie} and applies cross-filters (genres AND/OR/NOT,
    year, IT watch providers OR, and TV status OR). Scans 2 TMDB pages per virtual page
    for strong recall without duplicate items across infinite-scroll pages.
    Returns (filtered_raw_items, virtual_total_pages, approximate_total_results).
    """
    include_genres, genre_mode, exclude_genres = parse_genre_constraints(
        with_genres, without_genres
    )
    provider_ids = parse_int_set(with_watch_providers)
    tv_statuses = parse_tv_status_tokens(with_status) if media_type == "tv" else set()
    clean_year = year.strip() if year and year != "all" else None

    date_field = "first_air_date" if media_type == "tv" else "release_date"
    title_field = "name" if media_type == "tv" else "title"
    endpoint = f"{base_url}/search/{media_type}"

    pages_per_chunk = 2
    start_tmdb_page = (page - 1) * pages_per_chunk + 1
    target_tmdb_pages = [start_tmdb_page, start_tmdb_page + 1]

    async with httpx.AsyncClient(timeout=15.0) as client:
        first_resp = await client.get(
            endpoint,
            headers=headers,
            params={
                "query": query,
                "include_adult": "false",
                "language": "it-IT",
                "page": str(target_tmdb_pages[0]),
            },
        )
        if first_resp.status_code != 200:
            return [], 0, 0

        first_data = first_resp.json()
        raw_total_pages = int(first_data.get("total_pages") or 0)
        raw_items: List[Dict[str, Any]] = list(first_data.get("results") or [])

        if target_tmdb_pages[1] <= raw_total_pages:
            second_resp = await client.get(
                endpoint,
                headers=headers,
                params={
                    "query": query,
                    "include_adult": "false",
                    "language": "it-IT",
                    "page": str(target_tmdb_pages[1]),
                },
            )
            if second_resp.status_code == 200:
                raw_items.extend(second_resp.json().get("results") or [])

        seen_ids: Set[int] = set()
        candidates: List[Dict[str, Any]] = []
        for item in raw_items:
            iid = item.get("id")
            if not isinstance(iid, int) or iid in seen_ids:
                continue
            seen_ids.add(iid)
            if item_matches_genres_and_year(
                item, include_genres, genre_mode, exclude_genres, clean_year, date_field
            ):
                candidates.append(item)

        if provider_ids or tv_statuses:
            candidate_ids = [int(c["id"]) for c in candidates]
            cached_providers: Dict[int, Set[int]] = {}
            cached_statuses: Dict[int, str] = {}

            if db is not None and candidate_ids:
                if media_type == "tv":
                    rows = db.execute(
                        select(TMDBSeries).where(TMDBSeries.tmdb_id.in_(candidate_ids))
                    ).scalars().all()
                    for row in rows:
                        if row.watch_providers is not None:
                            cached_providers[row.tmdb_id] = {
                                int(wp["provider_id"])
                                for wp in (row.watch_providers or [])
                                if isinstance(wp, dict) and isinstance(wp.get("provider_id"), int)
                            }
                        if row.tmdb_status:
                            cached_statuses[row.tmdb_id] = row.tmdb_status
                else:
                    rows = db.execute(
                        select(TMDBMovie).where(TMDBMovie.tmdb_id.in_(candidate_ids))
                    ).scalars().all()
                    for row in rows:
                        if row.watch_providers is not None:
                            cached_providers[row.tmdb_id] = {
                                int(wp["provider_id"])
                                for wp in (row.watch_providers or [])
                                if isinstance(wp, dict) and isinstance(wp.get("provider_id"), int)
                            }

            sem = asyncio.Semaphore(8)

            async def check_candidate(item: Dict[str, Any]) -> bool:
                tid = int(item["id"])
                need_prov = bool(provider_ids) and tid not in cached_providers
                need_stat = bool(tv_statuses) and tid not in cached_statuses

                fetched_prov = cached_providers.get(tid)
                fetched_stat = cached_statuses.get(tid)
                fetched_type: Optional[str] = None

                if need_prov or need_stat:
                    async with sem:
                        if media_type == "tv" and need_stat:
                            detail_params: Dict[str, str] = {"language": "it-IT"}
                            if need_prov:
                                detail_params["append_to_response"] = "watch/providers"
                            resp = await client.get(
                                f"{base_url}/tv/{tid}",
                                headers=headers,
                                params=detail_params,
                            )
                            if resp.status_code == 200:
                                payload = resp.json()
                                fetched_stat = payload.get("status")
                                fetched_type = payload.get("type")
                                if need_prov:
                                    it_dict = (
                                        payload.get("watch/providers", {})
                                        .get("results", {})
                                        .get("IT", {})
                                    )
                                    fetched_prov = _extract_it_provider_ids_from_tmdb_dict(it_dict)
                        elif need_prov:
                            resp = await client.get(
                                f"{base_url}/{media_type}/{tid}/watch/providers",
                                headers=headers,
                            )
                            if resp.status_code == 200:
                                it_dict = resp.json().get("results", {}).get("IT", {})
                                fetched_prov = _extract_it_provider_ids_from_tmdb_dict(it_dict)

                if provider_ids:
                    if not fetched_prov or not (fetched_prov & provider_ids):
                        return False

                if tv_statuses:
                    stat_ok = bool(fetched_stat and fetched_stat in tv_statuses)
                    mini_ok = "Miniseries" in tv_statuses and (
                        fetched_type == "Miniseries" or fetched_stat == "Miniseries"
                    )
                    if not (stat_ok or mini_ok):
                        return False

                return True

            verdicts = await asyncio.gather(*(check_candidate(c) for c in candidates))
            candidates = [c for c, ok in zip(candidates, verdicts) if ok]

    candidates = sort_raw_tmdb_items(candidates, sort_by, title_field, date_field)
    virtual_total_pages = math.ceil(raw_total_pages / pages_per_chunk) if raw_total_pages > 0 else 0
    return candidates, virtual_total_pages, len(candidates)


async def execute_tmdb_discover_variants(
    *,
    url: str,
    headers: Dict[str, str],
    base_params: Dict[str, Any],
    year_raw: Optional[str],
    year_param_name: str,
    date_range_prefix: str,
    extra_variants: List[Dict[str, str]],
    tmdb_sort: str,
    title_field: str,
    date_field: str,
) -> Tuple[List[Dict[str, Any]], int, int]:
    years = parse_year_tokens(year_raw)
    filter_exact_years = False

    if not years:
        year_variants: List[Dict[str, str]] = [{}]
    elif len(years) <= 8:
        year_variants = [{year_param_name: y} for y in years]
    else:
        filter_exact_years = True
        min_y = min(years)
        max_y = max(years)
        year_variants = [
            {
                f"{date_range_prefix}.gte": f"{min_y}-01-01",
                f"{date_range_prefix}.lte": f"{max_y}-12-31",
            }
        ]

    status_variants = extra_variants if extra_variants else [{}]
    param_combinations: List[Dict[str, Any]] = [
        {**base_params, **yv, **sv}
        for yv in year_variants
        for sv in status_variants
    ]

    sem = asyncio.Semaphore(6)
    async with httpx.AsyncClient(timeout=15.0) as client:
        if len(param_combinations) == 1 and not filter_exact_years:
            resp = await client.get(url, headers=headers, params=param_combinations[0])
            if resp.status_code != 200:
                raise RuntimeError(f"TMDB discover status {resp.status_code}")
            payload = resp.json()
            return (
                list(payload.get("results") or []),
                int(payload.get("total_pages") or 0),
                int(payload.get("total_results") or 0),
            )

        async def _fetch_one(p: Dict[str, Any]) -> Optional[Dict[str, Any]]:
            async with sem:
                r = await client.get(url, headers=headers, params=p)
                return r.json() if r.status_code == 200 else None

        responses = await asyncio.gather(*(_fetch_one(p) for p in param_combinations))

    valid_payloads = [d for d in responses if isinstance(d, dict)]
    if not valid_payloads:
        raise RuntimeError("TMDB discover failed for all variants")

    merged_raw: List[Dict[str, Any]] = []
    seen: Set[int] = set()
    years_set = set(years)

    for data in valid_payloads:
        for item in data.get("results") or []:
            iid = item.get("id")
            if not isinstance(iid, int) or iid in seen:
                continue
            if filter_exact_years:
                raw_date = str(item.get(date_field) or "")
                if not any(raw_date.startswith(yr) for yr in years_set):
                    continue
            seen.add(iid)
            merged_raw.append(item)

    merged_raw = sort_raw_tmdb_items(merged_raw, tmdb_sort, title_field, date_field)
    max_pages = max(int(d.get("total_pages") or 0) for d in valid_payloads)
    total_res = sum(int(d.get("total_results") or 0) for d in valid_payloads)
    return merged_raw, max_pages, total_res
