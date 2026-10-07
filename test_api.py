import sys
sys.path.append(".")
import httpx
from backend.core.database import SessionLocal
from backend.domains.users.models import User
from backend.core.deps import create_access_token
import json

db = SessionLocal()
try:
    user = db.query(User).first()
    token = create_access_token({"sub": str(user.id)})
finally:
    db.close()

res = requests.get("http://127.0.0.1:8000/api/v1/trackers/series", headers={"Authorization": f"Bearer {token}"})
try:
    data = res.json()
    for s in data:
        if s.get("tmdb_id") == 125988 or s.get("title") == "The Boys":
            print("FOUND THE BOYS!")
            for log in s.get("logs", []):
                print(f"LOG {log.get('id')}: keys={list(log.keys())}, viewing_platform_name={log.get('viewing_platform_name')}")
except Exception as e:
    print("Error:", e, res.text[:200])
