// src/mobile/components/trackers/detail/MobileEpisodeQuotesSection.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Quote } from 'lucide-react';
import type { SeriesQuote } from '@/types/trackers';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { AddButton } from '@/components/shared/utils/AddButton';
import { useConfirm } from '@/context/ConfirmContext';
import { EditIcon, TrashIcon } from '@/components/shared/utils/Icons';

export interface MobileEpisodeQuotesSectionProps {
  quotes: SeriesQuote[];
  onBackToMain: () => void;
  onSaveQuote: (text: string, quoteId?: number | null) => void;
  onDeleteQuote: (quoteId: number) => void;
  onDeleteQuotes?: (quoteIds: number[]) => void;
}

export const MobileEpisodeQuotesSection: React.FC<MobileEpisodeQuotesSectionProps> = ({
  quotes,
  onBackToMain,
  onSaveQuote,
  onDeleteQuote,
  onDeleteQuotes,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<number | null>(null);
  const [quoteText, setQuoteText] = useState('');
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<number[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSavingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const { confirm } = useConfirm();

  useEffect(() => {
    if (isAdding && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAdding]);

  const handleSaveAndClose = () => {
    if (isSavingRef.current) return;
    const trimmed = quoteText.trim();
    if (trimmed) {
      isSavingRef.current = true;
      onSaveQuote(trimmed, editingQuoteId);
      setTimeout(() => {
        isSavingRef.current = false;
      }, 250);
    }
    setQuoteText('');
    setEditingQuoteId(null);
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveAndClose();
    }
  };

  const handleBlur = () => {
    handleSaveAndClose();
  };

  // Gestione Pressione Prolungata (Long-Press per selezione)
  const handleTouchStart = (quoteId: number) => {
    isLongPressRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setSelectedQuoteIds((prev) =>
        prev.includes(quoteId) ? prev.filter((id) => id !== quoteId) : [...prev, quoteId]
      );
    }, 400);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTouchMove = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleCardClick = (quoteId: number) => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    // Se la modalità di selezione è attiva (almeno 1 elemento selezionato), il click semplice alterna la selezione
    if (selectedQuoteIds.length > 0) {
      setSelectedQuoteIds((prev) =>
        prev.includes(quoteId) ? prev.filter((id) => id !== quoteId) : [...prev, quoteId]
      );
    }
    // Se non c'è selezione attiva, il semplice click NON seleziona (come richiesto)
  };

  // Azione Modifica (attiva solo quando c'è 1 solo elemento selezionato)
  const handleEditSelectedQuote = () => {
    if (selectedQuoteIds.length !== 1) return;
    const target = quotes.find((q) => q.id === selectedQuoteIds[0]);
    if (target) {
      setEditingQuoteId(target.id);
      setQuoteText(target.quote_text);
      setIsAdding(true);
      setSelectedQuoteIds([]);
    }
  };

  // Azione Elimina singola o multipla
  const handleDeleteSelectedQuotes = () => {
    if (selectedQuoteIds.length === 0) return;
    const count = selectedQuoteIds.length;
    confirm({
      title: count === 1 ? 'Elimina citazione' : 'Elimina citazioni',
      message:
        count === 1
          ? 'Vuoi davvero eliminare questa citazione?'
          : `Vuoi davvero eliminare le ${count} citazioni selezionate?`,
      confirmText: 'Elimina',
      isDestructive: true,
      onConfirm: () => {
        if (onDeleteQuotes) {
          onDeleteQuotes(selectedQuoteIds);
        } else {
          selectedQuoteIds.forEach((id) => onDeleteQuote(id));
        }
        setSelectedQuoteIds([]);
      },
    });
  };

  return (
    <div className="flex flex-col flex-1 min-h-[calc(100dvh-18.5rem)] justify-between select-none">
      {/* 1. SEZIONE SUPERIORE: INTESTAZIONE E LISTA O STATO VUOTO */}
      <div className="flex flex-col flex-1">
        {/* INTESTAZIONE */}
        <div className="flex items-center justify-between border-b border-gray-200/80 pb-3 pt-1 mb-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (selectedQuoteIds.length > 0) {
                  setSelectedQuoteIds([]);
                } else {
                  onBackToMain();
                }
              }}
              className="p-1 -ml-1 text-gray-500 hover:text-gray-800 active:scale-90 transition-all cursor-pointer rounded-lg hover:bg-gray-100"
              title="Torna all'episodio"
              aria-label="Torna all'episodio"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 truncate">
              <span>Citazioni dell&apos;Episodio</span>
              {selectedQuoteIds.length > 0 ? (
                <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {selectedQuoteIds.length} selezionat{selectedQuoteIds.length === 1 ? 'a' : 'e'}
                </span>
              ) : (
                quotes.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {quotes.length}
                  </span>
                )
              )}
            </h2>
          </div>

          {/* Tasti Modifica ed Elimina spostati in alto a destra nel margine dell'intestazione */}
          {selectedQuoteIds.length > 0 && (
            <div className="flex items-center gap-1 shrink-0 animate-fadeIn">
              {/* Tasto Modifica: compare SOLO quando è selezionato esattamente 1 elemento */}
              {selectedQuoteIds.length === 1 && (
                <button
                  type="button"
                  title="Modifica"
                  onClick={handleEditSelectedQuote}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                >
                  <EditIcon className="h-5 w-5" />
                </button>
              )}
              {/* Tasto Elimina: sempre presente per 1 o più elementi selezionati */}
              <button
                type="button"
                title={selectedQuoteIds.length === 1 ? 'Elimina' : 'Elimina citazioni'}
                onClick={handleDeleteSelectedQuotes}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* LISTA CITAZIONI O STATO VUOTO */}
        <div className="flex-1 flex flex-col gap-2.5">
          {quotes.length === 0 && !isAdding ? (
            <div className="flex-1 flex flex-col items-center justify-center my-auto py-12">
              <EmptyState
                message="Nessuna citazione inserita"
                icon={
                  <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-500 shadow-2xs">
                    <Quote className="w-6 h-6" />
                  </div>
                }
              />
            </div>
          ) : (
            quotes.map((q) => {
              const isSelected = selectedQuoteIds.includes(q.id);

              return (
                <div
                  key={q.id}
                  onTouchStart={() => handleTouchStart(q.id)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchMove}
                  onMouseDown={() => handleTouchStart(q.id)}
                  onMouseUp={handleTouchEnd}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSelectedQuoteIds((prev) =>
                      prev.includes(q.id) ? prev.filter((id) => id !== q.id) : [...prev, q.id]
                    );
                  }}
                  onClick={() => handleCardClick(q.id)}
                  className={`rounded-2xl p-3.5 shadow-2xs flex flex-col gap-2 relative transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'border-2 border-blue-400 bg-blue-50/20 ring-2 ring-blue-100'
                      : 'bg-white border border-gray-200/90 active:bg-gray-50/70'
                  }`}
                >
                  <p className="text-xs sm:text-sm text-gray-800 italic font-medium leading-relaxed break-words">
                    &ldquo;{q.quote_text}&rdquo;
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. SEZIONE INFERIORE: TEXTAREA SOPRA IL PULSANTE E ADDBUTTON SUL MARGINE INFERIORE */}
      <div className="sticky bottom-0 bg-gray-50/95 backdrop-blur-xs pt-3 pb-1 mt-auto shrink-0 z-10">
        {isAdding && (
          <div className="bg-white border-2 border-blue-400 rounded-2xl p-3 shadow-lg mb-2.5 animate-fadeIn">
            <textarea
              ref={textareaRef}
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              rows={3}
              placeholder="Scrivi qui la citazione..."
              className="w-full text-xs sm:text-sm text-gray-800 placeholder-gray-400 bg-transparent resize-none outline-none leading-relaxed"
            />
          </div>
        )}

        <AddButton
          label="Aggiungi Citazione"
          onClick={() => {
            setEditingQuoteId(null);
            setQuoteText('');
            setIsAdding(true);
          }}
          className="bg-white hover:bg-gray-50 text-xs shadow-2xs"
        />
      </div>
    </div>
  );
};

export default MobileEpisodeQuotesSection;
