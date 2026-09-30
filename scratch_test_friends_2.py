import sys
sys.path.append('c:\\Users\\Fabrizio\\Desktop\\app\\smart\\v14')

from backend.core.database import SessionLocal
from backend.domains.users.models import User
from backend.domains.trackers.models import UserSeriesTracking, TMDBSeries, Friendship
from backend.domains.todo.models import Task
from backend.domains.trackers.repository import get_friends_series_logs

db = SessionLocal()
users = db.query(User).all()
admin = next((u for u in users if u.username == 'admin'), None)
signore = next((u for u in users if u.username == 'signore'), None)

print("Admin ID:", admin.id if admin else None)
print("Signore ID:", signore.id if signore else None)

# Check friendship
if admin and signore:
    fs = db.query(Friendship).filter(
        ((Friendship.requester_id == admin.id) & (Friendship.addressee_id == signore.id)) |
        ((Friendship.requester_id == signore.id) & (Friendship.addressee_id == admin.id))
    ).first()
    print("Friendship status:", fs.status if fs else "None")

    # Let's find common TMDB IDs
    admin_tracking = db.query(UserSeriesTracking).filter(UserSeriesTracking.user_id == admin.id).all()
    signore_tracking = db.query(UserSeriesTracking).filter(UserSeriesTracking.user_id == signore.id).all()
    
    admin_tmdb_ids = {t.series_tmdb_id for t in admin_tracking}
    signore_tmdb_ids = {t.series_tmdb_id for t in signore_tracking}
    common = admin_tmdb_ids.intersection(signore_tmdb_ids)
    print("Common TMDB IDs:", common)
    
    if common:
        tmdb_id = list(common)[0]
        # let's run get_friends_series_logs for admin
        logs = get_friends_series_logs(db, signore.id, tmdb_id)
        print(f"Logs for signore on series {tmdb_id}:", logs)

