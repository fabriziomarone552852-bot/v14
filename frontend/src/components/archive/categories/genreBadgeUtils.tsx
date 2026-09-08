// src/components/archive/categories/genreBadgeUtils.tsx
import { CategoryGenre } from '@/types/categories';

export const getGenreBadge = (genre: number) => {
  switch (genre) {
    case CategoryGenre.TASKS:
    case 1:
      return (
        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide truncate max-w-full inline-block text-center">
          Tasks
        </span>
      );
    case CategoryGenre.EVENTS:
    case 2:
      return (
        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide truncate max-w-full inline-block text-center">
          Eventi
        </span>
      );
    case CategoryGenre.COMMON:
    case 3:
      return (
        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide truncate max-w-full inline-block text-center">
          Comune
        </span>
      );
    case CategoryGenre.MOOD:
    case 4:
      return (
        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide truncate max-w-full inline-block text-center">
          Mood
        </span>
      );
    case CategoryGenre.TAG:
    case 5:
      return (
        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded-md bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wide truncate max-w-full inline-block text-center">
          Tag
        </span>
      );
    default:
      return (
        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded-md bg-gray-100 text-gray-700 border border-gray-200 uppercase tracking-wide truncate max-w-full inline-block text-center">
          Tipo {genre}
        </span>
      );
  }
};
