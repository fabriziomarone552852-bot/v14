import re

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\service.py', 'r', encoding='utf-8') as f:
    content = f.read()

old = r'''    # Fetch logs to return
    from backend\.domains\.trackers\.models import UserEpisodeLog
    logs_stmt = sqlalchemy\.select\(UserEpisodeLog\)\.where\(UserEpisodeLog\.user_id == current_user\.id, UserEpisodeLog\.episode_id == episode_id\)\.order_by\(UserEpisodeLog\.watched_at\.desc\(\)\)
    user_logs = list\(db\.execute\(logs_stmt\)\.scalars\(\)\.all\(\)\)
        
    return _build_episode_response\(tmdb_ep, user_logs\)'''

new = '''    # Fetch logs and quotes to return
    from backend.domains.trackers.models import UserEpisodeLog, TVQuote
    logs_stmt = sqlalchemy.select(UserEpisodeLog).where(UserEpisodeLog.user_id == current_user.id, UserEpisodeLog.episode_id == episode_id).order_by(UserEpisodeLog.watched_at.desc())
    user_logs = list(db.execute(logs_stmt).scalars().all())
    
    quotes_stmt = sqlalchemy.select(TVQuote).where(TVQuote.user_id == current_user.id, TVQuote.episode_id == episode_id).order_by(TVQuote.created_at.desc())
    user_quotes = list(db.execute(quotes_stmt).scalars().all())
        
    return _build_episode_response(tmdb_ep, user_logs, user_quotes)'''

content = re.sub(old, new, content, flags=re.MULTILINE)

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\service.py', 'w', encoding='utf-8') as f:
    f.write(content)
