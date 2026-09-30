import re

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\repository.py', 'r', encoding='utf-8') as f:
    content = f.read()

old = r'''def get_series_episodes_with_user_tracking\(db: Session, tmdb_id: int, user_id: int\) -> List\[Tuple\[TMDBEpisode, List\[UserEpisodeLog\]\]\]:
    # Restituisce gli episodi globali.
    stmt_episodes = \(
        select\(TMDBEpisode\)
        \.where\(TMDBEpisode\.series_tmdb_id == tmdb_id\)
        \.order_by\(TMDBEpisode\.season_number\.asc\(\), TMDBEpisode\.episode_number\.asc\(\)\)
    \)
    episodes = db\.execute\(stmt_episodes\)\.scalars\(\)\.all\(\)
    
    # Restituisce tutti i log utente per gli episodi di questa serie.
    stmt_logs = \(
        select\(UserEpisodeLog\)
        \.join\(TMDBEpisode, TMDBEpisode\.id == UserEpisodeLog\.episode_id\)
        \.where\(TMDBEpisode\.series_tmdb_id == tmdb_id, UserEpisodeLog\.user_id == user_id\)
        \.order_by\(UserEpisodeLog\.watched_at\.desc\(\)\)
    \)
    logs = db\.execute\(stmt_logs\)\.scalars\(\)\.all\(\)
    
    # Raggruppa i log in memoria
    from collections import defaultdict
    logs_by_episode = defaultdict\(list\)
    for log in logs:
        logs_by_episode\[log\.episode_id\]\.append\(log\)
        
    return \[\(ep, logs_by_episode\.get\(ep\.id, \[\]\)\) for ep in episodes\]'''

new = '''def get_series_episodes_with_user_tracking(db: Session, tmdb_id: int, user_id: int) -> List[Tuple[TMDBEpisode, List[UserEpisodeLog], List["TVQuote"]]]:
    from backend.domains.trackers.models import TVQuote
    # Restituisce gli episodi globali.
    stmt_episodes = (
        select(TMDBEpisode)
        .where(TMDBEpisode.series_tmdb_id == tmdb_id)
        .order_by(TMDBEpisode.season_number.asc(), TMDBEpisode.episode_number.asc())
    )
    episodes = db.execute(stmt_episodes).scalars().all()
    
    # Restituisce tutti i log utente per gli episodi di questa serie.
    stmt_logs = (
        select(UserEpisodeLog)
        .join(TMDBEpisode, TMDBEpisode.id == UserEpisodeLog.episode_id)
        .where(TMDBEpisode.series_tmdb_id == tmdb_id, UserEpisodeLog.user_id == user_id)
        .order_by(UserEpisodeLog.watched_at.desc())
    )
    logs = db.execute(stmt_logs).scalars().all()
    
    # Restituisce tutti i quote utente per gli episodi di questa serie.
    stmt_quotes = (
        select(TVQuote)
        .join(TMDBEpisode, TMDBEpisode.id == TVQuote.episode_id)
        .where(TMDBEpisode.series_tmdb_id == tmdb_id, TVQuote.user_id == user_id)
        .order_by(TVQuote.created_at.desc())
    )
    quotes = db.execute(stmt_quotes).scalars().all()
    
    # Raggruppa i log in memoria
    from collections import defaultdict
    logs_by_episode = defaultdict(list)
    for log in logs:
        logs_by_episode[log.episode_id].append(log)
        
    quotes_by_episode = defaultdict(list)
    for quote in quotes:
        quotes_by_episode[quote.episode_id].append(quote)
        
    return [(ep, logs_by_episode.get(ep.id, []), quotes_by_episode.get(ep.id, [])) for ep in episodes]'''

content = re.sub(old, new, content, flags=re.MULTILINE)

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\repository.py', 'w', encoding='utf-8') as f:
    f.write(content)
