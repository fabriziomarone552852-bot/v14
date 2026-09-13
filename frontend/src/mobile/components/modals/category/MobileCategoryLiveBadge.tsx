// src/mobile/components/modals/category/MobileCategoryLiveBadge.tsx
import React from 'react';

interface MobileCategoryLiveBadgeProps {
  name: string;
  color: string;
  genreLabel: string;
}

export const MobileCategoryLiveBadge: React.FC<MobileCategoryLiveBadgeProps> = ({
  name,
  color,
  genreLabel,
}) => {
  return (
    <div className="bg-gray-50/90 border border-gray-200/80 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className="w-4 h-4 rounded-full border border-gray-300/80 shrink-0 shadow-xs"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-bold text-gray-800 truncate">
          {name.trim() || 'Nome Categoria'}
        </span>
      </div>
      <span className="text-[11px] font-bold text-gray-500 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full shrink-0">
        {genreLabel}
      </span>
    </div>
  );
};

export default MobileCategoryLiveBadge;
