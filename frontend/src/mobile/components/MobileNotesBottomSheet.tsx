// src/mobile/components/MobileNotesBottomSheet.tsx
import React, { useState, useEffect } from 'react';
import type { LocalNoteEntry, NoteVariant } from '@/types';
import { isNoteVariant } from '@/utils/noteUtils';
import { CloseIcon, TrashIcon, PlusIcon, NoteIcon } from '@/components/shared/utils/Icons';
import { useAutoResizeTextArea } from '@/hooks/useAutoResizeTextArea';
import { useDebounce } from '@/hooks/useDebounce';

const NOTE_STYLES: Record<
  NoteVariant,
  { card: string; ring: string; text: string; placeholder: string; btnHover: string; btnBg: string; btnText: string }
> = {
  N1: {
    card: 'bg-yellow-100',
    ring: 'ring-yellow-400/50',
    text: 'text-yellow-900',
    placeholder: 'placeholder-yellow-800/40',
    btnBg: 'bg-yellow-300/30',
    btnHover: 'hover:bg-yellow-300/80',
    btnText: 'text-yellow-800/60 hover:text-red-600',
  },
  N2: {
    card: 'bg-green-100',
    ring: 'ring-green-400/50',
    text: 'text-green-900',
    placeholder: 'placeholder-green-800/40',
    btnBg: 'bg-green-300/30',
    btnHover: 'hover:bg-green-300/80',
    btnText: 'text-green-800/60 hover:text-red-600',
  },
  N3: {
    card: 'bg-blue-100',
    ring: 'ring-blue-400/50',
    text: 'text-blue-900',
    placeholder: 'placeholder-blue-800/40',
    btnBg: 'bg-blue-300/30',
    btnHover: 'hover:bg-blue-300/80',
    btnText: 'text-blue-800/60 hover:text-red-600',
  },
  N4: {
    card: 'bg-pink-100',
    ring: 'ring-pink-400/50',
    text: 'text-pink-900',
    placeholder: 'placeholder-pink-800/40',
    btnBg: 'bg-pink-300/30',
    btnHover: 'hover:bg-pink-300/80',
    btnText: 'text-pink-800/60 hover:text-red-600',
  },
};

const MobileSmartNoteCard: React.FC<{
  nota: LocalNoteEntry;
  isInitiallyEditing: boolean;
  onAutoSave: (id: number, testo: string, tipo: NoteVariant, isNew?: boolean) => void;
  onDelete: (id: number, isNew?: boolean) => void;
  clearNewStatus: () => void;
}> = ({ nota, isInitiallyEditing, onAutoSave, onDelete, clearNewStatus }) => {
  const [isEditing, setIsEditing] = useState(isInitiallyEditing);
  const [testoLocal, setTestoLocal] = useState(nota.testo ?? '');
  const isDeletingRef = React.useRef(false);

  useEffect(() => {
    if (isInitiallyEditing) {
      setIsEditing(true);
    }
  }, [isInitiallyEditing]);

  const debouncedText = useDebounce(testoLocal, 1000);
  const textareaRef = useAutoResizeTextArea(testoLocal);

  const safeVariant: NoteVariant = isNoteVariant(nota.tipo) ? nota.tipo : 'N1';
  const styles = NOTE_STYLES[safeVariant];

  useEffect(() => {
    if (isDeletingRef.current) return;
    if (debouncedText == null) return;
    if (debouncedText !== nota.testo) {
      if (debouncedText.trim() === '') {
        onDelete(nota.id, nota.isNew);
      } else {
        onAutoSave(nota.id, debouncedText, safeVariant, nota.isNew);
        clearNewStatus();
      }
    }
  }, [debouncedText]);

  const handleBlur = () => {
    if (isDeletingRef.current) return;
    setIsEditing(false);
    const text = testoLocal ?? '';
    if (text.trim() === '') {
      onDelete(nota.id, nota.isNew);
    } else if (text !== nota.testo) {
      onAutoSave(nota.id, text, safeVariant, nota.isNew);
      clearNewStatus();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    isDeletingRef.current = true;
    onDelete(nota.id, nota.isNew);
  };

  return (
    <div
      onClick={() => {
        if (!isEditing) setIsEditing(true);
      }}
      className={`p-3.5 rounded-br-2xl rounded-tl-xl rounded-tr-xl rounded-bl-xl shadow-xs relative group min-h-[4.5rem] transition-all ${styles.card} ${
        isEditing ? `ring-2 ${styles.ring}` : 'active:scale-[0.99]'
      }`}
    >
      {/* Angolino piegato in basso a destra stile post-it */}
      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-black/10 rounded-tl-md rounded-br-2xl pointer-events-none" />

      <button
        type="button"
        onMouseDown={(e) => {
          isDeletingRef.current = true;
          e.preventDefault();
        }}
        onClick={handleDelete}
        className={`absolute top-2.5 right-2.5 p-1 rounded-lg z-10 transition-colors ${styles.btnText} ${styles.btnBg} ${styles.btnHover} cursor-pointer`}
        title="Elimina nota"
      >
        <TrashIcon className="w-3.5 h-3.5" />
      </button>

      {isEditing ? (
        <textarea
          ref={textareaRef}
          autoFocus
          value={testoLocal}
          onChange={(e) => setTestoLocal(e.target.value)}
          onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
          onBlur={handleBlur}
          placeholder="Scrivi qui la tua nota..."
          className={`w-full bg-transparent border-none focus:ring-0 resize-none outline-none text-xs font-medium leading-relaxed font-mono p-0 overflow-hidden pr-7 custom-scrollbar ${styles.text} ${styles.placeholder}`}
          rows={2}
        />
      ) : (
        <p className={`text-xs font-medium leading-relaxed font-mono whitespace-pre-wrap break-words pr-7 ${styles.text}`}>
          {testoLocal || <span className="italic opacity-60">Nota vuota... Tocca per scrivere.</span>}
        </p>
      )}
    </div>
  );
};

interface MobileNotesBottomSheetProps {
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

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fadeIn select-none">
      {/* 1. HEADER DRAWER (A tutto schermo, copre anche l'header del giorno) */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50/90 shrink-0">
        <h2 className="text-base font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
          <NoteIcon className="w-5 h-5 text-yellow-500" />
          Note
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors cursor-pointer"
          title="Chiudi"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 2. BODY NOTE CON TASTO "+ NUOVA NOTA" (Stile AddButton / Webpage Drawer) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-gray-50/40 custom-scrollbar">
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
  );
};

export default MobileNotesBottomSheet;
