import asyncio
import os
import sys
from dotenv import load_dotenv
load_dotenv()

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.database import SessionLocal
from backend.domains.trackers.repository import get_tmdb_series, get_series_episodes_with_user_tracking
from backend.domains.trackers.service import sync_tmdb_series_lazy
from backend.domains.trackers.models import TMDBSeries

async def main():
    db = SessionLocal()
    print("Checking corrupted series...")
    corrupted = []
    for s in db.query(TMDBSeries).all():
        eps = get_series_episodes_with_user_tracking(db, s.tmdb_id, 1)
        if len(eps) == 0:
            print(f"Series {s.tmdb_id} has 0 episodes. Triggering re-sync...")
            corrupted.append(s.tmdb_id)
            
    for tmdb_id in corrupted:
        await sync_tmdb_series_lazy(db, tmdb_id)
        print(f"Resynced {tmdb_id}")
        
    db.close()
    print("Done!")
    
if __name__ == "__main__":
    asyncio.run(main())
