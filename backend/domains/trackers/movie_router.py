"""
API router for the Movie Tracker domain.
Prefix: /trackers/movies
"""

from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.core.deps import get_db, get_current_app_user
from backend.domains.users.models import User
from backend.domains.trackers import movie_service as service
from backend.domains.trackers import movie_repository as repo
from backend.domains.trackers import cinema_service
from backend.domains.trackers.cinema_schemas import (
    CinemaProvince,
    ProvinceCinemaData,
    MovieCinemaShowtimes,
    CinemaSchedule,
)
from backend.domains.trackers.movie_schemas import (
    MovieCreate,
    MovieUpdate,
    MovieResponse,
    UserMovieLogCreate,
    UserMovieLogUpdate,
    MovieQuoteCreate,
    MovieQuoteUpdate,
    MovieQuoteResponse,
    FriendMovieLogResponse,
    TMDBPaginatedMovieSearch,
    UpcomingMovieResponse,
    MovieDashboardStats,
    MovieFullStats,
    MovieExtrasResponse,
)

router = APIRouter(prefix="/trackers/movies", tags=["Trackers - Movies"])


# --- Catalogo Personale ---

@router.get("", response_model=List[MovieResponse])
def get_my_movies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Restituisce tutti i film tracciati dall'utente (in lista e guardati)."""
    return service.list_user_movies(db, current_user)


@router.post("", response_model=MovieResponse, status_code=status.HTTP_201_CREATED)
async def add_movie(
    payload: MovieCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Aggiunge un film alla libreria dell'utente (in lista o visto)."""
    return await service.add_movie(db, current_user, payload)


# --- Ricerca TMDB, Discover & Cataloghi ---

@router.get("/search", response_model=TMDBPaginatedMovieSearch)
async def search_movies(
    query: str = Query(..., min_length=1, description="Termine di ricerca per il film"),
    page: int = Query(1, ge=1, description="Numero di pagina"),
    current_user: User = Depends(get_current_app_user),
):
    """Cerca film su TMDB in italiano."""
    return await service.search_tmdb_movies(query=query, page=page)


@router.get("/discover", response_model=TMDBPaginatedMovieSearch)
async def discover_movies(
    with_genres: Optional[str] = None,
    with_networks: Optional[str] = None,
    with_watch_providers: Optional[str] = None,
    first_air_date_year: Optional[str] = None,
    primary_release_year: Optional[str] = None,
    sort_by: Optional[str] = "popularity.desc",
    page: int = Query(1, ge=1),
    current_user: User = Depends(get_current_app_user),
):
    """Esplora film con filtri per genere, provider streaming e anno."""
    providers = with_watch_providers or with_networks
    year = primary_release_year or first_air_date_year
    return await service.discover_tmdb_movies(
        with_genres=with_genres,
        with_watch_providers=providers,
        primary_release_year=year,
        sort_by=sort_by,
        page=page,
    )


@router.get("/genres")
async def get_movie_genres(
    current_user: User = Depends(get_current_app_user),
):
    """Restituisce la lista ufficiale dei generi film TMDB."""
    return await service.get_tmdb_movie_genres()


@router.get("/providers")
async def get_movie_providers(
    current_user: User = Depends(get_current_app_user),
):
    """Restituisce i provider streaming attivi in Italia per i film."""
    return await service.get_tmdb_movie_providers()


# --- Prossime Uscite & Statistiche ---

@router.get("/upcoming", response_model=List[UpcomingMovieResponse])
def get_upcoming_movies(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """
    Restituisce le prossime uscite dei film in watchlist o nell'intervallo temporale specificato,
    mantenendo in evidenza per 14 giorni i film appena usciti al cinema/digitale.
    """
    return service.get_upcoming_movies(
        db, current_user, start_date=start_date, end_date=end_date
    )


@router.get("/stats", response_model=MovieDashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Restituisce le statistiche sintetiche per l'header."""
    return service.get_movie_dashboard_stats(db, current_user)


@router.get("/full-stats", response_model=MovieFullStats)
def get_full_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Restituisce le statistiche complete per il modale statistiche."""
    return service.get_movie_full_stats(db, current_user)


# --- Cinema & Orari Film in Sala (ComingSoon) ---

@router.get("/cinema/provinces", response_model=List[CinemaProvince])
def get_cinema_provinces(
    current_user: User = Depends(get_current_app_user),
):
    """Restituisce l'elenco delle province italiane supportate per i cinema."""
    return cinema_service.get_provinces()


@router.get("/cinema/province/{province_slug}", response_model=ProvinceCinemaData)
async def get_province_cinemas(
    province_slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Restituisce tutti i cinema e i film attualmente in sala per la provincia indicata."""
    return await cinema_service.fetch_province_cinemas_and_movies(province_slug=province_slug, db=db)


@router.get("/cinema/province/{province_slug}/movie/{idf}", response_model=List[MovieCinemaShowtimes])
async def get_movie_showtimes(
    province_slug: str,
    idf: str,
    current_user: User = Depends(get_current_app_user),
):
    """Restituisce le sale e gli orari di proiezione nei cinema della provincia per uno specifico film."""
    return await cinema_service.fetch_movie_showtimes(province_slug=province_slug, idf=idf)


@router.get("/cinema/province/{province_slug}/theater/{cinema_slug}/{cinema_id}", response_model=CinemaSchedule)
async def get_cinema_schedule(
    province_slug: str,
    cinema_slug: str,
    cinema_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Restituisce la programmazione odierna, i contatti e le sale di uno specifico cinema."""
    return await cinema_service.fetch_cinema_schedule(
        province_slug=province_slug,
        cinema_slug=cinema_slug,
        cinema_id=cinema_id,
        db=db,
    )


# --- Citazioni Film ---

@router.get("/quotes", response_model=List[MovieQuoteResponse])
def get_my_quotes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Restituisce tutte le citazioni film salvate dall'utente."""
    return service.get_user_quotes(db, current_user)


@router.post("/{tmdb_id}/quotes", response_model=MovieQuoteResponse)
def add_quote(
    tmdb_id: int,
    payload: MovieQuoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Aggiunge una citazione per un film."""
    return service.add_movie_quote(db, current_user, tmdb_id, payload)


@router.delete("/quotes/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Elimina una citazione film."""
    service.delete_movie_quote(db, current_user, quote_id)


@router.patch("/quotes/{quote_id}", response_model=MovieQuoteResponse)
@router.put("/quotes/{quote_id}", response_model=MovieQuoteResponse)
def update_quote(
    quote_id: int,
    payload: MovieQuoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Aggiorna una citazione film."""
    return service.update_movie_quote(db, current_user, quote_id, payload)


# --- Dettagli, Extras & Saghe ---

@router.get("/{tmdb_id}/extras", response_model=MovieExtrasResponse)
async def get_movie_extras(
    tmdb_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Restituisce cast, regista, raccomandazioni e la saga/collezione con tutti i film correlati."""
    return await service.get_tmdb_movie_extras(db, current_user.id, tmdb_id)


@router.get("/{tmdb_id}/friends-reviews", response_model=List[FriendMovieLogResponse])
def get_friends_reviews(
    tmdb_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Restituisce le recensioni e i voti degli amici per il film specificato."""
    return repo.get_friends_movie_logs(db, current_user.id, tmdb_id)


@router.get("/{tmdb_id}", response_model=MovieResponse)
async def get_movie_detail(
    tmdb_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Restituisce i dettagli e il tracking di un singolo film."""
    return await service.get_movie_detail(db, current_user, tmdb_id)


@router.patch("/{tmdb_id}", response_model=MovieResponse)
def update_movie(
    tmdb_id: int,
    payload: MovieUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Aggiorna lo stato, i poster personalizzati o il flag rewatching del film."""
    return service.update_movie(db, current_user, tmdb_id, payload)


@router.delete("/{tmdb_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_movie(
    tmdb_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Rimuove il film dalla libreria personale."""
    service.delete_movie(db, current_user, tmdb_id)


# --- Diario, Recensioni & Rewatch ---

@router.post("/{tmdb_id}/logs", response_model=MovieResponse)
def add_movie_log(
    tmdb_id: int,
    payload: UserMovieLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Registra una nuova visione o recensione per il film (imposta automaticamente stato su 'watched')."""
    return service.add_movie_log(db, current_user, tmdb_id, payload)


@router.patch("/logs/{log_id}", response_model=MovieResponse)
def update_movie_log(
    log_id: int,
    payload: UserMovieLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Modifica voto, note, piattaforma o data di una visione nel diario."""
    return service.update_movie_log(db, current_user, log_id, payload)


@router.delete("/logs/{log_id}", response_model=MovieResponse)
def delete_movie_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Elimina una visione/recensione dal diario."""
    return service.delete_movie_log(db, current_user, log_id)


@router.post("/{tmdb_id}/watched-all", response_model=MovieResponse)
def mark_movie_watched(
    tmdb_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_app_user),
):
    """Azione rapida per segnare il film come visto istantaneamente."""
    return service.add_movie_log(
        db, current_user, tmdb_id, UserMovieLogCreate(review_visibility="friends_only")
    )


@router.get("/{tmdb_id}/providers")
async def get_movie_single_providers(
    tmdb_id: int,
    current_user: User = Depends(get_current_app_user),
):
    """Restituisce le piattaforme streaming TMDB in Italia per uno specifico film."""
    return await service.fetch_tmdb_movie_providers(tmdb_id)
