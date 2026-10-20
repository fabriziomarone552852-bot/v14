// src/components/trackers/SeriesDetailModal/EpisodeMyReviewsList.tsx
import React from 'react';
import type { UserEpisodeLog } from '@/types/trackers';
import { StarRating } from './StarRating';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { AddButton } from '@/components/shared/utils/AddButton';
import { ReviewVisibilityIcon } from './shared/ReviewVisibilityBadge';
import { TrashIcon } from '@/components/shared/utils/Icons';
import { useConfirm } from '@/context/ConfirmContext';

interface EpisodeMyReviewsListProps {
  logs: UserEpisodeLog[];
  onBack: () => void;
  onOpenNewReview: () => void;
  onOpenEditReview: (log: UserEpisodeLog) => void;
  onSelectReview: (log: UserEpisodeLog) => void;
  onDeleteReview: (logId: number) => void;
}

export const EpisodeMyReviewsList: React.FC<EpisodeMyReviewsListProps> = ({
  logs,
  onBack,
  onOpenNewReview,
  onOpenEditReview,
  onSelectReview,
  onDeleteReview,
}) => {
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime()
  );

  return (
    <div className="flex flex-col h-full animate-fadeIn">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors cursor-pointer"
            title="Torna ai Dettagli Episodio"
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
          <AddButton label="Scrivi Recensione" onClick={onOpenNewReview} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-2">
        {sortedLogs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center -mt-8">
            <EmptyState message="Nessuna recensione registrata per questo episodio." />
          </div>
        ) : (
          sortedLogs.map((log) => (
            <EpisodeReviewRow
              key={log.id}
              log={log}
              onEdit={() => onOpenEditReview(log)}
              onDelete={() => onDeleteReview(log.id)}
              onSelectReview={() => onSelectReview(log)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const EpisodeReviewRow: React.FC<{
  log: UserEpisodeLog;
  onEdit: () => void;
  onDelete: () => void;
  onSelectReview: () => void;
}> = ({ log, onEdit, onDelete, onSelectReview }) => {
  const { confirm } = useConfirm();
  return (
    <div
      className="group bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 transition-shadow hover:shadow-sm cursor-pointer"
      onClick={onSelectReview}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            {log.rating ? (
              <StarRating value={log.rating / 2} hideNumber readonly iconClassName="w-5 h-5" />
            ) : (
              <span className="text-gray-400 text-sm font-medium">Nessun voto</span>
            )}
          </div>
          <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
            {new Date(log.watched_at).toLocaleDateString('it-IT', {
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
          {log.viewing_platform_name && (
            <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-lg font-bold text-[11px] border border-slate-200 flex items-center gap-1 shadow-sm">
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
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-gray-400 hover:text-blue-600 transition-colors p-1 cursor-pointer"
              title="Modifica recensione"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                confirm({
                  title: 'Elimina recensione',
                  message: 'Vuoi davvero eliminare questa recensione?',
                  confirmText: 'Elimina',
                  isDestructive: true,
                  onConfirm: onDelete,
                });
              }}
              className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
              title="Elimina recensione"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {log.notes && (
        <div className="relative">
          <div className="text-sm text-gray-700 line-clamp-3">{log.notes}</div>
        </div>
      )}

      {log.comments && log.comments.length > 0 && (
        <div className="pt-2 border-t border-gray-100 mt-1">
          <span className="text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors">
            {log.comments.length} {log.comments.length === 1 ? 'commento' : 'commenti'}
          </span>
        </div>
      )}
    </div>
  );
};
