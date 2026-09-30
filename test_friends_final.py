import sys
import os
sys.path.append('c:\\Users\\Fabrizio\\Desktop\\app\\smart\\v14')

from backend.core.database import SessionLocal
from backend.domains.users.models import User
from backend.domains.trackers.repository import get_friends_series_logs

db = SessionLocal()
users = db.query(User).all()
admin = next((u for u in users if u.username == 'admin'), None)
signore = next((u for u in users if u.username == 'signore'), None)

print(f"Admin ID: {admin.id if admin else None}")
print(f"Signore ID: {signore.id if signore else None}")

if admin:
    # silo has some id, maybe let's search user_series_tracking for signore
    from backend.domains.trackers.models import UserSeriesTracking
    tracks = db.query(UserSeriesTracking).filter_by(user_id=signore.id).all()
    for t in tracks:
        print(f"Signore tracks tmdb_id: {t.series_tmdb_id}, review_visibility: {t.review_visibility}")
        logs = get_friends_series_logs(db, admin.id, t.series_tmdb_id)
        print(f"Logs for admin on {t.series_tmdb_id}: {logs}")

