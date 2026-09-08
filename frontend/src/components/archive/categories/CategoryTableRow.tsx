// src/components/archive/categories/CategoryTableRow.tsx
import React from 'react';
import { type Category } from '@/types/categories';
import { formatName } from '@/utils/uiUtils';
import { getGenreBadge } from './genreBadgeUtils';

interface CategoryTableRowProps {
  category: Category;
  onSelect: (category: Category) => void;
}

export const CategoryTableRow: React.FC<CategoryTableRowProps> = ({
  category,
  onSelect,
}) => {
  const catColor = category.colore || '#9CA3AF';

  return (
    <div
      onClick={() => onSelect(category)}
      className="grid grid-cols-[1fr_28px_85px] sm:grid-cols-[1fr_100px_140px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0 bg-white group"
    >
      {/* 1. TITOLO / NOME CATEGORIA */}
      <div className="min-w-0 flex items-center pl-1">
        <span
          className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate"
          title={category.category_name}
        >
          {formatName(category.category_name)}
        </span>
      </div>

      {/* 2. PALLINO DEL COLORE (adattato per mobile/desktop) */}
      <div className="w-7 sm:w-[100px] flex items-center justify-center min-w-0">
        {/* Mobile: Pallino compatto */}
        <div
          className="sm:hidden w-3.5 h-3.5 rounded-full shadow-2xs border border-black/10 shrink-0"
          style={{ backgroundColor: catColor }}
          title={`Colore: ${catColor}`}
          aria-label={`Colore: ${catColor}`}
        />
        {/* Desktop: Pallino standard con hover zoom */}
        <div className="hidden sm:flex items-center justify-center">
          <span
            className="w-5 h-5 rounded-full border border-black/10 shadow-2xs shrink-0 transition-transform group-hover:scale-110"
            style={{ backgroundColor: catColor }}
            title={`Colore: ${catColor}`}
          />
        </div>
      </div>

      {/* 3. TIPO / GENERE */}
      <div className="w-[85px] sm:w-[140px] flex items-center min-w-0">
        {getGenreBadge(category.genre)}
      </div>
    </div>
  );
};

export default CategoryTableRow;
