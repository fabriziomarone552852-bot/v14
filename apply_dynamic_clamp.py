import re

file_path = 'frontend/src/views/Trackers/TVSeriesPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<p className="text-gray-600 italic text-sm font-medium mb-1 relative flex-1 w-full overflow-y-auto custom-quote-scrollbar pr-2">.*?</p>'
new_block = '''<p className={`text-gray-600 italic text-sm font-medium relative flex-1 w-full overflow-y-auto custom-quote-scrollbar pr-2 break-words ${isQuoteExpanded ? '' : 'line-clamp-3 overflow-hidden'}`}>
                              "{dailyQuote.quote_text}"
                            </p>'''

content = re.sub(pattern, new_block, content, flags=re.DOTALL)

# Adjust the container to have less whitespace at the bottom
pattern2 = r'<div className="mt-auto shrink-0 w-full text-right transform translate-y-1">'
new_block2 = '<div className="mt-1 shrink-0 w-full text-right transform translate-y-2">'
content = content.replace(pattern2, new_block2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated quote box logic!")
