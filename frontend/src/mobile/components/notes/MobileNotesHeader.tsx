// src/mobile/components/notes/MobileNotesHeader.tsx
import React from 'react';
import { CloseIcon, NoteIcon } from '@/components/shared/utils/Icons';

interface MobileNotesHeaderProps {
  notesCount: number;
  onClose: () => void;
}

export const MobileNotesHeader: React.FC<MobileNotesHeaderProps> = ({
  notesCount,
  onClose,
}) => {
  return (
    <>
      {/* Maniglia di trascinamento superiore (Pull bar) */}
      <div className="pt-2.5 pb-1 flex justify-center bg-gray-50/95 shrink-0">
        <div className="w-12 h-1 bg-gray-300 rounded-full cursor-pointer" onClick={onClose} />
      </div>

      {/* Header Drawer */}
      <div className="px-4 py-2.5 border-b border-gray-200 flex justify-between items-center bg-gray-50/95 shrink-0">
        <h2 className="text-base font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
          <NoteIcon className="w-5 h-5 text-yellow-500" />
          <span>Note & Appunti</span>
          {notesCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
              {notesCount}
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors cursor-pointer"
          title="Chiudi"
          aria-label="Chiudi note"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
    </>
  );
};

export default MobileNotesHeader;
