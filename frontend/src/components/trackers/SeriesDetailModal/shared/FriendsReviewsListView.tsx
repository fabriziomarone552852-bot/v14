// src/components/trackers/SeriesDetailModal/shared/FriendsReviewsListView.tsx
import React from 'react';
import { StarRating } from '../StarRating';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import type { AggregatedFriendReviewer } from '@/utils/ratingUtils';

export interface FriendsReviewsListViewProps {
  /** Elenco aggregato degli amici con voti medi */
  friendsList: AggregatedFriendReviewer[];
  /** Callback per tornare alla vista principale */
  onBack: () => void;
  /** Callback quando l'utente clicca su un amico */
  onSelectFriend: (friendId: string) => void;
  /** Titolo opzionale della schermata */
  title?: string;
  /** Messaggio mostrato quando non ci sono recensioni di amici */
  emptyMessage?: string;
}

/**
 * Vista riutilizzabile che mostra l'elenco riassuntivo delle recensioni degli amici (DRY).
 * Condivisa tra SeriesReviewTab e EpisodeDetailView.
 */
export const FriendsReviewsListView: React.FC<FriendsReviewsListViewProps> = ({
  friendsList,
  onBack,
  onSelectFriend,
  title = 'Recensioni Amici',
  emptyMessage = 'Nessun amico ha recensito questo elemento.',
}) => {
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
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {title}
            {friendsList.length > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {friendsList.length}
              </span>
            )}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pt-4 pr-2">
        {friendsList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center h-full">
            <EmptyState message={emptyMessage} />
          </div>
        ) : (
          friendsList.map((friend) => (
            <div
              key={friend.id}
              onClick={() => onSelectFriend(String(friend.id))}
              className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-shadow hover:shadow-md hover:border-blue-300 group"
            >
              <div className="flex items-center gap-4">
                <img
                  src={friend.avatar || '/default_avatar.png'}
                  alt={friend.name}
                  className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                />
                <span className="font-bold text-gray-900 text-base">{friend.name}</span>
              </div>
              <div className="flex items-center">
                {friend.average !== null ? (
                  <StarRating value={friend.average} hideNumber readonly iconClassName="w-5 h-5" />
                ) : (
                  <span className="text-gray-400 font-medium">--</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
