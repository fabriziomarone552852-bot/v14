from collections import defaultdict
import datetime
from datetime import timezone
import math

def get_full_stats(db: Session, current_user: User):
    from backend.domains.trackers.schemas import (
        TVFullStats, GenreStat, TimeTrendStat, TotalWatchTime,
        CompletionRate, WatchlistForecast, PlatformStat, ViewingHabits,
        GraveyardStat, SatisfactionStat, PersonalRecords,
        RatingDistribution, GenreRating, TopSeries, RewatchStat, RewatchComparison
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
            
    # --- Time Trend (Last 12 months) ---
    time_trend_map = defaultdict(int)
    for log in episode_logs:
        if log.watched_at:
            period = log.watched_at.strftime("%Y-%m")
            time_trend_map[period] += 1
            
    time_trend = []
    for period, count in sorted(time_trend_map.items()):
        time_trend.append(TimeTrendStat(
            period=period,
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
    to_watch = sum(1 for t in trackings if t.status in ("to_watch", "watching"))
    # simplistic: assume 10 episodes remaining per watching/to_watch series
    remaining_episodes = to_watch * 10 
    remaining_minutes = remaining_episodes * DEFAULT_RUNTIME
    
    # last 30 days episodes
    now = datetime.datetime.now(timezone.utc)
    recent_logs = [log for log in episode_logs if log.watched_at and (now - log.watched_at).days <= 30]
    daily_pace_minutes = (len(recent_logs) * DEFAULT_RUNTIME) / 30 if recent_logs else DEFAULT_RUNTIME
    
    estimated_days = remaining_minutes / daily_pace_minutes if daily_pace_minutes > 0 else 0
    estimated_date = (now + datetime.timedelta(days=estimated_days)).strftime("%Y-%m-%d") if estimated_days > 0 else None
    
    watchlist_forecast = WatchlistForecast(
        estimated_date=estimated_date,
        remaining_minutes=remaining_minutes,
        daily_pace=round(daily_pace_minutes, 1)
    )
    
    # --- Platform Distribution ---
    platform_counts = defaultdict(int)
    total_platforms = 0
    for t in trackings:
        s = series_map.get(t.series_tmdb_id)
        if s and s.networks:
            networks = [n.strip() for n in s.networks.split(",")]
            for n in networks:
                platform_counts[n] += 1
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
    by_day = defaultdict(int)
    by_time = {"Mattina (6-12)": 0, "Pomeriggio (12-18)": 0, "Sera (18-24)": 0, "Notte (0-6)": 0}
    
    weekdays = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
    for w in weekdays:
        by_day[w] = 0
        
    for log in episode_logs:
        if log.watched_at:
            wday = log.watched_at.weekday()
            by_day[weekdays[wday]] += 1
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
    series_logs = db.query(UserSeriesLog).filter(UserSeriesLog.user_id == current_user.id).all()
    satisfaction_index = []
    rating_counts = defaultdict(int)
    
    for r in range(1, 6):
        rating_counts[r] = 0
        
    genre_ratings = defaultdict(list)
    top_series_list = []
    
    for log in series_logs:
        s = series_map.get(log.series_tmdb_id)
        if not s: continue
        
        if log.rating:
            rating_counts[log.rating] += 1
            if s.genres:
                for g in [g.strip() for g in s.genres.split(",")]:
                    genre_ratings[g].append(log.rating)
                    
            satisfaction_index.append(SatisfactionStat(
                title=s.title,
                time_spent_hours=round((s.total_episodes or 0) * DEFAULT_RUNTIME / 60, 1),
                rating=log.rating
            ))
            
            top_series_list.append((s.title, log.rating, log.watched_at))
            
    ratings_distribution = [RatingDistribution(rating=r, count=c) for r, c in rating_counts.items()]
    
    ratings_by_genre = []
    for genre, ratings in genre_ratings.items():
        if len(ratings) > 0:
            ratings_by_genre.append(GenreRating(
                genre=genre,
                average_rating=round(sum(ratings) / len(ratings), 1)
            ))
            
    top_10 = sorted(top_series_list, key=lambda x: x[1], reverse=True)[:10]
    top_10_series = [TopSeries(title=t, rating=r) for t, r, _ in top_10]
    
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
    most_rewatched = []
    rewatch_comparison = RewatchComparison(first_watch_hours=hours, rewatch_hours=0.0)

    return TVFullStats(
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
        ratings_distribution=ratings_distribution,
        ratings_by_genre=ratings_by_genre,
        top_10_series=top_10_series,
        most_rewatched=most_rewatched,
        rewatch_comparison=rewatch_comparison
    )
