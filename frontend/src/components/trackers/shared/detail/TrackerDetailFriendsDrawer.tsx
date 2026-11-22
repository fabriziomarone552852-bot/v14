import React from 'react';
import type { SeriesFriendDisplayItem } from '@/types/trackers';
import { getMediaStatusLabel, type MediaType } from '@/utils/mediaStatusTheme';
import { TrackerDetailSideDrawer } from './TrackerDetailSideDrawer';

export interface TrackerDetailFriendsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  friends: SeriesFriendDisplayItem[];
  getStatusBorderColor: (status: string) => string;
  mediaType?: MediaType;
}

/**
 * Pannello laterale a comparsa (Drawer) che mostra l'elenco completo degli amici
 * che stanno tracciando o hanno completato la serie TV o Film (DRY ed estrazione modulare).
 */
export const TrackerDetailFriendsDrawer: React.FC<TrackerDetailFriendsDrawerProps> = ({
  isOpen,
  onClose,
  friends,
  getStatusBorderColor,
  mediaType = 'series',
}) => {
  return (
    <TrackerDetailSideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Amici (${friends.length})`}
      closeTitle="Chiudi pannello amici"
    >
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
              {getMediaStatusLabel(f.status, undefined, mediaType)}
            </p>
          </div>
        </div>
      ))}
    </TrackerDetailSideDrawer>
  );
};
