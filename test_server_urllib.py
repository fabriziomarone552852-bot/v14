import urllib.request
import json
import sys
sys.path.append('c:\\Users\\Fabrizio\\Desktop\\app\\smart\\v14')

from backend.core.database import SessionLocal
from backend.domains.users.models import User
from backend.core.security import create_access_token
import datetime

db = SessionLocal()
signore = db.query(User).filter_by(username='signore').first()

token = create_access_token(
    data={"sub": str(signore.id)},
    expires_delta=datetime.timedelta(minutes=15)
)

from backend.domains.trackers.models import TMDBSeries
silo = db.query(TMDBSeries).filter(TMDBSeries.name.ilike('%Silo%')).first()
tmdb_id = silo.tmdb_id if silo else 1413

print(f"Testing signore token for series {tmdb_id}")
url = f"http://127.0.0.1:8000/trackers/series/{tmdb_id}/friends-reviews"
req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        data = json.loads(response.read().decode())
        print(data)
except Exception as e:
    print(f"Error: {e}")

