import re

file_path = 'frontend/src/views/Trackers/components/SeriesDetailModal/EpisodeDetailView.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<p className="text-gray-800 italic font-medium leading-relaxed">', 
    '<p className="text-gray-800 italic font-medium leading-relaxed break-all line-clamp-4">'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced successfully!")
