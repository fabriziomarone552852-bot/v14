// src/mobile/components/modals/shopping/price/MobileProductPriceSummaryCards.tsx
import React from 'react';
import { TagIcon, TrendDownIcon, ClockIcon } from '@/components/shared/utils/Icons';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import type { PriceSourceTab } from './useMobileProductPriceStats';

export interface MobileProductPriceSummaryCardsProps {
  view: PriceSourceTab;
  stats: {
    bestPrice: number | null;
    bestSupplier?: string | null;
    avg: number | null;
    count: number;
    latestPrice?: number | null;
    latestDate?: string | null;
  };
}

export const MobileProductPriceSummaryCards: React.FC<MobileProductPriceSummaryCardsProps> = ({
  view,
  stats,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-3 space-y-2.5 shadow-2xs">
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-1.5">
        Sintesi Prezzi ({view === 'personal' ? 'I Miei Acquisti' : 'Community'})
      </h4>

      <div className="grid grid-cols-3 gap-2">
        {/* Prezzo Migliore */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 text-[9px] font-bold uppercase tracking-wider">
            <span>Minimo</span>
            <TrendDownIcon className="w-3 h-3" />
          </div>
          <div className="mt-1">
            <p className="text-sm font-extrabold text-emerald-900">
              {stats.bestPrice != null ? `€${stats.bestPrice.toFixed(2)}` : '—'}
            </p>
            {stats.bestSupplier ? (
              <p className="text-[9px] text-emerald-700 font-medium truncate mt-0.5" title={stats.bestSupplier}>
                {stats.bestSupplier}
              </p>
            ) : (
              <p className="text-[9px] text-emerald-600/70 mt-0.5">—</p>
            )}
          </div>
        </div>

        {/* Prezzo Medio */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-800 text-[9px] font-bold uppercase tracking-wider">
            <span>Medio</span>
            <TagIcon className="w-3 h-3" />
          </div>
          <div className="mt-1">
            <p className="text-sm font-extrabold text-blue-900">
              {stats.avg != null ? `€${stats.avg.toFixed(2)}` : '—'}
            </p>
            <p className="text-[9px] text-blue-600 font-medium mt-0.5">
              {stats.count > 0 ? `${stats.count} acq.` : 'Nessun dato'}
            </p>
          </div>
        </div>

        {/* Prezzo Più Recente */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-700 text-[9px] font-bold uppercase tracking-wider">
            <span>Ultimo</span>
            <ClockIcon className="w-3 h-3" />
          </div>
          <div className="mt-1">
            <p className="text-sm font-extrabold text-gray-900">
              {stats.latestPrice != null ? `€${stats.latestPrice.toFixed(2)}` : '—'}
            </p>
            {stats.latestDate ? (
              <p className="text-[9px] text-gray-500 font-medium truncate mt-0.5">
                {formatToItalianShortDate(stats.latestDate)}
              </p>
            ) : (
              <p className="text-[9px] text-gray-400 mt-0.5">—</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
