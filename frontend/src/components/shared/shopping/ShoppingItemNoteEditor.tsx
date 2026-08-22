// src/components/shared/shopping/ShoppingItemNoteEditor.tsx
import React, { useRef, useEffect } from 'react';
import { NoteIcon, CheckIcon } from '@/components/shared/utils/Icons';

export interface ShoppingItemNoteEditorProps {
  notes: string | null | undefined;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  noteText: string;
  setNoteText: (text: string) => void;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  canEdit: boolean;
}

export const ShoppingItemNoteEditor: React.FC<ShoppingItemNoteEditorProps> = ({
  notes,
  isEditing,
  setIsEditing,
  noteText,
  setNoteText,
  isSaving,
  onSave,
  onCancel,
  canEdit,
}) => {
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && noteInputRef.current) {
      noteInputRef.current.focus();
      noteInputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div className="pt-2.5 border-t border-gray-100">
      <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
        <NoteIcon className="w-3.5 h-3.5 text-gray-400" />
        <span>Note & Indicazioni</span>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            ref={noteInputRef}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Scrivi una nota per questo prodotto..."
            rows={3}
            className="w-full p-2.5 bg-blue-50/30 focus:bg-white text-xs text-gray-800 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSave();
              }
              if (e.key === 'Escape') {
                onCancel();
              }
            }}
          />
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={onCancel}
              className="px-2.5 py-1 text-xs font-semibold text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Salvataggio...' : 'Salva'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => {
            if (canEdit) setIsEditing(true);
          }}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            notes
              ? 'bg-gray-50/80 hover:bg-blue-50/30 border-gray-200/80'
              : 'bg-gray-50/40 hover:bg-blue-50/40 border-dashed border-gray-200'
          }`}
          title={canEdit ? 'Clicca per modificare direttamente la nota' : undefined}
        >
          {notes ? (
            <p className="text-xs text-gray-700 italic leading-relaxed whitespace-pre-wrap">
              "{notes}"
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">
              Nessuna nota presente. Clicca qui per aggiungere una nota...
            </p>
          )}
        </div>
      )}
    </div>
  );
};
