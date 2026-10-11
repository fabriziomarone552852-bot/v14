// src/components/trackers/SeriesDetailModal/SeriesMyReviewsList.tsx
import React from 'react';
import type { UserSeriesLog } from '@/types/trackers';
import { StarRating } from './StarRating';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import { ReviewVisibilityIcon } from './shared/ReviewVisibilityBadge';

interface SeriesMyReviewsListProps {
  logs: UserSeriesLog[];
  onBack: () => void;
  onOpenNewReview: () => void;
  onOpenEditReview: (log: UserSeriesLog) => void;
  onConfirmDelete: (logId: number) => void;
  onSelectReview: (log: UserSeriesLog) => void;
  isDeleteDialogOpen: boolean;
  onExecuteDelete: () => void;
  onCancelDelete: () => void;
}

export const SeriesMyReviewsList: React.FC<SeriesMyReviewsListProps> = ({
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
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime()
  );

  return (
    <div className="flex flex-col h-full animate-fadeIn">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full transition-colors cursor-pointer"
            title="Torna indietro"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900">Le mie Recensioni</h2>
        </div>
        <button
          onClick={onOpenNewReview}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          Vota!
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pt-4 pr-2">
        {sortedLogs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center h-full">
            <EmptyState message="Nessuna recensione registrata." />
          </div>
        ) : (
          sortedLogs.map((log) => (
            <ReviewItem
              key={log.id}
              log={log}
              onEdit={() => onOpenEditReview(log)}
              onDelete={() => onConfirmDelete(log.id)}
              onSelectReview={() => onSelectReview(log)}
            />
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

const ReviewItem: React.FC<{
  log: UserSeriesLog;
  onEdit: () => void;
  onDelete: () => void;
  onSelectReview: () => void;
}> = ({ log, onEdit, onDelete, onSelectReview }) => {
  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 transition-shadow hover:shadow-sm">
      <div
        className="flex justify-between items-start cursor-pointer"
        onClick={onSelectReview}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {log.rating ? (
              <StarRating value={log.rating} hideNumber readonly iconClassName="w-5 h-5" />
            ) : (
              <span className="text-gray-400 text-sm font-medium">Nessun voto</span>
            )}
          </div>
          <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
            {new Date(log.updated_at || '').toLocaleDateString('it-IT', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
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
        </div>

        {/* Azioni visibili solo in hover (group-hover) */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1 cursor-pointer"
            title="Modifica recensione"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-gray-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
            title="Elimina recensione"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {log.notes && (
        <div className="relative">
          <div
            onClick={onSelectReview}
            className="text-sm text-gray-700 cursor-pointer line-clamp-2"
          >
            {log.notes}
          </div>
        </div>
      )}

      {log.comments && log.comments.length > 0 && (
        <div
          className="pt-2 border-t border-gray-100 mt-1 cursor-pointer"
          onClick={onSelectReview}
        >
          <span className="text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors">
            {log.comments.length} {log.comments.length === 1 ? 'commento' : 'commenti'}
          </span>
        </div>
      )}
    </div>
  );
};
