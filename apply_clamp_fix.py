import re

file_path = 'frontend/src/views/Trackers/TVSeriesPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'<p className=\{\`text-gray-600 italic text-sm font-medium relative flex-1 w-full overflow-y-auto custom-quote-scrollbar pr-2 break-words \$\{isQuoteExpanded \? \'\' : \'line-clamp-3 overflow-hidden\'\}\`\}>'
new_block = '''<p className={`text-gray-600 italic text-sm font-medium relative flex-1 w-full custom-quote-scrollbar pr-2 break-words ${isQuoteExpanded ? 'overflow-y-auto' : 'line-clamp-3 overflow-hidden'}`}>'''

if pattern in content:
    print("Found! (but regex needed for backticks?)")

content = re.sub(pattern, new_block, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced overflow-y-auto conflict!")
