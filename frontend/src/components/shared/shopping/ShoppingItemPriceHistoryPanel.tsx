import React from 'react';
import type { ItemBatchRecord, CommunityPriceRecord } from '@/types/shopping';
import { ShoppingIcon, StoreIcon } from '@/components/shared/utils/Icons';
import { formatUnitForQuantity } from './ShoppingUnitSelect';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import { ShoppingItemPriceAnalysisCard, type PriceStatsData } from './ShoppingItemPriceAnalysisCard';

export interface ShoppingItemPriceHistoryPanelProps {
  view: 'personal' | 'community';
  onViewChange: (view: 'personal' | 'community') => void;
  personalBatches: ItemBatchRecord[];
  communityPrices: CommunityPriceRecord[];
  isLoading: boolean;
  currentStats?: PriceStatsData | null;
  className?: string;
  embedded?: boolean;
}

export const ShoppingItemPriceHistoryPanel: React.FC<ShoppingItemPriceHistoryPanelProps> = ({
  view,
  onViewChange,
  personalBatches,
  communityPrices,
  isLoading,
  currentStats,
  className = '',
  embedded = false,
}) => {
  const innerContent = (
    <>
      <div className="flex rounded-xl bg-gray-100 p-1 shrink-0">
        <button
          type="button"
          onClick={() => onViewChange('personal')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            view === 'personal'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Miei acquisti ({personalBatches.length})
        </button>
        <button
          type="button"
          onClick={() => onViewChange('community')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            view === 'community'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Community ({communityPrices.length})
        </button>
      </div>

      {currentStats !== undefined && (
        <div className="shrink-0">
          <ShoppingItemPriceAnalysisCard
            currentStats={currentStats}
            view={view}
            hideHeader={true}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 modal-scrollbar min-h-0">
        {isLoading ? (
          <p className="py-8 text-center text-xs text-gray-400">Caricamento storico prezzi...</p>
        ) : view === 'personal' ? (
          personalBatches.length === 0 ? (
            <p className="py-8 text-center text-xs text-gray-400">Nessun acquisto registrato.</p>
          ) : (
            personalBatches.map((b) => {
              const bUnit = formatUnitForQuantity(b.unitName, 1) || (b.unitName ? b.unitName : 'unità');
              return (
                <div
                  key={b.id}
                  className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/80 hover:bg-gray-100/70 transition-colors text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 truncate font-semibold text-gray-800">
                      <StoreIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span className="truncate">{b.supplierName || '—'}</span>
                      {b.brandName && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0 truncate max-w-[100px]">
                          {b.brandName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {b.isOnSale && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                          Offerta
                        </span>
                      )}
                      <span className="font-extrabold text-gray-900 text-xs">
                        € {b.unitPrice != null ? b.unitPrice.toFixed(2) : b.purchasePrice != null ? b.purchasePrice.toFixed(2) : '—'} / {bUnit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500 pt-1 border-t border-gray-200/60">
                    <span className="truncate">
                      Lista: <strong className="font-semibold text-gray-600">{b.listName || 'Senza Lista'}</strong>
                    </span>
                    <span className="shrink-0">{formatToItalianShortDate(b.purchaseDate)}</span>
                  </div>
                </div>
              );
            })
          )
        ) : communityPrices.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-400">Nessun prezzo dalla community.</p>
        ) : (
          communityPrices.map((p, i) => {
            const pUnit = formatUnitForQuantity(p.unitName, 1) || (p.unitName ? p.unitName : 'unità');
            return (
              <div
                key={i}
                className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/80 hover:bg-gray-100/70 transition-colors text-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0 truncate font-semibold text-gray-800">
                    <StoreIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="truncate">{p.supplierName || '—'}</span>
                    {p.brandName && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0 truncate max-w-[100px]">
                        {p.brandName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.isOnSale && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                        Offerta
                      </span>
                    )}
                    <span className="font-extrabold text-gray-900 text-xs">
                      € {p.unitPrice.toFixed(2)} / {pUnit}
                    </span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-gray-400">
                  {formatToItalianShortDate(p.purchaseDate)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );

  if (embedded) {
    return <div className={`space-y-3 ${className}`}>{innerContent}</div>;
  }

  return (
    <div className={`pointer-events-auto bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex flex-col space-y-3 ${className}`}>
      <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <ShoppingIcon className="w-4 h-4 text-blue-600 shrink-0" />
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider truncate">
            {currentStats !== undefined ? 'Storico & Analisi Prezzi' : 'Storico Prezzi Prodotto'}
          </h3>
        </div>
      </div>

      {innerContent}
    </div>
  );
};
