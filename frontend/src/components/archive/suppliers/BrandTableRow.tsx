// src/components/archive/suppliers/BrandTableRow.tsx
import React from 'react';
import { ShoppingIcon, ClockIcon } from '@/components/shared/utils/Icons';
import type { EnrichedBrand } from '@/hooks/useBrandArchiveData';
import { formatToItalianShortDate } from '@/utils/dateUtils';

interface BrandTableRowProps {
  brand: EnrichedBrand;
  onSelect: (brand: EnrichedBrand) => void;
}

export const BrandTableRow: React.FC<BrandTableRowProps> = ({
  brand,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(brand)}
      className="grid grid-cols-[1fr_60px_80px] sm:grid-cols-[1fr_160px_180px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-slate-100 hover:bg-slate-50/90 transition-colors cursor-pointer group text-xs select-none"
    >
      {/* Colonna Marchio / Brand */}
      <div className="min-w-0 pl-1">
        <p className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors text-xs sm:text-sm capitalize">
          {brand.nameNormalized || brand.name}
        </p>
      </div>

      {/* Colonna Acquisti Registrati */}
      <div className="w-[60px] sm:w-[160px] text-center flex items-center justify-center">
        {brand.purchaseCount > 0 ? (
          <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2 sm:px-2.5 py-0.5 rounded-lg border border-indigo-200 text-[10px] sm:text-[11px]">
            <ShoppingIcon className="w-3 h-3 text-indigo-500" />
            <span className="hidden sm:inline">
              {brand.purchaseCount}{' '}
              {brand.purchaseCount === 1 ? 'acquisto' : 'acquisti'}
            </span>
            <span className="sm:hidden">{brand.purchaseCount}</span>
          </span>
        ) : (
          <span className="text-slate-300 font-bold text-xs">—</span>
        )}
      </div>

      {/* Colonna Ultimo Acquisto */}
      <div className="w-[80px] sm:w-[180px] text-center flex items-center justify-center">
        {brand.lastPurchaseDate ? (
          <div className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-50 px-1.5 sm:px-2 py-0.5 rounded-lg border border-slate-200 text-[10px] sm:text-[11px] truncate">
            <ClockIcon className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{formatToItalianShortDate(brand.lastPurchaseDate)}</span>
          </div>
        ) : (
          <span className="text-slate-300 font-bold text-xs">—</span>
        )}
      </div>
    </div>
  );
};

export default BrandTableRow;
