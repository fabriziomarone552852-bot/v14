import React from 'react';
import type { UserMovieLog } from '@/types/movies';
import { StarRating } from '@/components/trackers/SeriesDetailModal/StarRating';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { AddButton } from '@/components/shared/utils/AddButton';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import { ReviewVisibilityIcon } from '@/components/trackers/SeriesDetailModal/shared/ReviewVisibilityBadge';
import { EditIcon, TrashIcon } from '@/components/shared/utils/Icons';

interface MovieMyReviewsListProps {
  logs: UserMovieLog[];
  onBack: () => void;
  onOpenNewReview: () => void;
  onOpenEditReview: (log: UserMovieLog) => void;
  onConfirmDelete: (logId: number) => void;
  onSelectReview: (log: UserMovieLog) => void;
  isDeleteDialogOpen: boolean;
  onExecuteDelete: () => void;
  onCancelDelete: () => void;
}

export const MovieMyReviewsList: React.FC<MovieMyReviewsListProps> = ({
  logs,
  onBack,
  onOpenNewReview,
  onOpenEditReview,
  onConfirmDelete,
  onSelectReview,
  isDeleteDialogOpen,
  onExecuteDelete,
  onCancelDelete,
}) => {
  const sortedLogs = [...logs].sort((a, b) => {
    const timeA = new Date(a.watched_at || a.updated_at || a.created_at || '').getTime();
    const timeB = new Date(b.watched_at || b.updated_at || b.created_at || '').getTime();
    return timeB - timeA;
  });

  return (
    <div className="flex flex-col h-full animate-fadeIn text-left">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors cursor-pointer"
            title="Torna indietro"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Le mie Recensioni
            {logs.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {logs.length}
              </span>
            )}
          </h2>
        </div>

        <div className="w-48">
          <AddButton label="Nuova Recensione" onClick={onOpenNewReview} />
        </div>
      </div>

      {/* Lista Recensioni */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-2">
        {sortedLogs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center h-full py-12">
            <EmptyState message="Nessuna recensione registrata per questo film." />
          </div>
        ) : (
          sortedLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => onSelectReview(log)}
              className="group bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 transition-shadow hover:shadow-sm cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center">
                    {typeof log.rating === 'number' && log.rating > 0 ? (
                      <StarRating value={log.rating / 2} hideNumber readonly iconClassName="w-5 h-5" />
                    ) : (
                      <span className="text-gray-400 text-sm font-medium">Nessun voto</span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                    {log.watched_at ? (
                      new Date(log.watched_at).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    ) : (
                      <span className="italic text-gray-400">Visto nel passato</span>
                    )}
                    <div
                      title={
                        log.review_visibility === 'private'
                          ? 'Personale (Solo io)'
                          : log.review_visibility === 'friends_only'
                          ? 'Amici'
                          : 'Pubblica'
                      }
                    >
                      <ReviewVisibilityIcon visibility={log.review_visibility || 'public'} className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {log.viewing_platform_name && (
                    <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-lg font-bold text-[11px] border border-slate-200 flex items-center gap-1 shadow-xs">
                      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {log.viewing_platform_name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEditReview(log);
                      }}
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1 cursor-pointer rounded-lg hover:bg-blue-50"
                      title="Modifica recensione"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfirmDelete(log.id);
                      }}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1 cursor-pointer rounded-lg hover:bg-red-50"
                      title="Elimina recensione"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Note / Testo */}
              {log.notes && (
                <div className="relative">
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {log.notes}
                  </p>
                </div>
              )}

              {/* Footer con commenti count */}
              {log.comments && log.comments.length > 0 && (
                <div className="pt-2 border-t border-gray-100 mt-1">
                  <span className="text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors">
                    {log.comments.length} {log.comments.length === 1 ? 'commento' : 'commenti'}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Elimina recensione"
        message="Vuoi davvero eliminare questa recensione? L'operazione non può essere annullata."
        confirmText="Elimina"
        onConfirm={onExecuteDelete}
        onCancel={onCancelDelete}
        isDestructive={true}
      />
    </div>
  );
};
