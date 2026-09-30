def update_review_detail(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    old_title = '''              <h2 className="text-xl font-bold text-gray-900">
                Recensione di {selectedReview.author_name}
              </h2>'''
    new_title = '''              <h2 className="text-xl font-bold text-gray-900">
                {selectedReview.is_mine ? 'La tua recensione' : Recensione di }
              </h2>'''
    content = content.replace(old_title, new_title)
    
    old_header = '''              <h2 className="text-xl font-bold text-gray-900">
                {selectedReview.is_mine ? 'La tua recensione' : Recensione di }
              </h2>
            </div>
          </div>'''
    
    new_header = '''              <h2 className="text-xl font-bold text-gray-900">
                {selectedReview.is_mine ? 'La tua recensione' : Recensione di }
              </h2>
            </div>
            {selectedReview.is_mine && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditLog(selectedReview.original_log)}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                  title="Modifica"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button
                  onClick={() => handleDeleteLog(selectedReview.original_log.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Elimina"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            )}
          </div>'''
    
    content = content.replace(old_header, new_header)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_review_detail(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\EpisodeDetailView.tsx')
update_review_detail(r'c:\Users\Fabrizio\Desktop\app\smart\v14\frontend\src\views\Trackers\components\SeriesDetailModal\SeriesReviewTab.tsx')

