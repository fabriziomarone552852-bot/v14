import sys

# 1. Update backend schema
file_path = r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\schemas.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "    friend_avatar: Optional[str] = None\n    rating: Optional[int] = None",
    "    friend_avatar: Optional[str] = None\n    status: str\n    rating: Optional[int] = None"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update backend repository response logic
file_path_repo = r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\repository.py'
with open(file_path_repo, 'r', encoding='utf-8') as f:
    content_repo = f.read()

content_repo = content_repo.replace(
    '''            logs_data.append({
                "id": tracking.id,
                "friend_id": user.id,
                "friend_name": user.username,
                "friend_avatar": user.profile_picture_url,
                "rating": tracking.rating,''',
    '''            logs_data.append({
                "id": tracking.id,
                "friend_id": user.id,
                "friend_name": user.username,
                "friend_avatar": user.profile_picture_url,
                "status": tracking.status,
                "rating": tracking.rating,'''
)

with open(file_path_repo, 'w', encoding='utf-8') as f:
    f.write(content_repo)

print("Backend schema and repository patched!")
