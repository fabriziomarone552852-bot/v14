// src/mobile/components/modals/review/sections/ReviewModalHeader.tsx
import React from 'react';
import { CloseIcon } from '@/components/shared/utils/Icons';

export interface ReviewModalHeaderProps {
  title: string;
  activeRecapTitle?: string | null;
  onClose: () => void;
  onBackToReview?: () => void;
}

export const ReviewModalHeader: React.FC<ReviewModalHeaderProps> = ({
  title,
  activeRecapTitle,
  onClose,
  onBackToReview,
}) => {
  if (!activeRecapTitle) {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/95 shrink-0 pt-[max(env(safe-area-inset-top,0px),12px)]">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider truncate">
          {title}
        </h2>

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
  }

  return (
    <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 bg-white shrink-0 pt-[max(env(safe-area-inset-top,0px),10px)]">
      <span className="text-xs font-black uppercase tracking-wider text-gray-800">
        {activeRecapTitle}
      </span>

      <button
        type="button"
        onClick={onBackToReview || onClose}
        className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer shrink-0"
        title="Torna alla review"
        aria-label="Torna alla review"
      >
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
