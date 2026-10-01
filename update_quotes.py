import re

file_path = 'frontend/src/views/Trackers/TVSeriesPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'import { useMySeries, useSeriesStats } from \'@/hooks/queries/useTrackersQueries\';',
    'import { useMySeries, useSeriesStats, useMyQuotes } from \'@/hooks/queries/useTrackersQueries\';'
)

hook_insertion = '''const { data: series, isLoading, isError } = useMySeries();
  const { data: statsData } = useSeriesStats();
  const { data: myQuotes } = useMyQuotes();

  const todayDateStr = new Date().toISOString().split('T')[0];
  const dateHash = todayDateStr.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const dailyQuote = myQuotes && myQuotes.length > 0 ? myQuotes[dateHash % myQuotes.length] : null;'''

content = content.replace(
    'const { data: series, isLoading, isError } = useMySeries();\\n  const { data: statsData } = useSeriesStats();',
    hook_insertion
)

# For the regex, let's just find the exact block.
block_to_replace = '''<div className="relative flex-1 min-h-0 custom-quote-scrollbar transition-all duration-500 overflow-hidden flex items-center justify-center">
                  <EmptyState message="Ancora nessuna citazione salvata" />
                </div>'''
                
quote_ui = '''<div className="relative flex-1 min-h-0 custom-quote-scrollbar transition-all duration-500 overflow-hidden flex items-center justify-center p-2">
                  {dailyQuote ? (
                    <div className="flex flex-col items-center text-center max-w-full">
                      <p className="text-gray-700 italic font-medium mb-3 relative max-h-full overflow-y-auto custom-quote-scrollbar">
                        "{dailyQuote.quote_text}"
                      </p>
                      <div className="mt-auto shrink-0">
                        <span className="text-sm font-bold text-blue-600">- {dailyQuote.series_name}</span>
                        {dailyQuote.episode_season && dailyQuote.episode_number && (
                          <span className="text-xs text-gray-400 ml-2">
                            (S{String(dailyQuote.episode_season).padStart(2, '0')}E{String(dailyQuote.episode_number).padStart(2, '0')})
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <EmptyState message="Ancora nessuna citazione salvata" />
                  )}
                </div>'''

content = content.replace(block_to_replace, quote_ui)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated!")
