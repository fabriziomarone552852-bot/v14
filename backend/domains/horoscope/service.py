"""
Service layer for self-hosted Italian daily horoscopes.
Fetches all 12 signs once and caches them in RAM indexed by local date (YYYY-MM-DD).
"""
import asyncio
import time
from datetime import datetime
from typing import Dict, Optional, Tuple
from zoneinfo import ZoneInfo
import httpx
from fastapi import HTTPException, status

from backend.domains.horoscope.parser import (
    ZODIAC_BY_SLUG,
    ZODIAC_SIGNS_META,
    parse_iodonna_html,
    parse_oggi_html,
)
from backend.domains.horoscope.schemas import (
    DailyHoroscopeCollectionResponse,
    HoroscopeSignEntry,
)

ROME_TZ = ZoneInfo("Europe/Rome")
CACHE_TTL_SECONDS = 6 * 3600  # Rinnovo ogni 6 ore o automatico al cambio data a mezzanotte

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8",
}

# In-memory cache: (date_str, fetched_epoch, DailyHoroscopeCollectionResponse)
_DAILY_CACHE: Optional[Tuple[str, float, DailyHoroscopeCollectionResponse]] = None
_FETCH_LOCK = asyncio.Lock()


def _current_rome_date_str() -> str:
    return datetime.now(ROME_TZ).strftime("%Y-%m-%d")


async def _fetch_single_sign(
    client: httpx.AsyncClient,
    sign_slug: str,
) -> Optional[HoroscopeSignEntry]:
    """Scarica e analizza un singolo segno da fonte primaria con fallback automatico."""
    primary_url = f"https://www.oggi.it/oroscopo/oroscopo-di-oggi/{sign_slug}/"
    try:
        resp = await client.get(primary_url)
        if resp.status_code == 200:
            parsed = parse_oggi_html(sign_slug, resp.text)
            if parsed:
                return parsed
    except Exception:
        pass

    fallback_url = f"https://www.iodonna.it/oroscopo/giorno/{sign_slug}/"
    try:
        resp = await client.get(fallback_url)
        if resp.status_code == 200:
            parsed = parse_iodonna_html(sign_slug, resp.text)
            if parsed:
                return parsed
    except Exception:
        pass

    return None


async def get_daily_horoscopes(force_refresh: bool = False) -> DailyHoroscopeCollectionResponse:
    """Restituisce l'oroscopo giornaliero di tutti i 12 segni con cache RAM giornaliera."""
    global _DAILY_CACHE
    today_str = _current_rome_date_str()
    now_ts = time.time()

    if (
        not force_refresh
        and _DAILY_CACHE is not None
        and _DAILY_CACHE[0] == today_str
        and (now_ts - _DAILY_CACHE[1]) < CACHE_TTL_SECONDS
        and len(_DAILY_CACHE[2].signs) >= 10
    ):
        return _DAILY_CACHE[2]

    async with _FETCH_LOCK:
        # Ricontrollo dopo aver acquisito il lock
        now_ts = time.time()
        if (
            not force_refresh
            and _DAILY_CACHE is not None
            and _DAILY_CACHE[0] == today_str
            and (now_ts - _DAILY_CACHE[1]) < CACHE_TTL_SECONDS
            and len(_DAILY_CACHE[2].signs) >= 10
        ):
            return _DAILY_CACHE[2]

        signs_map: Dict[str, HoroscopeSignEntry] = {}
        try:
            async with httpx.AsyncClient(
                headers=HEADERS,
                follow_redirects=True,
                timeout=12.0,
            ) as client:
                tasks = [
                    _fetch_single_sign(client, item["slug"])
                    for item in ZODIAC_SIGNS_META
                ]
                results = await asyncio.gather(*tasks, return_exceptions=True)
                for res in results:
                    if isinstance(res, HoroscopeSignEntry):
                        signs_map[res.sign] = res
        except Exception:
            pass

        if not signs_map:
            # Se la rete esterna è temporaneamente assente ma c'è una cache precedente, servila
            if _DAILY_CACHE is not None and _DAILY_CACHE[2].signs:
                return _DAILY_CACHE[2]
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Servizio oroscopo temporaneamente non raggiungibile.",
            )

        updated_iso = datetime.now(ROME_TZ).isoformat(timespec="seconds")
        collection = DailyHoroscopeCollectionResponse(
            date=today_str,
            updated_at=updated_iso,
            signs=signs_map,
        )
        _DAILY_CACHE = (today_str, time.time(), collection)
        return collection


async def get_sign_horoscope(sign_slug: str) -> HoroscopeSignEntry:
    """Restituisce l'oroscopo giornaliero di uno specifico segno zodiacale."""
    normalized = sign_slug.strip().lower()
    if normalized not in ZODIAC_BY_SLUG:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Segno zodiacale non valido: {sign_slug}",
        )

    collection = await get_daily_horoscopes()
    entry = collection.signs.get(normalized)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Oroscopo non disponibile oggi per il segno {normalized}.",
        )
    return entry
