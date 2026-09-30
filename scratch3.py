import sys
import os

sys.path.append(os.path.abspath('c:\\Users\\Fabrizio\\Desktop\\app\\smart\\v14'))

from backend.core.database import SessionLocal
from backend.domains.trackers.models import TMDBSeries, TMDBEpisode

db = SessionLocal()
series = db.query(TMDBSeries).filter(TMDBSeries.tmdb_id == 66551).first() # From the user's log: 66551
if series:
    print(f"Series found: {series.title}, overview: {series.overview[:50] if series.overview else 'None'}")
    episodes = db.query(TMDBEpisode).filter(TMDBEpisode.series_tmdb_id == 66551).count()
    print(f"Episodes count: {episodes}")
else:
    print("Series not found")
db.close()
