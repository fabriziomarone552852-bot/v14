file_path_repo = r'c:\Users\Fabrizio\Desktop\app\smart\v14\backend\domains\trackers\repository.py'
with open(file_path_repo, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find get_friends_episode_logs and fix the dictionary mapping inside it
def replace_episode_status(match):
    return match.group(0).replace('"status": tracking.status,\n                ', '')

# We only want to remove "status": tracking.status inside get_friends_episode_logs
# Let's find the function
idx = content.find('def get_friends_episode_logs')
if idx != -1:
    before = content[:idx]
    after = content[idx:]
    after = after.replace('"status": tracking.status,\n                ', '')
    content = before + after

with open(file_path_repo, 'w', encoding='utf-8') as f:
    f.write(content)
print("Reverted episode log status mapping!")
