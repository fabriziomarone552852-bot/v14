import os
import re

file_path = "c:\\Users\\Fabrizio\\Desktop\\app\\smart\\v14\\backend\\domains\\trackers\\repository.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's fix get_friends_series_logs
old_func_series = """def get_friends_series_logs(db: Session, current_user_id: int, tmdb_id: int) -> List[dict]:
    friend_ids_q1 = select(Friendship.addressee_id).where(
        Friendship.requester_id == current_user_id, Friendship.status == 'accepted'
    )
    friend_ids_q2 = select(Friendship.requester_id).where(
        Friendship.addressee_id == current_user_id, Friendship.status == 'accepted'
    )
    
    stmt = (
        select(UserSeriesTracking, User)
        .join(User, User.id == UserSeriesTracking.user_id)
        .where(
            UserSeriesTracking.series_tmdb_id == tmdb_id,
            UserSeriesTracking.review_visibility != "private",
            UserSeriesTracking.user_id.in_(friend_ids_q1.union(friend_ids_q2))
        )
    )"""

new_func_series = """def get_friends_series_logs(db: Session, current_user_id: int, tmdb_id: int) -> List[dict]:
    from sqlalchemy import or_
    friendships = db.query(Friendship).filter(
        or_(
            Friendship.requester_id == current_user_id,
            Friendship.addressee_id == current_user_id
        ),
        Friendship.status == 'accepted'
    ).all()
    
    friend_ids = [
        f.addressee_id if f.requester_id == current_user_id else f.requester_id
        for f in friendships
    ]
    
    if not friend_ids:
        return []
    
    stmt = (
        select(UserSeriesTracking, User)
        .join(User, User.id == UserSeriesTracking.user_id)
        .where(
            UserSeriesTracking.series_tmdb_id == tmdb_id,
            UserSeriesTracking.review_visibility != "private",
            UserSeriesTracking.user_id.in_(friend_ids)
        )
    )"""

old_func_ep = """def get_friends_episode_logs(db: Session, current_user_id: int, episode_id: int) -> List[dict]:
    friend_ids_q1 = select(Friendship.addressee_id).where(
        Friendship.requester_id == current_user_id, Friendship.status == 'accepted'
    )
    friend_ids_q2 = select(Friendship.requester_id).where(
        Friendship.addressee_id == current_user_id, Friendship.status == 'accepted'
    )
    
    stmt = (
        select(UserEpisodeTracking, User)
        .join(User, User.id == UserEpisodeTracking.user_id)
        .where(
            UserEpisodeTracking.episode_id == episode_id,
            UserEpisodeTracking.review_visibility != "private",
            UserEpisodeTracking.user_id.in_(friend_ids_q1.union(friend_ids_q2))
        )
    )"""

new_func_ep = """def get_friends_episode_logs(db: Session, current_user_id: int, episode_id: int) -> List[dict]:
    from sqlalchemy import or_
    friendships = db.query(Friendship).filter(
        or_(
            Friendship.requester_id == current_user_id,
            Friendship.addressee_id == current_user_id
        ),
        Friendship.status == 'accepted'
    ).all()
    
    friend_ids = [
        f.addressee_id if f.requester_id == current_user_id else f.requester_id
        for f in friendships
    ]
    
    if not friend_ids:
        return []
    
    stmt = (
        select(UserEpisodeTracking, User)
        .join(User, User.id == UserEpisodeTracking.user_id)
        .where(
            UserEpisodeTracking.episode_id == episode_id,
            UserEpisodeTracking.review_visibility != "private",
            UserEpisodeTracking.user_id.in_(friend_ids)
        )
    )"""

content = content.replace(old_func_series, new_func_series)
content = content.replace(old_func_ep, new_func_ep)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
