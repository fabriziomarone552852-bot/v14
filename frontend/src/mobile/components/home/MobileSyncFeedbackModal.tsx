// src/mobile/components/home/MobileSyncFeedbackModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { SyncIcon } from '@/components/shared/utils/Icons';

export interface MobileSyncFeedbackModalProps {
  message: string | null;
  onClose: () => void;
}

export const MobileSyncFeedbackModal: React.FC<MobileSyncFeedbackModalProps> = ({
  message,
  onClose,
}) => {
  if (!message) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="bg-white rounded-2xl p-5 shadow-2xl border border-gray-200/90 max-w-xs w-full flex flex-col items-center text-center space-y-3 animate-scaleUp pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-xs">
          <SyncIcon className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
            Sincronizzazione Google
          </h3>
          <p className="text-xs font-semibold text-gray-700 leading-relaxed">
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          OK
        </button>
      </div>
    </div>,
    document.body
  );
};
