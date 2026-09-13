// src/mobile/components/MobileNotesBottomSheet.tsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { LocalNoteEntry, NoteVariant } from '@/types';
import { PlusIcon } from '@/components/shared/utils/Icons';
import { useBackHandler } from '@/utils/backButtonManager';
import { MobileSmartNoteCard } from './notes/MobileSmartNoteCard';
import { MobileNotesHeader } from './notes/MobileNotesHeader';

export interface MobileNotesBottomSheetProps {
  isOpen: boolean;
  notes: LocalNoteEntry[];
  editingNoteId: number | null;
  onClose: () => void;
  onAddNote: () => void;
  onAutoSaveNote: (id: number, testo: string, tipo: NoteVariant, isNew?: boolean) => void;
  onDeleteNote: (id: number, isNew?: boolean) => void;
  clearEditingNoteId: () => void;
}

export const MobileNotesBottomSheet: React.FC<MobileNotesBottomSheetProps> = ({
  isOpen,
  notes,
  editingNoteId,
  onClose,
  onAddNote,
  onAutoSaveNote,
  onDeleteNote,
  clearEditingNoteId,
}) => {
  // Registra tasto Indietro per chiusura drawer
  useBackHandler(isOpen, onClose, 10);

  // Chiudi con tasto Escape
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
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* 1. Backdrop oscurato con blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Cassetto scorrevole animato dal basso (Slide Up) */}
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-gray-200 flex flex-col h-[88dvh] max-h-[92dvh] z-10 animate-slideUp select-none overflow-hidden">
        {/* Header Drawer con Pull Bar */}
        <MobileNotesHeader notesCount={notes.length} onClose={onClose} />

        {/* Body Note con tasto "+ Nuova Nota" */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-gray-50/40 custom-scrollbar pb-[max(env(safe-area-inset-bottom,0px),16px)]">
          <button
            type="button"
            onClick={onAddNote}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/60 active:scale-95 active:bg-blue-100 transition-all flex justify-center items-center font-bold text-xs gap-2 cursor-pointer shadow-2xs"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Nuova Nota</span>
          </button>

          {notes.map((nota) => (
            <MobileSmartNoteCard
              key={nota.id}
              nota={nota}
              isInitiallyEditing={editingNoteId === nota.id}
              onAutoSave={onAutoSaveNote}
              onDelete={onDeleteNote}
              clearNewStatus={clearEditingNoteId}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileNotesBottomSheet;
