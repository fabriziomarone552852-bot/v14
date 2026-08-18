// src/components/categories/CategoryTableRow.tsx
import React from 'react';
import { CategoryGenre, type Category } from '@/types/categories';
import { formatName } from '@/utils/uiUtils';

interface CategoryTableRowProps {
  category: Category;
  onSelect: (category: Category) => void;
}

export const getGenreBadge = (genre: number) => {
  switch (genre) {
    case CategoryGenre.TASKS:
    case 1:
      return (
        <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
          Tasks
        </span>
      );
    case CategoryGenre.EVENTS:
    case 2:
      return (
        <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
          Eventi
        </span>
      );
    case CategoryGenre.COMMON:
    case 3:
      return (
        <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
          Comune
        </span>
      );
    case CategoryGenre.MOOD:
    case 4:
      return (
        <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
          Stato d'animo
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-gray-100 text-gray-700 border border-gray-200 uppercase tracking-wide">
          Tipo {genre}
        </span>
      );
  }
};

export const CategoryTableRow: React.FC<CategoryTableRowProps> = ({
  category,
  onSelect,
}) => {
  const catColor = category.colore || '#9CA3AF';

  return (
    <div
      onClick={() => onSelect(category)}
      className="grid grid-cols-[1fr_100px_140px] items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer group"
    >
      {/* 1. TITOLO / NOME CATEGORIA */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
          {formatName(category.category_name)}
        </span>
      </div>

      {/* 2. PALLINO DEL COLORE */}
      <div className="flex items-center justify-center">
        <span
          className="w-5 h-5 rounded-full border border-black/10 shadow-2xs shrink-0 transition-transform group-hover:scale-110"
          style={{ backgroundColor: catColor }}
          title={`Colore: ${catColor}`}
        />
      </div>

      {/* 3. TIPO / GENERE */}
      <div className="flex items-center">
        {getGenreBadge(category.genre)}
      </div>
    </div>
  );
};

export default CategoryTableRow;
