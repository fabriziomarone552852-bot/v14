// src/mobile/components/trackers/detail/MobileSeriesFriendsDrawer.tsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { SeriesFriendDisplayItem } from '@/types/trackers';
import { CloseIcon } from '@/components/shared/utils/Icons';
import { getMediaStatusLabel } from '@/utils/mediaStatusTheme';
import { useBackHandler } from '@/utils/backButtonManager';

export interface MobileSeriesFriendsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  friends: SeriesFriendDisplayItem[];
  getStatusBorderColor: (status: string) => string;
}

/**
 * Bottom drawer mobile per visualizzare gli amici che seguono la serie,
 * strutturato come il drawer delle note in agenda e coerente con lo stile della webpage.
 */
export const MobileSeriesFriendsDrawer: React.FC<MobileSeriesFriendsDrawerProps> = ({
  isOpen,
  onClose,
  friends,
  getStatusBorderColor,
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
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <h3 className="font-extrabold text-gray-900 text-sm tracking-wide">
              Amici ({friends.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors cursor-pointer"
            title="Chiudi"
            aria-label="Chiudi amici"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Elenco Amici con stile Webpage */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2.5 bg-gray-50/40 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-[max(env(safe-area-inset-bottom,0px),16px)]">
          {friends.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm font-medium">
              Nessun amico ha aggiunto questa serie.
            </div>
          ) : (
            friends.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 rounded-2xl border border-gray-100 shadow-2xs transition-colors"
              >
                <img
                  src={f.avatar}
                  alt={f.name}
                  className={`w-11 h-11 rounded-full border-2 bg-gray-200 object-cover shrink-0 ${getStatusBorderColor(f.status)}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate text-sm">
                    {f.name}
                  </p>
                  <p className="text-xs text-gray-500 font-medium capitalize mt-0.5">
                    {getMediaStatusLabel(f.status, undefined, 'series')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileSeriesFriendsDrawer;
