import re

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\EpisodeDetailView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "const { toggleEpisodeWatched, updateEpisodeNotes, addQuote } = useTrackersMutations();",
    "const { toggleEpisodeWatched, updateEpisodeNotes, addQuote, updateQuote, deleteQuote } = useTrackersMutations();"
)

old_submit = r'''                  if \(editingQuoteId\) \{
                      setEditingQuoteId\(null\);
                  \} else \{
                      addQuote\(\{ episode_id: episode\.id, quote_text: quoteText \}\);
                  \}'''

new_submit = '''                  if (editingQuoteId) {
                      updateQuote({ quote_id: editingQuoteId, payload: { quote_text: quoteText } });
                      setEditingQuoteId(null);
                  } else {
                      addQuote({ episode_id: episode.id, quote_text: quoteText });
                  }'''

content = re.sub(old_submit, new_submit, content, flags=re.MULTILINE)

old_delete = r'''onClick=\{\(\) => console\.log\('Delete quote not yet implemented', q\.id\)\}'''
new_delete = '''onClick={() => deleteQuote(q.id)}'''

content = re.sub(old_delete, new_delete, content, flags=re.MULTILINE)

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\EpisodeDetailView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
