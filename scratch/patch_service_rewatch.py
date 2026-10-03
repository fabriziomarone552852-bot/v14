import re

with open("backend/domains/trackers/service.py", "r", encoding="utf-8") as f:
    content = f.read()

rewatch_old = """    # --- Rewatch Stats ---
    most_rewatched = []
    rewatch_comparison = RewatchComparison(first_watch_hours=hours, rewatch_hours=0.0)"""

rewatch_new = """    # --- Rewatch Stats ---
    # We need to find episodes watched more than once, and series watched more than once.
    # Group episode logs by episode_id
    from collections import defaultdict
    ep_watch_counts = defaultdict(list)
    for log in episode_logs:
        ep_watch_counts[log.episode_id].append(log)
        
    episodes_cache = db.query(TMDBEpisode).filter(TMDBEpisode.id.in_(ep_watch_counts.keys())).all()
    ep_map = {e.id: e for e in episodes_cache}
    
    # Calculate most rewatched series (by episodes rewatched) or most rewatched episodes.
    # User asked for: "Una classifica assoluta degli episodi, delle stagioni o delle serie che hai guardato più volte"
    # We can aggregate by Series for simplicity, counting total extra views.
    series_rewatch_counts = defaultdict(int)
    total_rewatch_episodes = 0
    total_first_watch_episodes = 0
    
    # Also for guilty pleasures: series with low rating but high rewatches
    # Series rating is in series_logs. Let's build a map of user ratings for series.
    series_ratings_map = {log.series_tmdb_id: log.rating for log in series_logs if log.rating}
    
    for ep_id, logs in ep_watch_counts.items():
        count = len(logs)
        if count > 0:
            total_first_watch_episodes += 1
            if count > 1:
                total_rewatch_episodes += (count - 1)
                
        ep = ep_map.get(ep_id)
        if ep and count > 1:
            series_rewatch_counts[ep.series_tmdb_id] += (count - 1)
            
    most_rewatched = []
    guilty_pleasures = []
    
    for tmdb_id, rewatch_cnt in sorted(series_rewatch_counts.items(), key=lambda x: x[1], reverse=True):
        s = series_map.get(tmdb_id)
        if s:
            rating = series_ratings_map.get(tmdb_id)
            most_rewatched.append(RewatchStat(
                title=s.title,
                rewatch_count=rewatch_cnt,
                rating=rating
            ))
            if rating and rating <= 3:
                guilty_pleasures.append(GuiltyPleasureStat(
                    title=s.title,
                    rewatch_count=rewatch_cnt,
                    rating=rating
                ))
                
    most_rewatched = most_rewatched[:10]
    guilty_pleasures = guilty_pleasures[:5]
    
    rewatch_comparison = RewatchComparison(
        first_watch_hours=round(total_first_watch_episodes * DEFAULT_RUNTIME / 60, 1),
        rewatch_hours=round(total_rewatch_episodes * DEFAULT_RUNTIME / 60, 1)
    )"""

content = content.replace(rewatch_old, rewatch_new)

with open("backend/domains/trackers/service.py", "w", encoding="utf-8") as f:
    f.write(content)
