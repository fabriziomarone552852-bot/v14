// src/components/categories/CategoryTableRow.tsx
import React from 'react';
import { type Category } from '@/types/categories';
import { formatName } from '@/utils/uiUtils';

interface CategoryTableRowProps {
  category: Category;
  onSelect: (category: Category) => void;
}

import { getGenreBadge } from './genreBadgeUtils';

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
