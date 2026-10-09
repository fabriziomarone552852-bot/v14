
from backend.core.database import SessionLocal
from backend.domains.trackers.service import list_user_series

db = SessionLocal()
from backend.domains.users.models import User
user = db.query(User).first()

series = list_user_series(db, user)
for s in series:
    if "Shameless" in s.title or "shameless" in s.title.lower():
        print(f"Shameless:")
        print(f"  rating_field: {s.status}")
        for l in s.logs:
            print(f"  log: {l.rating}")

