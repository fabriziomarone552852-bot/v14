// src/components/shared/shopping/ShoppingItemPriceAnalysisCard.tsx
import React from 'react';
import { ShoppingIcon, StoreIcon } from '@/components/shared/utils/Icons';
import { formatToItalianShortDate } from '@/utils/dateUtils';

export interface PriceStatsData {
  avg: number;
  bestPrice: number;
  bestSupplier?: string | null;
  bestDate?: string | null;
  unit: string;
  count: number;
}

export interface ShoppingItemPriceAnalysisCardProps {
  currentStats: PriceStatsData | null;
  view: 'personal' | 'community';
}

export const ShoppingItemPriceAnalysisCard: React.FC<ShoppingItemPriceAnalysisCardProps> = ({
  currentStats,
  view,
}) => {
  return (
    <div className="pt-3 border-t border-gray-100">
      <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">
        <span className="flex items-center gap-1.5 text-blue-700">
          <ShoppingIcon className="w-3.5 h-3.5" />
          <span>Analisi Prezzi ({view === 'personal' ? 'Miei Acquisti' : 'Community'})</span>
        </span>
        {currentStats && (
          <span className="text-[10px] text-gray-400 font-medium lowercase">
            {currentStats.count} {currentStats.count === 1 ? 'rilevazione' : 'rilevazioni'}
          </span>
        )}
      </div>

      {currentStats ? (
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-gray-200/80 bg-gray-50/70 p-2.5">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-0.5">
              Prezzo Medio
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-gray-900">
                € {currentStats.avg.toFixed(2)}
              </span>
              <span className="text-[11px] font-medium text-gray-500">
                / {currentStats.unit}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-2.5">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide block mb-0.5">
              Miglior Prezzo
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-emerald-950">
                € {currentStats.bestPrice.toFixed(2)}
              </span>
              <span className="text-[11px] font-medium text-emerald-700">
                / {currentStats.unit}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-emerald-700 font-medium">
              <span className="truncate flex items-center gap-1 max-w-[65%]">
                <StoreIcon className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{currentStats.bestSupplier || '—'}</span>
              </span>
              <span className="shrink-0 text-emerald-600">
                {formatToItalianShortDate(currentStats.bestDate)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400 py-2.5 text-center italic">
          Nessun prezzo registrato in {view === 'personal' ? 'questi acquisti' : 'community'}.
        </p>
      )}
    </div>
  );
};
