import sys
import json
sys.path.append(".")
from backend.core.database import SessionLocal
from backend.domains.trackers.service import list_user_series
from backend.domains.users.models import User
import backend.main # Load models

db = SessionLocal()
try:
    user = db.query(User).first()
    res = list_user_series(db, user)
    # find The Boys or something
    for series in res:
        if series.tmdb_id == 125988 or "Netflix" in str(series.model_dump()):
            print(series.title)
            for log in series.logs:
                print("LOG", log.id, "PLATFORM", log.viewing_platform_name)
finally:
    db.close()
