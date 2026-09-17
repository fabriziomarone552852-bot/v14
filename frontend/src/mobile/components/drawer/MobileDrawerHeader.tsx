// src/mobile/components/drawer/MobileDrawerHeader.tsx
import React from 'react';
import { CloseIcon } from '@/components/shared/utils/Icons';

export interface MobileDrawerHeaderProps {
  displayUsername: string;
  onClose: () => void;
}

export const MobileDrawerHeader: React.FC<MobileDrawerHeaderProps> = ({
  displayUsername,
  onClose,
}) => {
  return (
    <div className="px-5 pt-6 pb-5 border-b border-gray-800 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <img src="/favicon.png" alt="Vita Logo" className="w-10 h-10 object-contain shrink-0" />
        <div className="truncate">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block leading-none">
            Benvenuto
          </span>
          <h2 className="text-base font-extrabold text-white truncate leading-tight mt-0.5">
            {displayUsername}
          </h2>
        </div>
      </div>

      <button
        onClick={onClose}
        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors focus:outline-none cursor-pointer"
        aria-label="Chiudi menu"
      >
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
