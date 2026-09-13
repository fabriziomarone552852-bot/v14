// src/mobile/components/modals/bingo/MobileBingoHeader.tsx
import React from 'react';
import { CloseIcon } from '@/components/shared/utils/Icons';

interface MobileBingoHeaderProps {
  completedCount: number;
  onClose: () => void;
}

export const MobileBingoHeader: React.FC<MobileBingoHeaderProps> = ({
  completedCount,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/95 shrink-0 pt-[max(env(safe-area-inset-top,0px),12px)]">
      <div className="flex items-center gap-2.5">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider truncate">
          Bingo Card
        </h2>
        <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">
          {completedCount} / 25 completate
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer shrink-0"
        title="Chiudi"
        aria-label="Chiudi"
      >
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MobileBingoHeader;
