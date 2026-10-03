with open("backend/domains/trackers/schemas.py", "r", encoding="utf-8") as f:
    content = f.read()

import re

rewatch_stat_old = """class RewatchStat(BaseModel):
    title: str
    rewatch_count: int"""

rewatch_stat_new = """class RewatchStat(BaseModel):
    title: str
    rewatch_count: int
    rating: Optional[int] = None"""

guilty_pleasures_addition = """class GuiltyPleasureStat(BaseModel):
    title: str
    rewatch_count: int
    rating: int

class GeneralStats"""

content = content.replace(rewatch_stat_old, rewatch_stat_new)
if "class GuiltyPleasureStat" not in content:
    content = content.replace("class GeneralStats", guilty_pleasures_addition)

tv_full_stats_old = """    most_rewatched: List[RewatchStat]
    rewatch_comparison: RewatchComparison"""

tv_full_stats_new = """    most_rewatched: List[RewatchStat]
    rewatch_comparison: RewatchComparison
    guilty_pleasures: List[GuiltyPleasureStat] = Field(default_factory=list)"""

if "guilty_pleasures:" not in content:
    content = content.replace(tv_full_stats_old, tv_full_stats_new)

with open("backend/domains/trackers/schemas.py", "w", encoding="utf-8") as f:
    f.write(content)
