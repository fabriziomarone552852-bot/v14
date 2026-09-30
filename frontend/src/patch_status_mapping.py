file_path = r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\SeriesDetailModal.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find the SERIES_FRIENDS map
old_code = '''  const SERIES_FRIENDS = friendsReviews?.map(f => {
    let finalStatus = f.status || 'watching';
    if (finalStatus === 'to_watch') finalStatus = 'planned';
    if (finalStatus === 'watched') {
      const isEnded = tmdbSeries.status === 'Ended' || tmdbSeries.status === 'Canceled';
      finalStatus = isEnded ? 'completed' : 'waiting';
    }
    return {
      id: f.friend_id,
      name: f.friend_name,
      avatar: f.friend_avatar ? resolveImageUrl(f.friend_avatar) : '/default_avatar.png',
      status: finalStatus
    };
  }) || [];'''

new_code = '''  const SERIES_FRIENDS = friendsReviews?.map(f => {
    let finalStatus = f.status || 'watching';
    if (finalStatus === 'to_watch') finalStatus = 'planned';
    if (finalStatus === 'watched') {
      const isEnded = (tmdbSeries as any).tmdb_status === 'Ended' || (tmdbSeries as any).tmdb_status === 'Canceled';
      finalStatus = isEnded ? 'completed' : 'waiting';
    }
    return {
      id: f.friend_id,
      name: f.friend_name,
      avatar: f.friend_avatar ? resolveImageUrl(f.friend_avatar) : '/default_avatar.png',
      status: finalStatus
    };
  }) || [];'''

if old_code in content:
    content = content.replace(old_code, new_code)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched status mapping correctly!")
else:
    print("Could not find the old code!")
