// src/components/trackers/SeriesDetailModal/shared/FriendDetailReviewsView.tsx
import React from 'react';
import { StarRating } from '../StarRating';
import { ReviewVisibilityIcon, type ReviewVisibilityType } from './ReviewVisibilityBadge';

export interface FriendReviewCardItem {
  id: number;
  rating?: number | null;
  dateStr?: string | null;
  notes?: string | null;
  review_visibility?: ReviewVisibilityType;
  commentsCount?: number;
}

export interface FriendDetailReviewsViewProps<T> {
  friendName: string;
  onBack: () => void;
  logs: T[];
  getCardData: (log: T) => FriendReviewCardItem;
  onSelectReview: (log: T) => void;
}

/**
 * Vista di dettaglio che elenca tutte le recensioni lasciate da uno specifico amico (DRY).
 * Condivisa tra SeriesReviewTab e EpisodeDetailView.
 */
export const FriendDetailReviewsView = <T,>({
  friendName,
  onBack,
  logs,
  getCardData,
  onSelectReview,
}: FriendDetailReviewsViewProps<T>): React.ReactElement => {
  return (
    <div className="flex flex-col h-full animate-fadeIn">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full transition-colors cursor-pointer"
            title="Torna alle recensioni amici"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900">I voti di {friendName}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pt-4 pr-2">
        {logs.map((log) => {
          const card = getCardData(log);
          const formattedDate = card.dateStr
            ? new Date(card.dateStr).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'Visto nel passato';

          return (
            <div
              key={card.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 transition-shadow hover:shadow-sm cursor-pointer"
              onClick={() => onSelectReview(log)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <StarRating value={(card.rating || 0) / 2} hideNumber readonly iconClassName="w-5 h-5" />
                  </div>
                  <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                    {formattedDate}
                    <div
                      title={
                        card.review_visibility === 'private'
                          ? 'Personale (Solo io)'
                          : card.review_visibility === 'friends_only'
                          ? 'Amici'
                          : 'Pubblica'
                      }
                    >
                      <ReviewVisibilityIcon
                        visibility={card.review_visibility || 'public'}
                        className="w-3.5 h-3.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-1">
                {card.review_visibility === 'private' ? (
                  <div className="text-sm italic text-gray-400">Recensione privata</div>
                ) : card.notes ? (
                  <div className="text-sm text-gray-700 line-clamp-3">{card.notes}</div>
                ) : null}
              </div>

              {card.commentsCount != null && card.commentsCount > 0 && (
                <div className="pt-2 border-t border-gray-100 mt-1 cursor-pointer">
                  <span className="text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors">
                    {card.commentsCount} {card.commentsCount === 1 ? 'commento' : 'commenti'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
