import re
file_path = 'frontend/src/views/Trackers/TVSeriesPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix import
if 'useMyQuotes' not in content:
    content = content.replace(
        'useSeriesStats } from ''@/hooks/queries/useTrackersQueries'';',
        'useSeriesStats, useMyQuotes } from ''@/hooks/queries/useTrackersQueries'';'
    )

# Fix logic definition
if 'const dateHash =' not in content:
    content = re.sub(
        r'(const \{ data: statsData \} = useSeriesStats\(\);)',
        r'\1\n  const { data: myQuotes } = useMyQuotes();\n\n  const todayDateStr = new Date().toISOString().split(\'T\')[0];\n  const dateHash = todayDateStr.split(\'-\').reduce((acc, val) => acc + parseInt(val), 0);\n  const dailyQuote = myQuotes && myQuotes.length > 0 ? myQuotes[dateHash % myQuotes.length] : null;',
        content
    )

# Check if the EmptyState quote section is there
empty_state_block = '<EmptyState message="Ancora nessuna citazione salvata" />'
if '"{dailyQuote.quote_text}"' not in content:
    quote_ui = '''{dailyQuote ? (
                    <div className="flex flex-col items-center text-center max-w-full">
                      <p className="text-gray-700 italic font-medium mb-3 relative max-h-full overflow-y-auto custom-quote-scrollbar">
                        "{dailyQuote.quote_text}"
                      </p>
                      <div className="mt-auto shrink-0">
                        <span className="text-sm font-bold text-blue-600">- {dailyQuote.series_name || "Serie TV"}</span>
                        {dailyQuote.episode_season && dailyQuote.episode_number && (
                          <span className="text-xs text-gray-400 ml-2">
                            (S{String(dailyQuote.episode_season).padStart(2, '0')}E{String(dailyQuote.episode_number).padStart(2, '0')})
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <EmptyState message="Ancora nessuna citazione salvata" />
                  )}'''
    content = content.replace(empty_state_block, quote_ui, 1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated TVSeriesPage.tsx")
