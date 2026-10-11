// src/components/trackers/SeriesDetailModal/SeriesDetailListsDrawer.tsx
import React from 'react';
import { AddButton } from '@/components/shared/utils/AddButton';
import type { MediaList } from '@/types/trackers';

export interface SeriesDetailListsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lists: MediaList[];
  onSelectList: (listId: number) => void;
  onOpenManager: () => void;
}

/**
 * Pannello laterale a comparsa (Drawer) che mostra l'elenco delle liste personalizzate
 * in cui è inserita la serie TV corrente (DRY ed estrazione modulare).
 */
export const SeriesDetailListsDrawer: React.FC<SeriesDetailListsDrawerProps> = ({
  isOpen,
  onClose,
  lists,
  onSelectList,
  onOpenManager,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-72 bg-white shadow-2xl z-50 flex flex-col animate-fadeIn border-l border-gray-100">
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-bold text-gray-900">Liste ({lists.length})</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 text-gray-500 rounded-full transition-colors cursor-pointer"
          title="Chiudi pannello liste"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {lists.map((list) => (
          <div
            key={list.id}
            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-gray-100"
            onClick={() => onSelectList(list.id)}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 truncate text-sm">{list.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <AddButton
          onClick={onOpenManager}
          label="Aggiungi ad una lista"
          className="w-full justify-center"
        />
      </div>
    </div>
  );
};
