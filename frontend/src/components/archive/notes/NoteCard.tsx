// src/components/notes/NoteCard.tsx
import React from 'react';
import type { DailyEntry } from '@/types/dailyentries';
import type { NoteVariant } from '@/types';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import { isNoteVariant } from '@/utils/noteUtils';
import { TrashIcon } from '@/components/shared/utils/Icons';

interface NoteCardProps {
  note: DailyEntry;
  onEdit: (note: DailyEntry) => void;
  onDelete: (note: DailyEntry) => void;
}

const NOTE_THEMES: Record<
  NoteVariant,
  {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    headerBorder: string;
    trashHover: string;
  }
> = {
  N1: {
    bg: 'bg-yellow-100/90 hover:bg-yellow-100',
    border: 'border-yellow-300/80',
    text: 'text-yellow-950',
    badgeBg: 'bg-yellow-200/80',
    badgeText: 'text-yellow-900',
    headerBorder: 'border-yellow-200/90',
    trashHover: 'text-yellow-800/50 hover:text-red-600 hover:bg-yellow-200/60',
  },
  N2: {
    bg: 'bg-green-100/90 hover:bg-green-100',
    border: 'border-green-300/80',
    text: 'text-green-950',
    badgeBg: 'bg-green-200/80',
    badgeText: 'text-green-900',
    headerBorder: 'border-green-200/90',
    trashHover: 'text-green-800/50 hover:text-red-600 hover:bg-green-200/60',
  },
  N3: {
    bg: 'bg-blue-100/90 hover:bg-blue-100',
    border: 'border-blue-300/80',
    text: 'text-blue-950',
    badgeBg: 'bg-blue-200/80',
    badgeText: 'text-blue-900',
    headerBorder: 'border-blue-200/90',
    trashHover: 'text-blue-800/50 hover:text-red-600 hover:bg-blue-200/60',
  },
  N4: {
    bg: 'bg-pink-100/90 hover:bg-pink-100',
    border: 'border-pink-300/80',
    text: 'text-pink-950',
    badgeBg: 'bg-pink-200/80',
    badgeText: 'text-pink-900',
    headerBorder: 'border-pink-200/90',
    trashHover: 'text-pink-800/50 hover:text-red-600 hover:bg-pink-200/60',
  },
};

export const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
  const safeVariant: NoteVariant = isNoteVariant(note.tipo) ? note.tipo : 'N1';
  const theme = NOTE_THEMES[safeVariant];

  const formattedDate = note.data_riferimento
    ? formatToItalianShortDate(note.data_riferimento.substring(0, 10))
    : 'Nessuna data';

  return (
    <div
      onClick={() => onEdit(note)}
      className={`rounded-2xl border p-4.5 shadow-xs hover:shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between group ${theme.bg} ${theme.border}`}
    >
      {/* 1. HEADER DELLA NOTA: DATA A SINISTRA E TASTO ELIMINA A DESTRA */}
      <div
        className={`flex items-center justify-between pb-2 mb-2.5 border-b ${theme.headerBorder}`}
      >
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText}`}
        >
          {formattedDate}
        </span>

        {/* TASTO ELIMINAZIONE DIRETTO */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note);
          }}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme.trashHover}`}
          title="Elimina nota"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 2. CORPO DELLA NOTA CON ALTEZZA NATURALE E SCROLLBAR INTERNA SE LUNGA */}
      <div className="max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
        <p
          className={`text-sm leading-relaxed whitespace-pre-wrap font-medium select-text ${theme.text}`}
        >
          {note.testo || <span className="italic opacity-50">Nota vuota</span>}
        </p>
      </div>
    </div>
  );
};

export default NoteCard;
