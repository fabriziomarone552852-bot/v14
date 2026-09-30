file_path = r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\service.py'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

sync_function = '''
def _sync_series_status(db: Session, user_id: int, tmdb_series_id: int):
    from backend.domains.trackers.models import TMDBEpisode, UserEpisodeLog, UserSeriesTracking, TMDBSeries
    import sqlalchemy
    
    tracking = db.execute(
        sqlalchemy.select(UserSeriesTracking)
        .where(UserSeriesTracking.user_id == user_id, UserSeriesTracking.series_tmdb_id == tmdb_series_id)
    ).scalar_one_or_none()
    
    if not tracking:
        return
        
    if tracking.status == "dropped":
        return

    total_eps_stmt = sqlalchemy.select(sqlalchemy.func.count(TMDBEpisode.id)).where(TMDBEpisode.series_tmdb_id == tmdb_series_id)
    total_eps = db.execute(total_eps_stmt).scalar() or 0

    watched_eps_stmt = sqlalchemy.select(sqlalchemy.func.count(sqlalchemy.func.distinct(UserEpisodeLog.episode_id)))\
        .join(TMDBEpisode, TMDBEpisode.id == UserEpisodeLog.episode_id)\
        .where(UserEpisodeLog.user_id == user_id, TMDBEpisode.series_tmdb_id == tmdb_series_id)
    watched_eps = db.execute(watched_eps_stmt).scalar() or 0

    if watched_eps == 0:
        tracking.status = "to_watch"
    elif watched_eps < total_eps:
        tracking.status = "watching"
    elif total_eps > 0 and watched_eps >= total_eps:
        tracking.status = "watched"
        
    db.commit()

'''

if "_sync_series_status" not in content:
    # insert it before track_episode
    content = content.replace("def track_episode", sync_function + "\ndef track_episode")

# Now inject the call in the tracking functions
import re

# 1. track_episode
if "_sync_series_status(db, current_user.id, next_ep.series_tmdb_id)" not in content:
    content = re.sub(
        r'(repository\.mark_episode_watched\(db, current_user\.id, next_ep\.id\))',
        r'\1\n    _sync_series_status(db, current_user.id, next_ep.series_tmdb_id)',
        content
    )

# 2. toggle_episode_watched
if "_sync_series_status(db, current_user.id, tmdb_ep.series_tmdb_id)" not in content:
    content = re.sub(
        r'(repository\.mark_episode_unwatched\(db, current_user\.id, episode_id\))',
        r'\1\n        \n    _sync_series_status(db, current_user.id, tmdb_ep.series_tmdb_id)',
        content
    )

# 3. mark_all_episodes_watched
if "_sync_series_status(db, current_user.id, tmdb_series_id)" not in content:
    content = re.sub(
        r'(repository\.mark_all_episodes_watched\(db, current_user\.id, tmdb_series_id\))',
        r'\1\n    _sync_series_status(db, current_user.id, tmdb_series_id)',
        content
    )

# 4. update_episode_log
if "tmdb_ep = db.execute(sqlalchemy.select(TMDBEpisode).where(TMDBEpisode.id == episode_id)).scalar_one_or_none()" not in content:
    content = re.sub(
        r'(latest_log\.notes = notes)',
        r'\1\n\n    tmdb_ep = db.execute(sqlalchemy.select(TMDBEpisode).where(TMDBEpisode.id == episode_id)).scalar_one_or_none()\n    if tmdb_ep:\n        _sync_series_status(db, current_user.id, tmdb_ep.series_tmdb_id)',
        content
    )

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected auto-sync logic successfully!")
