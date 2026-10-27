import React from 'react';
import type { FriendMovieLog } from '@/types/movies';

interface MovieDetailFriendsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  friendsReviews: FriendMovieLog[];
  isLoading?: boolean;
}

export const MovieDetailFriendsDrawer: React.FC<MovieDetailFriendsDrawerProps> = ({
  isOpen,
  onClose,
  friendsReviews,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 flex flex-col animate-fadeIn border-l border-gray-100 text-left">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Amici ({friendsReviews.length})</h3>
          <p className="text-[11px] text-gray-500">Recensioni e valutazioni</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-200 text-gray-500 rounded-full transition-colors cursor-pointer"
          title="Chiudi"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {isLoading ? (
          <div className="text-center py-8 text-xs text-gray-400">Caricamento recensioni...</div>
        ) : friendsReviews.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-400">
            Nessun amico ha ancora recensito o valutato questo film.
          </div>
        ) : (
          friendsReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-3 bg-gray-50/70 rounded-xl border border-gray-100 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center overflow-hidden">
                    {rev.friend_avatar ? (
                      <img
                        src={rev.friend_avatar}
                        alt={rev.friend_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      rev.friend_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="font-bold text-xs text-gray-900">{rev.friend_name}</span>
                </div>

                {rev.rating && (
                  <span className="text-xs font-black text-amber-500">
                    {rev.rating} ⭐
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <span
                  className={`font-bold uppercase px-1.5 py-0.5 rounded ${
                    rev.status === 'watched' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {rev.status === 'watched' ? 'Guardato' : 'In lista'}
                </span>
                {rev.viewing_platform_name && <span>su {rev.viewing_platform_name}</span>}
                {rev.watched_at && (
                  <span>il {new Date(rev.watched_at).toLocaleDateString('it-IT')}</span>
                )}
              </div>

              {rev.notes && (
                <p className="text-xs text-gray-700 italic bg-white p-2 rounded-lg border border-gray-100">
                  "{rev.notes}"
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
