// src/mobile/components/notes/MobileSmartNoteCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { LocalNoteEntry, NoteVariant } from '@/types';
import { isNoteVariant } from '@/utils/noteUtils';
import { TrashIcon } from '@/components/shared/utils/Icons';
import { useAutoResizeTextArea } from '@/hooks/useAutoResizeTextArea';
import { useDebounce } from '@/hooks/useDebounce';
import { NOTE_STYLES } from './MobileNoteStyles';

export interface MobileSmartNoteCardProps {
  nota: LocalNoteEntry;
  isInitiallyEditing: boolean;
  onAutoSave: (id: number, testo: string, tipo: NoteVariant, isNew?: boolean) => void;
  onDelete: (id: number, isNew?: boolean) => void;
  clearNewStatus: () => void;
}

export const MobileSmartNoteCard: React.FC<MobileSmartNoteCardProps> = ({
  nota,
  isInitiallyEditing,
  onAutoSave,
  onDelete,
  clearNewStatus,
}) => {
  const [isEditing, setIsEditing] = useState(isInitiallyEditing);
  const [testoLocal, setTestoLocal] = useState(nota.testo ?? '');
  const isDeletingRef = useRef(false);

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
        <p
          className={`text-xs font-medium leading-relaxed font-mono whitespace-pre-wrap break-words pr-7 ${styles.text}`}
        >
          {testoLocal || <span className="italic opacity-60">Nota vuota... Tocca per scrivere.</span>}
        </p>
      )}
    </div>
  );
};

export default MobileSmartNoteCard;
