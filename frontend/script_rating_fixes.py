import re

# Fix EpisodeDetailView.tsx
with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\EpisodeDetailView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("rating: (log as any).rating || 0,", "rating: ((log as any).rating || 0) / 2,")

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\EpisodeDetailView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Fix SeriesReviewTab.tsx (it has several places where rating is used)
with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\SeriesReviewTab.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const sum = ratedLogs.reduce((acc, l) => acc + (l.rating || 0), 0);", "const sum = ratedLogs.reduce((acc, l) => acc + ((l.rating || 0) / 2), 0);")
content = content.replace("userMap[log.friend_id].push(log.rating);", "userMap[log.friend_id].push(log.rating / 2);")
content = content.replace("userMap[log.friend_id].ratings.push(log.rating);", "userMap[log.friend_id].ratings.push(log.rating / 2);")
content = content.replace("setRating(log.rating || 0);", "setRating((log.rating || 0) / 2);")
content = content.replace("rating: (log.rating || 0),", "rating: (log.rating || 0) / 2,")
content = content.replace("rating: (log as any).rating || 0,", "rating: ((log as any).rating || 0) / 2,")
content = content.replace("<StarRating value={log.rating || 0}", "<StarRating value={(log.rating || 0) / 2}")
content = content.replace("rating: userTracking.rating || 0,", "rating: (userTracking.rating || 0) / 2,")

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\SeriesReviewTab.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
