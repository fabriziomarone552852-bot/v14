import re

file_path = r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\repository.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# For SERIES logs
def replacer_series(m):
    return m.group(0).replace('"friend_avatar": user.profile_picture_url,', '"friend_avatar": user.profile_picture_url,\n                "status": tracking.status,')

# Find def get_friends_series_logs
idx_series = content.find('def get_friends_series_logs')
idx_episode = content.find('def get_friends_episode_logs')

part1 = content[:idx_series]
part2 = content[idx_series:idx_episode]
part3 = content[idx_episode:]

part2 = part2.replace('"friend_avatar": user.profile_picture_url,', '"friend_avatar": user.profile_picture_url,\n                "status": tracking.status,')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(part1 + part2 + part3)
print("Added status to get_friends_series_logs!")
