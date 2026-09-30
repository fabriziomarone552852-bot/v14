import sys
import os
sys.path.append('c:\\Users\\Fabrizio\\Desktop\\app\\smart\\v14')

import asyncio
from backend.core.database import SessionLocal
from backend.domains.users.models import User
from backend.domains.social.models import Friendship
from backend.domains.trackers.models import UserSeriesTracking, TMDBSeries
from backend.domains.trackers.repository import get_friends_series_logs
from sqlalchemy import select

db = SessionLocal()
users = db.query(User).all()
admin = next((u for u in users if u.username == 'admin'), None)
if admin:
    print(f"Admin ID: {admin.id}")
    friend_ids_q1 = select(Friendship.addressee_id).where(
        Friendship.requester_id == admin.id, Friendship.status == 'accepted'
    )
    friend_ids_q2 = select(Friendship.requester_id).where(
        Friendship.addressee_id == admin.id, Friendship.status == 'accepted'
    )
    
    # Let's execute the union directly to see what it yields
    friends_stmt = friend_ids_q1.union(friend_ids_q2)
    friends = db.execute(friends_stmt).scalars().all()
    print("Admin's friends IDs:", friends)
    
    if friends:
        # Check what series these friends are tracking
        for friend_id in friends:
            tracking = db.query(UserSeriesTracking).filter_by(user_id=friend_id).all()
            for t in tracking:
                print(f"Friend {friend_id} tracks {t.series_tmdb_id} with visibility {t.review_visibility}")
                # test the function
                logs = get_friends_series_logs(db, admin.id, t.series_tmdb_id)
                print(f"Logs returned for {t.series_tmdb_id}:", logs)

