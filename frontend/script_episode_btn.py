import re

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\EpisodeDetailView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_btn = r'''            <button
              onClick=\{\(\) => setView\('quotes'\)\}
              className="absolute bottom-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all shadow-sm z-10 opacity-0 group-hover:opacity-100"
              title="Citazioni"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth=\{2\} d="M8 12h\.01M12 12h\.01M16 12h\.01M21 12c0 4\.418-4\.03 8-9 8a9\.863 9\.863 0 01-4\.255-\.949L3 20l1\.395-3\.72C3\.512 15\.042 3 13\.574 3 12c0-4\.418 4\.03-8 9-8s9 3\.582 9 8z" /></svg>
            </button>'''

new_btn = '''            <button
              onClick={() => setView('quotes')}
              className={bsolute bottom-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all shadow-sm z-10 }
              title="Citazioni"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              {quotes.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow-sm"></span>
              )}
            </button>'''

content = re.sub(old_btn, new_btn, content, flags=re.MULTILINE)

with open(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\EpisodeDetailView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
