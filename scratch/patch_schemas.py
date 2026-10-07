import re
import datetime

with open("backend/domains/trackers/schemas.py", "r", encoding="utf-8") as f:
    schemas_content = f.read()

# Add to schemas.py
schemas_patch = """
class GeneralStats(BaseModel):
    episodes_last_month: int
    episodes_last_year: int
    series_completed_last_month: int
    series_completed_last_year: int
    series_watching_last_month: int
    series_watching_last_year: int
    series_to_watch_last_month: int
    series_to_watch_last_year: int
    series_dropped_last_month: int
    series_dropped_last_year: int
"""

if "class GeneralStats(BaseModel):" not in schemas_content:
    schemas_content = schemas_content.replace("class TVFullStats(BaseModel):", schemas_patch + "\nclass TVFullStats(BaseModel):")

schemas_content = schemas_content.replace(
    "ratings_distribution: List[RatingDistribution]",
    "series_ratings_distribution: List[RatingDistribution]\n    episode_ratings_distribution: List[RatingDistribution]\n    general_stats: GeneralStats"
)

with open("backend/domains/trackers/schemas.py", "w", encoding="utf-8") as f:
    f.write(schemas_content)
