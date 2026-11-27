import React from 'react';
import { AddButton } from '@/components/shared/utils/AddButton';
import type { MediaList } from '@/types/trackers';
import { TrackerDetailSideDrawer } from './TrackerDetailSideDrawer';

export interface TrackerDetailListsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lists: MediaList[];
  onSelectList: (listId: number) => void;
  onOpenManager: () => void;
}

/**
 * Pannello laterale a comparsa (Drawer) che mostra l'elenco delle liste personalizzate
 * in cui è inserito il media corrente (DRY ed estrazione modulare).
 */
export const TrackerDetailListsDrawer: React.FC<TrackerDetailListsDrawerProps> = ({
  isOpen,
  onClose,
  lists,
  onSelectList,
  onOpenManager,
}) => {
  return (
    <TrackerDetailSideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Liste (${lists.length})`}
      closeTitle="Chiudi pannello liste"
      footer={
        <AddButton
          onClick={onOpenManager}
          label="Aggiungi ad una lista"
          className="w-full justify-center"
        />
      }
    >
      {lists.map((list) => (
        <div
          key={list.id}
          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-gray-100"
          onClick={() => onSelectList(list.id)}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 truncate text-sm">{list.name}</p>
          </div>
        </div>
      ))}
    </TrackerDetailSideDrawer>
  );
};
