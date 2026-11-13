"""
Statistiche, Analytics e Calendario Uscite per il modulo Tracker Film.
Estratto da movie_service.py per mantenere i moduli snelli e con responsabilità separate.
"""

from datetime import date, datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from backend.domains.trackers.movie_schemas import (
    UpcomingMovieResponse,
    MovieDashboardStats,
    MovieFullStats,
)
from backend.domains.trackers import movie_repository as repo
from backend.domains.users.models import User


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
        if l.tmdb_movie:
            if l.rating:
                film_rating_map.setdefault(l.tmdb_movie.title, []).append(l.rating)
            if l.tmdb_movie.genres:
                for g in l.tmdb_movie.genres.split(","):
                    g_clean = g.strip()
                    if g_clean:
                        genre_counts[g_clean] = genre_counts.get(g_clean, 0) + 1
                        if l.rating:
                            genre_ratings.setdefault(g_clean, []).append(l.rating)
        if l.viewing_platform:
            platform_counts[l.viewing_platform.name] = (
                platform_counts.get(l.viewing_platform.name, 0) + 1
            )

    top_10: List[Dict[str, Any]] = []
    for title, r_list in film_rating_map.items():
        avg_r = sum(r_list) / len(r_list)
        top_10.append({"title": title, "rating": round(avg_r, 1)})
    top_10.sort(key=lambda x: x["rating"], reverse=True)
    top_10 = top_10[:10]

    ratings_by_genre: List[Dict[str, Any]] = [
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
        {"platform": name, "percentage": round(count / total_platform_logs * 100, 1), "count": count}
        for name, count in sorted(platform_counts.items(), key=lambda x: x[1], reverse=True)
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
