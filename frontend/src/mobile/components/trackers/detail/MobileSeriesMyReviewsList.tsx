// src/mobile/components/trackers/detail/MobileSeriesMyReviewsList.tsx
import React, { useState, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { UserSeriesLog } from '@/types/trackers';
import { StarRating } from '@/components/trackers/SeriesDetailModal/StarRating';
import { AddButton } from '@/components/shared/utils/AddButton';
import { ReviewVisibilityIcon } from '@/components/trackers/SeriesDetailModal/shared/ReviewVisibilityBadge';
import { useConfirm } from '@/context/ConfirmContext';
import { EditIcon, TrashIcon } from '@/components/shared/utils/Icons';

export interface MobileSeriesMyReviewsListProps {
  logs: UserSeriesLog[];
  onBack: () => void;
  onOpenNewReview: () => void;
  onOpenEditReview: (log: UserSeriesLog) => void;
  onSelectReview: (log: UserSeriesLog) => void;
  onDeleteReview: (logId: number) => void;
  onDeleteReviews?: (logIds: number[]) => void;
}

export const MobileSeriesMyReviewsList: React.FC<MobileSeriesMyReviewsListProps> = ({
  logs,
  onBack,
  onOpenNewReview,
  onOpenEditReview,
  onSelectReview,
  onDeleteReview,
  onDeleteReviews,
}) => {
  const [selectedLogIds, setSelectedLogIds] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const { confirm } = useConfirm();

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime()
  );

  // Gestione Pressione Prolungata (Long-Press per selezione)
  const handleTouchStart = (logId: number) => {
    isLongPressRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setSelectedLogIds((prev) =>
        prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId]
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

  const handleCardClick = (log: UserSeriesLog) => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    // Se la modalità di selezione è attiva (almeno 1 elemento selezionato), il click semplice alterna la selezione
    if (selectedLogIds.length > 0) {
      setSelectedLogIds((prev) =>
        prev.includes(log.id) ? prev.filter((id) => id !== log.id) : [...prev, log.id]
      );
      return;
    }
    // Altrimenti apre la recensione in dettaglio
    onSelectReview(log);
  };

  // Azione Modifica (attiva solo per esattamente 1 elemento selezionato)
  const handleEditSelectedReview = () => {
    if (selectedLogIds.length !== 1) return;
    const target = logs.find((l) => l.id === selectedLogIds[0]);
    if (target) {
      onOpenEditReview(target);
      setSelectedLogIds([]);
    }
  };

  // Azione Elimina singola o multipla
  const handleDeleteSelectedReviews = () => {
    if (selectedLogIds.length === 0) return;
    const count = selectedLogIds.length;
    confirm({
      title: count === 1 ? 'Elimina recensione' : 'Elimina recensioni',
      message:
        count === 1
          ? 'Vuoi davvero eliminare questa recensione?'
          : `Vuoi davvero eliminare le ${count} recensioni selezionate?`,
      confirmText: 'Elimina',
      isDestructive: true,
      onConfirm: () => {
        if (onDeleteReviews) {
          onDeleteReviews(selectedLogIds);
        } else {
          selectedLogIds.forEach((id) => onDeleteReview(id));
        }
        setSelectedLogIds([]);
      },
    });
  };

  return (
    <div className="flex flex-col flex-1 min-h-[calc(100dvh-18.5rem)] justify-between select-none animate-fadeIn">
      {/* 1. SEZIONE SUPERIORE: INTESTAZIONE E LISTA RECENSIONI */}
      <div className="flex flex-col flex-1">
        {/* INTESTAZIONE */}
        <div className="flex items-center justify-between border-b border-gray-200/80 pb-3 pt-1 mb-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (selectedLogIds.length > 0) {
                  setSelectedLogIds([]);
                } else {
                  onBack();
                }
              }}
              className="p-1 -ml-1 text-gray-500 hover:text-gray-800 active:scale-90 transition-all cursor-pointer rounded-lg hover:bg-gray-100"
              title="Torna indietro"
              aria-label="Torna indietro"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2 truncate">
              <span>Le mie Recensioni</span>
              {selectedLogIds.length > 0 ? (
                <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {selectedLogIds.length} selezionat{selectedLogIds.length === 1 ? 'a' : 'e'}
                </span>
              ) : (
                logs.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {logs.length}
                  </span>
                )
              )}
            </h2>
          </div>

          {/* Tasti Modifica ed Elimina allineati a MobileTaskDetailModal */}
          {selectedLogIds.length > 0 && (
            <div className="flex items-center gap-1 shrink-0 animate-fadeIn">
              {/* Tasto Modifica: compare SOLO quando è selezionato esattamente 1 elemento */}
              {selectedLogIds.length === 1 && (
                <button
                  type="button"
                  title="Modifica"
                  onClick={handleEditSelectedReview}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                >
                  <EditIcon className="h-5 w-5" />
                </button>
              )}
              {/* Tasto Elimina: sempre presente per 1 o più elementi selezionati */}
              <button
                type="button"
                title={selectedLogIds.length === 1 ? 'Elimina' : 'Elimina recensioni'}
                onClick={handleDeleteSelectedReviews}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* LISTA RECENSIONI */}
        {sortedLogs.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {sortedLogs.map((log) => {
              const isSelected = selectedLogIds.includes(log.id);

              return (
                <div
                  key={log.id}
                  onTouchStart={() => handleTouchStart(log.id)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchMove}
                  onMouseDown={() => handleTouchStart(log.id)}
                  onMouseUp={handleTouchEnd}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSelectedLogIds((prev) =>
                      prev.includes(log.id) ? prev.filter((id) => id !== log.id) : [...prev, log.id]
                    );
                  }}
                  onClick={() => handleCardClick(log)}
                  className={`rounded-2xl p-3.5 shadow-2xs flex flex-col gap-2.5 transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'border-2 border-blue-400 bg-blue-50/20 ring-2 ring-blue-100'
                      : 'bg-white border border-gray-200/90 active:bg-gray-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Valutazione a stelline, data e visibilità */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center">
                        {log.rating ? (
                          <StarRating value={log.rating} hideNumber readonly iconClassName="w-4 h-4" />
                        ) : (
                          <span className="text-gray-400 text-xs font-semibold">Nessun voto</span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 font-semibold flex items-center gap-1.5 flex-wrap">
                        <span>
                          {new Date(log.watched_at).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <ReviewVisibilityIcon
                          visibility={log.review_visibility || 'public'}
                          className="w-3 h-3 text-gray-400"
                        />
                        {log.viewing_platform_name && (
                          <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded-md leading-none">
                            {log.viewing_platform_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Testo / Note della recensione */}
                  {log.notes && (
                    <p className="text-xs sm:text-sm text-gray-700 line-clamp-3 leading-relaxed break-words">
                      {log.notes}
                    </p>
                  )}

                  {/* Indicatore commenti */}
                  {log.comments && log.comments.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-blue-600 font-bold">
                      <span>
                        {log.comments.length} {log.comments.length === 1 ? 'commento' : 'commenti'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. SEZIONE INFERIORE: ADDBUTTON SUL MARGINE INFERIORE */}
      <div className="sticky bottom-0 bg-gray-50/95 backdrop-blur-xs pt-3 pb-1 mt-auto shrink-0 z-10">
        <AddButton
          label="Scrivi Recensione"
          onClick={onOpenNewReview}
          className="bg-white hover:bg-gray-50 text-xs shadow-2xs"
        />
      </div>
    </div>
  );
};

export default MobileSeriesMyReviewsList;
