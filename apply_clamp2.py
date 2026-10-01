import re

file_path = 'frontend/src/views/Trackers/TVSeriesPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the paragraph className
pattern = r'<p className=\{\`text-gray-600 italic text-sm font-medium relative flex-1 w-full custom-quote-scrollbar pr-2 break-words \$\{isQuoteExpanded \? \'overflow-y-auto\' : \'line-clamp-3 overflow-hidden\'\}\`\}>'
new_block = '''<p className={`text-gray-600 italic text-sm font-medium relative w-full custom-quote-scrollbar pr-2 break-words ${isQuoteExpanded ? 'flex-1 overflow-y-auto' : 'line-clamp-2 overflow-hidden'}`}>'''
content = re.sub(pattern, new_block, content)

# Change signature back to mt-auto but keep translate-y-1 so it's lower
pattern2 = r'<div className="mt-1 shrink-0 w-full text-right transform translate-y-2">'
new_block2 = '<div className="mt-auto shrink-0 w-full text-right transform translate-y-1">'
content = content.replace(pattern2, new_block2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated to line-clamp-2 and flex-1 fixed!")
