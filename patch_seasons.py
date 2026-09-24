import re

with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\SeasonsTab.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    """      id: i,
      user_id: 1,
      episode_id: selectedEpisode.id,
      review_visibility: 'private',
      watched_at: new Date().toISOString()""",
    """      id: i,
      user_id: 1,
      episode_id: selectedEpisode.id,
      tmdb_id: selectedEpisode.id,
      season_number: selectedEpisode.season_number,
      episode_number: selectedEpisode.episode_number,
      review_visibility: 'private',
      watched_at: new Date().toISOString()"""
)

with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\SeasonsTab.tsx", "w", encoding="utf-8") as f:
    f.write(content)
