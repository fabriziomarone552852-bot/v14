"""
Service for ComingSoon Cinema & Showtimes integration.
Provides real-time showtimes, movie listings, and theater data with 2h in-memory RAM caching.
"""

import html
import re
import time
from typing import Dict, List, Optional, Tuple, Any
import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from backend.domains.trackers.models import TMDBMovie
from backend.domains.trackers.cinema_schemas import (
    CinemaProvince,
    CinemaSummary,
    MovieInCinemaSummary,
    ProvinceCinemaData,
    CinemaRoomShowtime,
    MovieCinemaShowtimes,
    CinemaScheduleMovie,
    CinemaSchedule,
)

BASE_COMINGSOON_URL = "https://www.comingsoon.it/cinema"

# In-memory cache: {cache_key: (timestamp, data)}
_CACHE: Dict[str, Tuple[float, Any]] = {}
CACHE_TTL_SECONDS = 7200  # 2 ore

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
}

# Elenco completo delle province italiane supportate da ComingSoon
ITALIAN_PROVINCES: List[Dict[str, str]] = [
    {"name": "Agrigento", "slug": "agrigento", "region": "Sicilia"},
    {"name": "Alessandria", "slug": "alessandria", "region": "Piemonte"},
    {"name": "Ancona", "slug": "ancona", "region": "Marche"},
    {"name": "Aosta", "slug": "aosta", "region": "Valle d'Aosta"},
    {"name": "Arezzo", "slug": "arezzo", "region": "Toscana"},
    {"name": "Ascoli Piceno", "slug": "ascoli-piceno", "region": "Marche"},
    {"name": "Asti", "slug": "asti", "region": "Piemonte"},
    {"name": "Avellino", "slug": "avellino", "region": "Campania"},
    {"name": "Bari", "slug": "bari", "region": "Puglia"},
    {"name": "Barletta Andria Trani", "slug": "barletta-andria-trani", "region": "Puglia"},
    {"name": "Belluno", "slug": "belluno", "region": "Veneto"},
    {"name": "Benevento", "slug": "benevento", "region": "Campania"},
    {"name": "Bergamo", "slug": "bergamo", "region": "Lombardia"},
    {"name": "Biella", "slug": "biella", "region": "Piemonte"},
    {"name": "Bologna", "slug": "bologna", "region": "Emilia Romagna"},
    {"name": "Bolzano", "slug": "bolzano", "region": "Trentino Alto Adige"},
    {"name": "Brescia", "slug": "brescia", "region": "Lombardia"},
    {"name": "Brindisi", "slug": "brindisi", "region": "Puglia"},
    {"name": "Cagliari", "slug": "cagliari", "region": "Sardegna"},
    {"name": "Caltanissetta", "slug": "caltanissetta", "region": "Sicilia"},
    {"name": "Campobasso", "slug": "campobasso", "region": "Molise"},
    {"name": "Carbonia Iglesias", "slug": "carbonia-iglesias", "region": "Sardegna"},
    {"name": "Caserta", "slug": "caserta", "region": "Campania"},
    {"name": "Catania", "slug": "catania", "region": "Sicilia"},
    {"name": "Catanzaro", "slug": "catanzaro", "region": "Calabria"},
    {"name": "Chieti", "slug": "chieti", "region": "Abruzzo"},
    {"name": "Como", "slug": "como", "region": "Lombardia"},
    {"name": "Cosenza", "slug": "cosenza", "region": "Calabria"},
    {"name": "Cremona", "slug": "cremona", "region": "Lombardia"},
    {"name": "Crotone", "slug": "crotone", "region": "Calabria"},
    {"name": "Cuneo", "slug": "cuneo", "region": "Piemonte"},
    {"name": "Enna", "slug": "enna", "region": "Sicilia"},
    {"name": "Fermo", "slug": "fermo", "region": "Marche"},
    {"name": "Ferrara", "slug": "ferrara", "region": "Emilia Romagna"},
    {"name": "Firenze", "slug": "firenze", "region": "Toscana"},
    {"name": "Foggia", "slug": "foggia", "region": "Puglia"},
    {"name": "Forlì", "slug": "forli", "region": "Emilia Romagna"},
    {"name": "Frosinone", "slug": "frosinone", "region": "Lazio"},
    {"name": "Genova", "slug": "genova", "region": "Liguria"},
    {"name": "Gorizia", "slug": "gorizia", "region": "Friuli Venezia Giulia"},
    {"name": "Grosseto", "slug": "grosseto", "region": "Toscana"},
    {"name": "Imperia", "slug": "imperia", "region": "Liguria"},
    {"name": "Isernia", "slug": "isernia", "region": "Molise"},
    {"name": "L'Aquila", "slug": "l-aquila", "region": "Abruzzo"},
    {"name": "La Spezia", "slug": "la-spezia", "region": "Liguria"},
    {"name": "Latina", "slug": "latina", "region": "Lazio"},
    {"name": "Lecce", "slug": "lecce", "region": "Puglia"},
    {"name": "Lecco", "slug": "lecco", "region": "Lombardia"},
    {"name": "Livorno", "slug": "livorno", "region": "Toscana"},
    {"name": "Lodi", "slug": "lodi", "region": "Lombardia"},
    {"name": "Lucca", "slug": "lucca", "region": "Toscana"},
    {"name": "Macerata", "slug": "macerata", "region": "Marche"},
    {"name": "Mantova", "slug": "mantova", "region": "Lombardia"},
    {"name": "Massa Carrara", "slug": "massa-carrara", "region": "Toscana"},
    {"name": "Matera", "slug": "matera", "region": "Basilicata"},
    {"name": "Medio Campidano", "slug": "medio-campidano", "region": "Sardegna"},
    {"name": "Messina", "slug": "messina", "region": "Sicilia"},
    {"name": "Milano", "slug": "milano", "region": "Lombardia"},
    {"name": "Modena", "slug": "modena", "region": "Emilia Romagna"},
    {"name": "Monza Brianza", "slug": "monza-brianza", "region": "Lombardia"},
    {"name": "Napoli", "slug": "napoli", "region": "Campania"},
    {"name": "Novara", "slug": "novara", "region": "Piemonte"},
    {"name": "Nuoro", "slug": "nuoro", "region": "Sardegna"},
    {"name": "Ogliastra", "slug": "ogliastra", "region": "Sardegna"},
    {"name": "Olbia Tempio", "slug": "olbia-tempio", "region": "Sardegna"},
    {"name": "Oristano", "slug": "oristano", "region": "Sardegna"},
    {"name": "Padova", "slug": "padova", "region": "Veneto"},
    {"name": "Palermo", "slug": "palermo", "region": "Sicilia"},
    {"name": "Parma", "slug": "parma", "region": "Emilia Romagna"},
    {"name": "Pavia", "slug": "pavia", "region": "Lombardia"},
    {"name": "Perugia", "slug": "perugia", "region": "Umbria"},
    {"name": "Pesaro Urbino", "slug": "pesaro-urbino", "region": "Marche"},
    {"name": "Pescara", "slug": "pescara", "region": "Abruzzo"},
    {"name": "Piacenza", "slug": "piacenza", "region": "Emilia Romagna"},
    {"name": "Pisa", "slug": "pisa", "region": "Toscana"},
    {"name": "Pistoia", "slug": "pistoia", "region": "Toscana"},
    {"name": "Pordenone", "slug": "pordenone", "region": "Friuli Venezia Giulia"},
    {"name": "Potenza", "slug": "potenza", "region": "Basilicata"},
    {"name": "Prato", "slug": "prato", "region": "Toscana"},
    {"name": "Ragusa", "slug": "ragusa", "region": "Sicilia"},
    {"name": "Ravenna", "slug": "ravenna", "region": "Emilia Romagna"},
    {"name": "Reggio Calabria", "slug": "reggio-calabria", "region": "Calabria"},
    {"name": "Reggio Emilia", "slug": "reggio-emilia", "region": "Emilia Romagna"},
    {"name": "Rieti", "slug": "rieti", "region": "Lazio"},
    {"name": "Rimini", "slug": "rimini", "region": "Emilia Romagna"},
    {"name": "Roma", "slug": "roma", "region": "Lazio"},
    {"name": "Rovigo", "slug": "rovigo", "region": "Veneto"},
    {"name": "Salerno", "slug": "salerno", "region": "Campania"},
    {"name": "Sassari", "slug": "sassari", "region": "Sardegna"},
    {"name": "Savona", "slug": "savona", "region": "Liguria"},
    {"name": "Siena", "slug": "siena", "region": "Toscana"},
    {"name": "Siracusa", "slug": "siracusa", "region": "Sicilia"},
    {"name": "Sondrio", "slug": "sondrio", "region": "Lombardia"},
    {"name": "Taranto", "slug": "taranto", "region": "Puglia"},
    {"name": "Teramo", "slug": "teramo", "region": "Abruzzo"},
    {"name": "Terni", "slug": "terni", "region": "Umbria"},
    {"name": "Torino", "slug": "torino", "region": "Piemonte"},
    {"name": "Trapani", "slug": "trapani", "region": "Sicilia"},
    {"name": "Trento", "slug": "trento", "region": "Trentino Alto Adige"},
    {"name": "Treviso", "slug": "treviso", "region": "Veneto"},
    {"name": "Trieste", "slug": "trieste", "region": "Friuli Venezia Giulia"},
    {"name": "Udine", "slug": "udine", "region": "Friuli Venezia Giulia"},
    {"name": "Varese", "slug": "varese", "region": "Lombardia"},
    {"name": "Venezia", "slug": "venezia", "region": "Veneto"},
    {"name": "Verbano Cusio Ossola", "slug": "verbano-cusio-ossola", "region": "Piemonte"},
    {"name": "Vercelli", "slug": "vercelli", "region": "Piemonte"},
    {"name": "Verona", "slug": "verona", "region": "Veneto"},
    {"name": "Vibo Valentia", "slug": "vibo-valentia", "region": "Calabria"},
    {"name": "Vicenza", "slug": "vicenza", "region": "Veneto"},
    {"name": "Viterbo", "slug": "viterbo", "region": "Lazio"},
]


def get_provinces() -> List[CinemaProvince]:
    """Restituisce l'elenco ordinato delle province disponibili."""
    return [CinemaProvince(**p) for p in sorted(ITALIAN_PROVINCES, key=lambda x: x["name"])]


def _extract_times(raw_text: str) -> List[str]:
    """Estrae gli orari formattati (es. '17:25') da stringhe con prezzi o trattini."""
    if not raw_text:
        return []
    # Cerca pattern numerici di orario tipo 17.25, 17:25, 20.30, 20:30
    matches = re.findall(r"\b([0-2]?[0-9])[.:]([0-5][0-9])\b", raw_text)
    result = []
    for h, m in matches:
        formatted = f"{int(h):02d}:{m}"
        if formatted not in result:
            result.append(formatted)
    return result


def _find_tmdb_id_for_title(db: Optional[Session], title: str) -> Optional[int]:
    """Cerca se il titolo esiste già nel nostro catalogo tmdb_movies locale."""
    if not db or not title:
        return None
    try:
        clean = title.strip().lower()
        stmt = select(TMDBMovie.tmdb_id).where(func.lower(TMDBMovie.title) == clean).limit(1)
        res = db.execute(stmt).scalar_one_or_none()
        return res
    except Exception:
        return None


# ==========================================
# 📍 1. CINEMA E FILM PER PROVINCIA
# ==========================================

async def fetch_province_cinemas_and_movies(
    province_slug: str,
    db: Optional[Session] = None,
) -> ProvinceCinemaData:
    cache_key = f"province_{province_slug}"
    now = time.time()
    if cache_key in _CACHE:
        ts, cached_data = _CACHE[cache_key]
        if now - ts < CACHE_TTL_SECONDS:
            return cached_data

    # Trova nome provincia
    prov_entry = next((p for p in ITALIAN_PROVINCES if p["slug"] == province_slug), None)
    province_name = prov_entry["name"] if prov_entry else province_slug.capitalize()

    url = f"{BASE_COMINGSOON_URL}/{province_slug}/"
    async with httpx.AsyncClient(timeout=15.0, headers=HEADERS, follow_redirects=True) as client:
        response = await client.get(url)

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Impossibile recuperare i dati cinema per {province_name} (status {response.status_code})",
        )

    content = response.text

    # 1. Estrazione Cinema
    cinema_pattern = re.compile(
        r'<a\s+class="cs-btn\s+secondary\s+tag"\s+href=(?:")?/cinema/([a-z0-9-]+)/([a-z0-9-]+)/(\d+)/(?:")?\s+title="([^"]+)">([^<]+)</a>',
        re.IGNORECASE,
    )
    raw_cinemas = cinema_pattern.findall(content)

    cinemas: List[CinemaSummary] = []
    seen_cinema_ids = set()
    for prov, cin_slug, cin_id, title_attr, cin_name in raw_cinemas:
        if cin_id in seen_cinema_ids:
            continue
        seen_cinema_ids.add(cin_id)

        clean_name = html.unescape(cin_name.strip())
        # Cerca il comune dall'header precedente se presente
        cinemas.append(
            CinemaSummary(
                id=cin_id,
                name=clean_name,
                slug=cin_slug,
                city=province_name,
                province_slug=prov,
                url=f"/cinema/{prov}/{cin_slug}/{cin_id}/",
            )
        )

    # 2. Estrazione Film in programmazione
    movie_cards = re.split(
        r'<div class="header-scheda streaming min no-bg container-fluid pb[ml]">',
        content,
    )
    movies: List[MovieInCinemaSummary] = []
    seen_idfs = set()

    for block in movie_cards[1:]:
        idf_match = re.search(r'idf=(\d+)', block)
        if not idf_match:
            continue
        idf = idf_match.group(1)
        if idf in seen_idfs:
            continue
        seen_idfs.add(idf)

        title_match = re.search(
            r'class="tit_?olo h1">([^<]+)</a>',
            block,
            re.IGNORECASE,
        )
        orig_title_match = re.search(r"class='sottotitolo h3'>\s*\(\s*([^)]+)\s*\)", block)
        poster_match = re.search(r'<img src="([^"]+)" alt="([^"]+)"', block)
        genere_match = re.search(r"<b>Genere:</b>\s*<span>([^<]+)</span>", block)
        durata_match = re.search(r"<b>Durata:</b>\s*<span>([^<]+)</span>", block)
        uscita_match = re.search(r"<b>Uscita al cinema:</b>\s*<span>([^<]+)</span>", block)
        voto_match = re.search(r'data-rating="([^"]+)"', block)

        clean_title = html.unescape(title_match.group(1).strip()) if title_match else "Senza titolo"
        clean_orig = html.unescape(orig_title_match.group(1).strip()) if orig_title_match else None
        poster_url = poster_match.group(1) if poster_match else None
        if poster_url and poster_url.startswith("//"):
            poster_url = f"https:{poster_url}"

        tmdb_id = _find_tmdb_id_for_title(db, clean_title)

        movies.append(
            MovieInCinemaSummary(
                idf=idf,
                title=clean_title,
                original_title=clean_orig,
                poster=poster_url,
                genre=html.unescape(genere_match.group(1).strip()) if genere_match else None,
                duration=html.unescape(durata_match.group(1).strip()) if durata_match else None,
                release_date=html.unescape(uscita_match.group(1).strip()) if uscita_match else None,
                rating=voto_match.group(1) if voto_match else None,
                ticket_search_url=f"/cinema/{province_slug}/?idf={idf}",
                tmdb_id=tmdb_id,
            )
        )

    data = ProvinceCinemaData(
        province_name=province_name,
        province_slug=province_slug,
        movies=movies,
        cinemas=cinemas,
    )
    _CACHE[cache_key] = (now, data)
    return data


# ==========================================
# 🕒 2. SALE E ORARI PER UNO SPECIFICO FILM
# ==========================================

async def fetch_movie_showtimes(province_slug: str, idf: str) -> List[MovieCinemaShowtimes]:
    cache_key = f"showtimes_{province_slug}_{idf}"
    now = time.time()
    if cache_key in _CACHE:
        ts, cached_data = _CACHE[cache_key]
        if now - ts < CACHE_TTL_SECONDS:
            return cached_data

    url = f"{BASE_COMINGSOON_URL}/{province_slug}/?idf={idf}"
    async with httpx.AsyncClient(timeout=15.0, headers=HEADERS, follow_redirects=True) as client:
        response = await client.get(url)

    if response.status_code != 200:
        return []

    content = response.text
    cinema_boxes = content.split('<div class="cs-box col-xs-12 mbm">')
    results: List[MovieCinemaShowtimes] = []

    for box in cinema_boxes[1:]:
        cin_match = re.search(
            r'<a href="(/cinema/[^/]+/([a-z0-9-]+)/(\d+)/)"[^>]*><div class="h2 titolo">([^<]+)</div></a>',
            box,
        )
        addr_match = re.search(r'<p class="descrizione p-small">([^<]+)</p>', box)
        ticket_match = re.search(r'href="(/cinema/[^/]+/[^/]+/\d+/ticket/\?idf=\d+)"', box)

        rooms: List[CinemaRoomShowtime] = []
        meta_blocks = re.findall(
            r'<div class="meta mbm">(.*?)</div>\s*(?=<div class="meta mbm">|<a class="cs-btn|$)',
            box,
            re.DOTALL,
        )

        for meta in meta_blocks:
            sala_match = re.search(r'<b>(Sala[^<]+)</b>', meta)
            posti_match = re.search(r'<b>Posti</b>\s*([^<]+)', meta)
            orari_match = re.search(r'<b>Orari e prezzi:</b>\s*([^<]+)', meta)

            raw_orari = orari_match.group(1).strip() if orari_match else ""
            clean_times = _extract_times(raw_orari)

            rooms.append(
                CinemaRoomShowtime(
                    sala=sala_match.group(1).strip() if sala_match else "Sala standard",
                    posti=posti_match.group(1).strip() if posti_match else None,
                    orari_raw=raw_orari,
                    showtimes=clean_times,
                )
            )

        ticket_url = ticket_match.group(1) if ticket_match else None
        if ticket_url and not ticket_url.startswith("http"):
            ticket_url = f"https://www.comingsoon.it{ticket_url}"

        cin_url = cin_match.group(1) if cin_match else None
        cin_slug = cin_match.group(2) if cin_match else None
        cin_id = cin_match.group(3) if cin_match else None
        cin_name = html.unescape(cin_match.group(4).strip()) if cin_match else "Cinema"

        results.append(
            MovieCinemaShowtimes(
                cinema_id=cin_id,
                cinema_slug=cin_slug,
                cinema_name=cin_name,
                cinema_url=cin_url,
                address=html.unescape(addr_match.group(1).strip()) if addr_match else None,
                ticket_url=ticket_url,
                rooms=rooms,
            )
        )

    _CACHE[cache_key] = (now, results)
    return results


# ==========================================
# 🏛️ 3. PROGRAMMAZIONE DEL SINGOLO CINEMA
# ==========================================

async def fetch_cinema_schedule(
    province_slug: str,
    cinema_slug: str,
    cinema_id: str,
    db: Optional[Session] = None,
) -> CinemaSchedule:
    cache_key = f"cinema_{province_slug}_{cinema_slug}_{cinema_id}"
    now = time.time()
    if cache_key in _CACHE:
        ts, cached_data = _CACHE[cache_key]
        if now - ts < CACHE_TTL_SECONDS:
            return cached_data

    url = f"{BASE_COMINGSOON_URL}/{province_slug}/{cinema_slug}/{cinema_id}/"
    async with httpx.AsyncClient(timeout=15.0, headers=HEADERS, follow_redirects=True) as client:
        response = await client.get(url)

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Impossibile recuperare la programmazione del cinema (status {response.status_code})",
        )

    content = response.text

    # Informazioni Cinema
    info_p = re.search(r'<h1 class="h1">([^<]+)</h1>\s*<p>(.*?)</p>', content, re.DOTALL)
    cin_name = html.unescape(info_p.group(1).strip()) if info_p else cinema_slug.replace("-", " ").title()
    cin_body = info_p.group(2) if info_p else ""

    phone_match = re.search(r'telefono:\s*<span>([^<]+)</span>', cin_body)
    email_match = re.search(r'email:\s*<span>([^<]+)</span>', cin_body)
    addr_match = re.search(
        r'<span>([^<]+)</span>\s*-\s*<span>([^<]+)</span>,\s*<span>([^<]+)</span>',
        cin_body,
    )
    full_address = (
        f"{addr_match.group(1)} - {addr_match.group(2)} ({addr_match.group(3)})"
        if addr_match
        else None
    )

    # Film in sala oggi in questo cinema
    movie_blocks = re.split(
        r'<div class="header-scheda streaming min no-bg container-fluid pb[ml]">',
        content,
    )
    schedule_movies: List[CinemaScheduleMovie] = []

    for block in movie_blocks[1:]:
        idf_match = re.search(r'idf=(\d+)', block)
        title_match = re.search(r'class="tit_?olo h1">([^<]+)</a>', block, re.IGNORECASE)
        poster_match = re.search(r'<img src="([^"]+)" alt="([^"]+)"', block)
        genere_match = re.search(r"<b>Genere:</b>\s*<span>([^<]+)</span>", block)
        durata_match = re.search(r"<b>Durata:</b>\s*<span>([^<]+)</span>", block)
        ticket_match = re.search(r'href="(/cinema/[^/]+/[^/]+/\d+/ticket/\?idf=\d+)"', block)

        sala_match = re.search(
            r'<i class="fx"></i>\s*([^<]+)\s*</span>\s*<span><i class="fx clock"></i>\s*([^<]+)</span>',
            block,
        )

        clean_title = html.unescape(title_match.group(1).strip()) if title_match else "Senza titolo"
        poster_url = poster_match.group(1) if poster_match else None
        if poster_url and poster_url.startswith("//"):
            poster_url = f"https:{poster_url}"

        raw_orari = sala_match.group(2).strip() if sala_match else None
        clean_times = _extract_times(raw_orari or "")

        ticket_url = ticket_match.group(1) if ticket_match else None
        if ticket_url and not ticket_url.startswith("http"):
            ticket_url = f"https://www.comingsoon.it{ticket_url}"

        tmdb_id = _find_tmdb_id_for_title(db, clean_title)

        schedule_movies.append(
            CinemaScheduleMovie(
                idf=idf_match.group(1) if idf_match else None,
                title=clean_title,
                poster=poster_url,
                genre=html.unescape(genere_match.group(1).strip()) if genere_match else None,
                duration=html.unescape(durata_match.group(1).strip()) if durata_match else None,
                sala=sala_match.group(1).strip() if sala_match else None,
                orari=raw_orari,
                showtimes=clean_times,
                ticket_url=ticket_url,
                tmdb_id=tmdb_id,
            )
        )

    data = CinemaSchedule(
        cinema_id=cinema_id,
        cinema_slug=cinema_slug,
        cinema_name=cin_name,
        address=html.unescape(full_address) if full_address else None,
        phone=phone_match.group(1).strip() if phone_match else None,
        email=email_match.group(1).strip() if email_match else None,
        movies=schedule_movies,
    )
    _CACHE[cache_key] = (now, data)
    return data
