import sys
import os
sys.path.append('c:\\Users\\Fabrizio\\Desktop\\app\\smart\\v14')

from backend.core.database import SessionLocal
from backend.domains.trackers.repository import get_friends_series_logs

db = SessionLocal()
# find a user
from backend.domains.users.models import User
users = db.query(User).all()
print("Users:", [(u.id, u.username) for u in users])

# test for admin
admin = next((u for u in users if u.username == 'admin'), None)
if admin:
    logs = get_friends_series_logs(db, admin.id, 1413) # try with some tmdb_id, or maybe we don't know silo id
    print("Logs for admin:", logs)
    
signore = next((u for u in users if u.username == 'signore'), None)
if signore:
    logs = get_friends_series_logs(db, signore.id, 1413)
    print("Logs for signore:", logs)

