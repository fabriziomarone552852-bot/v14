import React, { useState } from 'react';
import type { SeriesQuote } from '@/types/trackers';
import { AddButton } from '@/components/shared/utils/AddButton';
import { EmptyState } from '@/components/shared/utils/EmptyState';

interface EpisodeQuotesSectionProps {
  quotes: SeriesQuote[];
  onBackToMain: () => void;
  onSaveQuote: (text: string, quoteId?: number | null) => void;
  onDeleteQuote: (quoteId: number) => void;
}

export const EpisodeQuotesSection: React.FC<EpisodeQuotesSectionProps> = ({
  quotes,
  onBackToMain,
  onSaveQuote,
  onDeleteQuote,
}) => {
  const [isFormView, setIsFormView] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<number | null>(null);
  const [quoteText, setQuoteText] = useState('');

  const openNewQuote = () => {
    setEditingQuoteId(null);
    setQuoteText('');
    setIsFormView(true);
  };

  const openEditQuote = (q: SeriesQuote) => {
    setEditingQuoteId(q.id);
    setQuoteText(q.quote_text);
    setIsFormView(true);
  };

  const handleSave = () => {
    if (quoteText.trim()) {
      onSaveQuote(quoteText.trim(), editingQuoteId);
    }
    setQuoteText('');
    setEditingQuoteId(null);
    setIsFormView(false);
  };

  if (isFormView) {
    return (
      <div className="flex flex-col h-full animate-fadeIn">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-4 shrink-0">
          <button
            onClick={() => {
              setQuoteText('');
              setEditingQuoteId(null);
              setIsFormView(false);
            }}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-gray-900">
            {editingQuoteId ? 'Modifica Citazione' : 'Nuova Citazione'}
          </h2>
        </div>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <textarea
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            className="w-full flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-0 focus:border-gray-300 outline-none resize-none text-base text-gray-800 transition-colors"
            placeholder="Scrivi qui la citazione memorabile dell'episodio..."
          />
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleSave}
            disabled={!quoteText.trim()}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors"
          >
            Salva Citazione
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fadeIn">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMain}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Citazioni dell&apos;Episodio
            {quotes.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {quotes.length}
              </span>
            )}
          </h2>
        </div>
        <div className="w-48">
          <AddButton label="Aggiungi Citazione" onClick={openNewQuote} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-2">
        {quotes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center -mt-8">
            <EmptyState message="Nessuna citazione inserita." />
          </div>
        ) : (
          quotes.map((q) => (
            <div
              key={q.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-2 relative group"
            >
              <p className="text-gray-800 italic font-medium leading-relaxed break-all line-clamp-4">
                &ldquo;{q.quote_text}&rdquo;
              </p>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditQuote(q)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  title="Modifica citazione"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteQuote(q.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Elimina"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
