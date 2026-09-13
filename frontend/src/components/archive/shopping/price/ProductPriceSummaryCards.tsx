// src/components/archive/shopping/price/ProductPriceSummaryCards.tsx
import React from 'react';
import {
  TagIcon,
  CalendarIcon,
  TrendDownIcon,
  ClockIcon,
} from '@/components/shared/utils/Icons';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import type { ComputedPriceStats } from '@/components/shared/shopping/shoppingPriceUtils';

export interface ProductPriceSummaryCardsProps {
  stats: ComputedPriceStats;
  commonUnitDisplay: string | null;
  currency: string;
}

export const ProductPriceSummaryCards: React.FC<ProductPriceSummaryCardsProps> = ({
  stats,
  commonUnitDisplay,
  currency,
}) => {
  const displayUnit = stats.bestUnit || commonUnitDisplay;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* 1. Prezzo Medio */}
      <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs uppercase tracking-wider mb-1">
          <TagIcon className="w-4 h-4 text-blue-600" />
          <span>Media Periodo</span>
        </div>
        <div>
          <span className="text-xl font-black text-blue-900">
            {stats.avg !== null ? `${stats.avg.toFixed(2)} ${currency}` : 'N/D'}
          </span>
          {displayUnit && (
            <span className="block text-[10px] font-semibold text-blue-600 truncate">
              / {displayUnit}
            </span>
          )}
        </div>
      </div>

      {/* 2. Miglior Prezzo */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
          <TrendDownIcon className="w-4 h-4 text-emerald-600" />
          <span>Miglior Prezzo</span>
        </div>
        <div>
          <span className="text-xl font-black text-emerald-900">
            {stats.bestPrice !== null ? `${stats.bestPrice.toFixed(2)} ${currency}` : 'N/D'}
          </span>
          {stats.bestSupplier && (
            <span className="block text-[10px] font-semibold text-emerald-700 truncate" title={stats.bestSupplier}>
              presso {stats.bestSupplier}
            </span>
          )}
        </div>
      </div>

      {/* 3. Totale Rilevazioni */}
      <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs uppercase tracking-wider mb-1">
          <ClockIcon className="w-4 h-4 text-purple-600" />
          <span>Rilevazioni</span>
        </div>
        <div>
          <span className="text-xl font-black text-purple-900">
            {stats.count}
          </span>
          <span className="block text-[10px] font-semibold text-purple-600 truncate">
            nel periodo selezionato
          </span>
        </div>
      </div>

      {/* 4. Ultimo Acquisto */}
      <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 flex flex-col justify-between shadow-2xs">
        <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
          <CalendarIcon className="w-4 h-4 text-amber-600" />
          <span>Ultimo Acquisto</span>
        </div>
        <div>
          <span className="text-xl font-black text-amber-900">
            {stats.latestPrice !== null ? `${stats.latestPrice.toFixed(2)} ${currency}` : 'N/D'}
          </span>
          {stats.latestDate && (
            <span className="block text-[10px] font-semibold text-amber-700 truncate">
              {formatToItalianShortDate(stats.latestDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
