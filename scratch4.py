import sys
import os

sys.path.append(os.path.abspath('c:\\Users\\Fabrizio\\Desktop\\app\\smart\\v14'))

from backend.core.database import SessionLocal
from backend.domains.trackers.service import background_sync_tmdb_episodes
import asyncio

async def test():
    await background_sync_tmdb_episodes(1399, [{"season_number": 1}])
    print("Done")

asyncio.run(test())
