import re

file_path = 'frontend/src/views/Trackers/TVSeriesPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_block = '''{dailyQuote ? (
                      <div className="flex flex-col items-center text-center max-w-full">
                        <p className="text-gray-700 italic font-medium mb-3 relative max-h-full overflow-y-auto custom-quote-scrollbar">
                          "{dailyQuote.quote_text}"
                        </p>
                        <div className="mt-auto shrink-0">
                          <span className="text-sm font-bold text-blue-600">- {dailyQuote.series_title}</span>
                          {dailyQuote.season_number && dailyQuote.episode_number && (
                            <span className="text-xs text-gray-400 ml-2">
                              (S{String(dailyQuote.season_number).padStart(2, '0')}E{String(dailyQuote.episode_number).padStart(2, '0')})
                            </span>
                          )}
                        </div>
                      </div>'''

new_block = '''{dailyQuote ? (
                      <div className="flex flex-col items-start text-left w-full h-full">
                        <p className="text-gray-600 italic text-sm font-medium mb-2 relative flex-1 w-full overflow-y-auto custom-quote-scrollbar">
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
                      </div>'''

if old_block in content:
    content = content.replace(old_block, new_block)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced successfully!")
else:
    print("Block not found!")
