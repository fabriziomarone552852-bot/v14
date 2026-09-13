// src/mobile/components/notes/MobileNoteStyles.ts
import type { NoteVariant } from '@/types';

export interface NoteStyleConfig {
  card: string;
  ring: string;
  text: string;
  placeholder: string;
  btnHover: string;
  btnBg: string;
  btnText: string;
}

export const NOTE_STYLES: Record<NoteVariant, NoteStyleConfig> = {
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
