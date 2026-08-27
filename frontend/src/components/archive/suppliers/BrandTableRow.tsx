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
      className="grid grid-cols-[1fr_160px_180px] items-center gap-3 px-4 py-3 border-b border-slate-100 hover:bg-slate-50/90 transition-colors cursor-pointer group text-xs select-none"
    >
      {/* Colonna Marchio / Brand */}
      <div className="min-w-0 pl-2">
        <p className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors text-sm capitalize">
          {brand.nameNormalized || brand.name}
        </p>
      </div>

      {/* Colonna Acquisti Registrati */}
      <div className="w-[160px] text-center">
        {brand.purchaseCount > 0 ? (
          <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200 text-[11px]">
            <ShoppingIcon className="w-3 h-3 text-indigo-500" />
            <span>
              {brand.purchaseCount}{' '}
              {brand.purchaseCount === 1 ? 'acquisto' : 'acquisti'}
            </span>
          </span>
        ) : (
          <span className="text-slate-300 font-bold text-xs">—</span>
        )}
      </div>

      {/* Colonna Ultimo Acquisto */}
      <div className="w-[180px] text-center">
        {brand.lastPurchaseDate ? (
          <div className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200 text-[11px]">
            <ClockIcon className="w-3 h-3 text-slate-400" />
            <span>{formatToItalianShortDate(brand.lastPurchaseDate)}</span>
          </div>
        ) : (
          <span className="text-slate-300 font-bold text-xs">—</span>
        )}
      </div>
    </div>
  );
};

export default BrandTableRow;
