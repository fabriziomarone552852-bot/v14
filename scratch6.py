import sys
import os

sys.path.append(os.path.abspath('c:\\Users\\Fabrizio\\Desktop\\app\\smart\\v14'))

import asyncio
from backend.domains.trackers.service import fetch_tmdb_series_details

async def test():
    # Let's search for the text "nessuna trama" in a known series or just print it
    pass
