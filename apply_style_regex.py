import re

file_path = 'frontend/src/views/Trackers/TVSeriesPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'\{dailyQuote \? \(\s*<div className="flex flex-col items-center text-center max-w-full">.*?</div>\s*\)\s*:\s*\('
new_block = '''{dailyQuote ? (
                      <div className="flex flex-col items-start text-left w-full h-full">
                        <p className="text-gray-600 italic text-sm font-medium mb-2 relative flex-1 w-full overflow-y-auto custom-quote-scrollbar pr-2">
                          "{dailyQuote.quote_text}"
                        </p>
                        <div className="mt-auto shrink-0 w-full text-right pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            - {dailyQuote.series_title}
                            {dailyQuote.season_number && dailyQuote.episode_number && (
                               (SE)
                            )}
                          </span>
                        </div>
                      </div>
                    ) : ('''

content = re.sub(pattern, new_block, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Regex replaced!")
