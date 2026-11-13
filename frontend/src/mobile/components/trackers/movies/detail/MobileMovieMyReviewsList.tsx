// src/mobile/components/trackers/detail/MobileMovieMyReviewsList.tsx
import React, { useState, useRef } from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import type { UserMovieLog } from '@/types/movies';
import { StarRating } from '@/components/trackers/shared/detail/StarRating';
import { AddButton } from '@/components/shared/utils/AddButton';
import { ReviewVisibilityIcon } from '@/components/trackers/shared/detail/ReviewVisibilityBadge';
import { useConfirm } from '@/context/ConfirmContext';
import { EditIcon, TrashIcon } from '@/components/shared/utils/Icons';

export interface MobileMovieMyReviewsListProps {
  logs: UserMovieLog[];
  onBack: () => void;
  onOpenNewReview: () => void;
  onOpenEditReview: (log: UserMovieLog) => void;
  onSelectReview: (log: UserMovieLog) => void;
  onDeleteReview: (logId: number) => void;
  onDeleteReviews?: (logIds: number[]) => void;
}

export const MobileMovieMyReviewsList: React.FC<MobileMovieMyReviewsListProps> = ({
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

  const sortedLogs = [...logs].sort((a, b) => {
    const timeA = a.watched_at ? new Date(a.watched_at).getTime() : 0;
    const timeB = b.watched_at ? new Date(b.watched_at).getTime() : 0;
    return timeB - timeA;
  });

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

  const handleCardClick = (log: UserMovieLog) => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    if (selectedLogIds.length > 0) {
      setSelectedLogIds((prev) =>
        prev.includes(log.id) ? prev.filter((id) => id !== log.id) : [...prev, log.id]
      );
      return;
    }
    onSelectReview(log);
  };

  const handleEditSelectedReview = () => {
    if (selectedLogIds.length !== 1) return;
    const target = logs.find((l) => l.id === selectedLogIds[0]);
    if (target) {
      onOpenEditReview(target);
      setSelectedLogIds([]);
    }
  };

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

          {/* Tasti Modifica ed Elimina (se selezione attiva) ALTRIMENTI Tasto "Nuova Recensione" */}
          {selectedLogIds.length > 0 ? (
            <div className="flex items-center gap-1 shrink-0 animate-fadeIn">
              {selectedLogIds.length === 1 && (
                <button
                  type="button"
                  title="Modifica recensione"
                  onClick={handleEditSelectedReview}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                >
                  <EditIcon className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                title="Elimina recensioni"
                onClick={handleDeleteSelectedReviews}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <AddButton
              compact
              label="Nuova Recensione"
              onClick={onOpenNewReview}
              className="!w-auto !py-1 !px-2.5 !min-h-0 bg-white hover:bg-gray-50 shadow-2xs shrink-0 text-xs font-bold"
            />
          )}
        </div>

        {/* LISTA RECENSIONI SCROLLABILE */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-3">
          {sortedLogs.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center px-4">
              <p className="text-sm font-bold text-gray-700 mb-1">Nessuna recensione scritta</p>
              <p className="text-xs text-gray-400 max-w-xs">
                Non hai ancora registrato una recensione per questo film. Clicca su &quot;Nuova Recensione&quot; in alto per iniziare.
              </p>
            </div>
          ) : (
            sortedLogs.map((log) => {
              const isSelected = selectedLogIds.includes(log.id);
              const formattedDate = log.watched_at
                ? new Date(log.watched_at).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Visto nel passato';

              return (
                <div
                  key={log.id}
                  onClick={() => handleCardClick(log)}
                  onTouchStart={() => handleTouchStart(log.id)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchMove}
                  className={`bg-white border rounded-2xl p-3.5 shadow-2xs transition-all cursor-pointer relative flex flex-col gap-2 select-none ${
                    isSelected
                      ? 'border-2 border-blue-400 bg-blue-50/20 ring-2 ring-blue-100'
                      : 'border-gray-200/90 active:bg-gray-50/70'
                  }`}
                >
                  {/* Riga 1: Rating, Pallino, Data, eventuale Piattaforma | Destra: Privacy & Commenti */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      {log.rating ? (
                        <StarRating value={(log.rating || 0) / 2} readonly hideNumber iconClassName="w-4 h-4" />
                      ) : (
                        <span className="text-gray-400 text-xs font-semibold">Nessun voto</span>
                      )}
                      <span className="text-[11px] font-bold text-gray-400">•</span>
                      <span className="text-[11px] font-semibold text-gray-500">{formattedDate}</span>
                      {log.viewing_platform_name && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200/70">
                          {log.viewing_platform_name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {Boolean(log.comments?.length) && (
                        <span className="flex items-center gap-0.5 text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">
                          <MessageCircle className="w-3 h-3" />
                          {log.comments.length}
                        </span>
                      )}
                      <ReviewVisibilityIcon visibility={log.review_visibility} className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </div>

                  {/* Riga 2: Testo recensione (solo se presente, max 2 righe) */}
                  {log.notes && log.notes.trim() ? (
                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-2 break-words">
                      {log.notes}
                    </p>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMovieMyReviewsList;
