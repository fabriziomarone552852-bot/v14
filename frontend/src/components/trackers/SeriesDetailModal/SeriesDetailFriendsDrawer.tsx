// src/components/trackers/SeriesDetailModal/SeriesDetailFriendsDrawer.tsx
import React from 'react';
import type { SeriesFriendDisplayItem } from '@/types/trackers';
import { getMediaStatusLabel } from '@/utils/mediaStatusTheme';

export interface SeriesDetailFriendsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  friends: SeriesFriendDisplayItem[];
  getStatusBorderColor: (status: string) => string;
}

/**
 * Pannello laterale a comparsa (Drawer) che mostra l'elenco completo degli amici
 * che stanno tracciando o hanno completato la serie TV (DRY ed estrazione modulare).
 */
export const SeriesDetailFriendsDrawer: React.FC<SeriesDetailFriendsDrawerProps> = ({
  isOpen,
  onClose,
  friends,
  getStatusBorderColor,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-72 bg-white shadow-2xl z-50 flex flex-col animate-fadeIn border-l border-gray-100">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-bold text-gray-900">Amici ({friends.length})</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 text-gray-500 rounded-full transition-colors cursor-pointer"
          title="Chiudi pannello amici"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {friends.map((f) => (
          <div
            key={f.id}
            className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group/item"
          >
            <img
              src={f.avatar}
              alt={f.name}
              className={`w-10 h-10 rounded-full border-2 bg-gray-200 object-cover ${getStatusBorderColor(f.status)}`}
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 truncate text-sm group-hover/item:text-blue-600 transition-colors">
                {f.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {getMediaStatusLabel(f.status, undefined, 'series')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
