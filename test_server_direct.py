import requests
import sys
import os
sys.path.append('c:\\Users\\Fabrizio\\Desktop\\app\\smart\\v14')

from backend.core.database import SessionLocal
from backend.domains.users.models import User
from backend.core.security import create_access_token
import datetime

db = SessionLocal()
signore = db.query(User).filter_by(username='signore').first()
if not signore:
    print("signore not found")
    sys.exit()

# create token
token = create_access_token(
    data={"sub": str(signore.id)},
    expires_delta=datetime.timedelta(minutes=15)
)

print("Testing with signore token...")
headers = {"Authorization": f"Bearer {token}"}
# Silo tmdb_id might be 1413? Or another one. Let's find Silo!
from backend.domains.trackers.models import TMDBSeries
silo = db.query(TMDBSeries).filter(TMDBSeries.name.ilike('%Silo%')).first()
if not silo:
    print("Silo not found in db!")
    # fallback test
    tmdb_id = 1413
else:
    tmdb_id = silo.tmdb_id
    print(f"Silo TMDB ID is {tmdb_id}")

resp = requests.get(f"http://127.0.0.1:8000/trackers/series/{tmdb_id}/friends-reviews", headers=headers)
print(f"Status: {resp.status_code}")
try:
    print(resp.json())
except:
    print(resp.text)
