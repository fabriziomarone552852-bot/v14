import re

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\service.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "response.episodes = [_build_episode_response(tmdb_ep, user_logs) for tmdb_ep, user_logs in episodes_data]",
    "response.episodes = [_build_episode_response(tmdb_ep, user_logs, quotes) for tmdb_ep, user_logs, quotes in episodes_data]"
)
content = content.replace(
    "for tmdb_ep, user_logs in episodes_data:",
    "for tmdb_ep, user_logs, quotes in episodes_data:"
)
content = content.replace(
    "response.next_episode_to_watch = _build_episode_response(tmdb_ep, user_logs)",
    "response.next_episode_to_watch = _build_episode_response(tmdb_ep, user_logs, quotes)"
)

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\service.py', 'w', encoding='utf-8') as f:
    f.write(content)
