
import sys
import os
sys.path.append(os.getcwd())

# Force import all models so SQLAlchemy resolution works
import backend.domains.users.models
import backend.domains.tasks.models
import backend.domains.trackers.models

from backend.core.database import SessionLocal
from backend.domains.trackers.service import list_user_series
from backend.domains.users.models import User

db = SessionLocal()
user = db.query(User).first()

series = list_user_series(db, user)
for s in series:
    if "Shameless" in s.title or "shameless" in s.title.lower():
        print(f"Shameless:")
        print(f"  status: {s.status}")
        print(f"  base rating: {s.rating if hasattr(s, 'rating') else 'N/A'}")
        print(f"  logs length: {len(s.logs)}")
        for l in s.logs:
            print(f"  log: {l.get('rating') if isinstance(l, dict) else l.rating}")

