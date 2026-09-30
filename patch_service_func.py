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

if "def _sync_series_status" not in content:
    # Inject after the imports, let's just find "from backend.domains.trackers import repository"
    content = content.replace("from backend.domains.trackers import repository", "from backend.domains.trackers import repository\n" + sync_function)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected function successfully!")
