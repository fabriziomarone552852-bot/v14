import re

with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\SeasonsTab.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(
    r"(episode_id: selectedEpisode\.id,\s+)review_visibility:",
    r"\1tmdb_id: selectedEpisode.id,\n      season_number: selectedEpisode.season_number,\n      episode_number: selectedEpisode.episode_number,\n      review_visibility:",
    content
)

with open(r"c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\SeasonsTab.tsx", "w", encoding="utf-8") as f:
    f.write(content)
