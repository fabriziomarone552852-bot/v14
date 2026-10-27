import React, { useRef, useEffect } from 'react';
import type { MovieQuote } from '@/types/movies';
import { StarRating } from '@/components/trackers/SeriesDetailModal/StarRating';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { AddButton } from '@/components/shared/utils/AddButton';
import { TrashIcon } from '@/components/shared/utils/Icons';

interface MovieMainOverviewProps {
  tmdbValue: number | null;
  friendsAverage: number | null;
  myAverage: number | null;
  logsCount: number;
  quotes: MovieQuote[];
  editingQuoteId?: number | null;
  onOpenFriendsReviews: () => void;
  onOpenMyReviews: () => void;
  onOpenNewReview?: () => void;
  isAddingQuote: boolean;
  setIsAddingQuote: (b: boolean) => void;
  newQuoteText: string;
  setNewQuoteText: (s: string) => void;
  onSaveQuote: () => void;
  onDeleteQuote: (id: number) => void;
  onEditQuote: (quote: MovieQuote) => void;
  onCancelQuote: () => void;
  onOpenAddQuote: () => void;
}

export const MovieMainOverview: React.FC<MovieMainOverviewProps> = ({
  tmdbValue,
  friendsAverage,
  myAverage,
  logsCount,
  quotes,
  editingQuoteId,
  onOpenFriendsReviews,
  onOpenMyReviews,
  isAddingQuote,
  newQuoteText,
  setNewQuoteText,
  onSaveQuote,
  onDeleteQuote,
  onEditQuote,
  onCancelQuote,
  onOpenAddQuote,
}) => {
  const quoteInputContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAddingQuote) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        quoteInputContainerRef.current &&
        !quoteInputContainerRef.current.contains(event.target as Node)
      ) {
        if (!newQuoteText.trim()) {
          onCancelQuote();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddingQuote, newQuoteText, onCancelQuote]);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn h-full text-left">
      {/* VOTI GLOBALI A CONFRONTO (SENZA NUMERI) */}
      <div className="flex items-center justify-center gap-8 md:gap-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 shrink-0">
        {/* TMDB */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">TMDB</span>
          <div className="flex items-center">
            {tmdbValue !== null ? (
              <StarRating value={tmdbValue} hideNumber readonly iconClassName="w-6 h-6" />
            ) : (
              <span className="text-gray-400 font-medium">--</span>
            )}
          </div>
        </div>

        <div className="w-px h-12 bg-gray-200 shrink-0" />

        {/* AMICI */}
        <div
          onClick={onOpenFriendsReviews}
          className="flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors p-2 -m-2 group"
          title="Vedi le recensioni degli amici"
        >
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
            Amici
          </span>
          <div className="flex items-center">
            {friendsAverage !== null ? (
              <StarRating value={friendsAverage} hideNumber readonly iconClassName="w-6 h-6" />
            ) : (
              <span className="text-gray-400 font-medium">--</span>
            )}
          </div>
        </div>

        <div className="w-px h-12 bg-gray-200 shrink-0" />

        {/* IL TUO VOTO / DIARIO */}
        <div
          onClick={onOpenMyReviews}
          className="flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-xl transition-colors p-2 -m-2 group"
          title={`Media basata su ${logsCount} visioni registrate`}
        >
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
            Il Tuo Voto
          </span>
          <div className="flex items-center">
            {myAverage !== null ? (
              <StarRating value={myAverage} hideNumber readonly iconClassName="w-6 h-6" />
            ) : (
              <span className="text-gray-400 font-medium">--</span>
            )}
          </div>
        </div>
      </div>

      {/* CITAZIONI CELEBRI */}
      <div className="flex-1 flex flex-col min-h-0 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Citazioni
            {quotes.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {quotes.length}
              </span>
            )}
          </h2>

          <div className="w-44">
            <AddButton
              compact
              label="Aggiungi Citazione"
              onClick={onOpenAddQuote}
            />
          </div>
        </div>

        {/* Input Nuova / Modifica Citazione Espandibile */}
        {isAddingQuote && (
          <div
            ref={quoteInputContainerRef}
            className="pt-4 pb-2 flex flex-col gap-2 shrink-0 animate-fadeIn border-b border-gray-100 mb-2"
          >
            <input
              type="text"
              value={newQuoteText}
              onChange={(e) => setNewQuoteText(e.target.value)}
              onFocus={(e) =>
                e.currentTarget.setSelectionRange(
                  e.currentTarget.value.length,
                  e.currentTarget.value.length
                )
              }
              placeholder={
                editingQuoteId
                  ? 'Modifica la citazione...'
                  : 'Scrivi una citazione memorabile del film... (es. "Che la Forza sia con te")'
              }
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSaveQuote();
                } else if (e.key === 'Escape') {
                  onCancelQuote();
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancelQuote}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer shadow-xs transition-colors"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={onSaveQuote}
                disabled={!newQuoteText.trim()}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-40 cursor-pointer shadow-xs"
              >
                Salva
              </button>
            </div>
          </div>
        )}

        {/* Elenco Scrollabile Citazioni */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pt-4 pr-2">
          {quotes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center h-full py-8">
              <EmptyState message="Nessuna citazione salvata per questo film." />
            </div>
          ) : (
            quotes.map((q) => {
              const isBeingEdited = editingQuoteId === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => onEditQuote(q)}
                  className={`group relative bg-white border rounded-2xl p-4 flex items-start justify-between gap-3 shadow-xs transition-all cursor-pointer ${
                    isBeingEdited
                      ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/10'
                  }`}
                  title="Clicca per modificare la citazione"
                >
                  <p className="text-gray-800 italic font-medium leading-relaxed flex-1 select-none">
                    &ldquo;{q.quote_text}&rdquo;
                  </p>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditQuote(q);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
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
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteQuote(q.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      title="Elimina citazione"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
