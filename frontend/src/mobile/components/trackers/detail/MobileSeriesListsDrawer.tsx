// src/mobile/components/trackers/detail/MobileSeriesListsDrawer.tsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { MediaList } from '@/types/trackers';
import { CloseIcon } from '@/components/shared/utils/Icons';
import { AddButton } from '@/components/shared/utils/AddButton';
import { useBackHandler } from '@/utils/backButtonManager';

export interface MobileSeriesListsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lists: MediaList[];
  onSelectList: (listId: number) => void;
  onOpenManager: () => void;
}

/**
 * Bottom drawer mobile per visualizzare le liste personalizzate in cui è presente la serie,
 * con tasto in calce in stile AddButton per aggiungere la serie ad una lista o crearne una nuova.
 */
export const MobileSeriesListsDrawer: React.FC<MobileSeriesListsDrawerProps> = ({
  isOpen,
  onClose,
  lists,
  onSelectList,
  onOpenManager,
}) => {
  useBackHandler(isOpen, onClose, 20);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[10050] flex flex-col justify-end">
      {/* 1. Backdrop oscurato con blur leggero */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Cassetto scorrevole dal basso (Slide Up) */}
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-gray-200 flex flex-col max-h-[82dvh] z-10 animate-slideUp select-none overflow-hidden">
        {/* Pull bar superiore */}
        <div className="pt-2.5 pb-1 flex justify-center bg-gray-50/95 shrink-0">
          <div className="w-12 h-1 bg-gray-300 rounded-full cursor-pointer" onClick={onClose} />
        </div>

        {/* Intestazione */}
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/95 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="font-extrabold text-gray-900 text-sm tracking-wide">
              Liste ({lists.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors cursor-pointer"
            title="Chiudi"
            aria-label="Chiudi liste"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Elenco Liste in cui è inserita la serie */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2.5 bg-gray-50/40 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {lists.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm font-medium">
              Questa serie non è ancora presente in nessuna lista.
            </div>
          ) : (
            lists.map((list) => (
              <div
                key={list.id}
                onClick={() => onSelectList(list.id)}
                className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 rounded-2xl border border-gray-100 shadow-2xs transition-colors cursor-pointer active:scale-[0.99]"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate text-sm">{list.name}</p>
                  <p className="text-xs text-gray-500 font-medium capitalize mt-0.5">
                    {list.visibility || 'privata'} • {list.items?.length || 0} elementi
                  </p>
                </div>
                <span className="text-gray-400 text-xs font-bold">›</span>
              </div>
            ))
          )}
        </div>

        {/* Tasto AddButton in calce per nuova lista / aggiunta */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/95 shrink-0 pb-[max(env(safe-area-inset-bottom,0px),16px)]">
          <AddButton
            onClick={onOpenManager}
            label="Aggiungi ad una lista"
            className="w-full justify-center shadow-xs"
          />
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileSeriesListsDrawer;
