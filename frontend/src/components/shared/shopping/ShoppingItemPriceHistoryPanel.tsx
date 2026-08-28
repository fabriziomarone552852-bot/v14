// src/components/shared/shopping/ShoppingItemPriceHistoryPanel.tsx
import React from 'react';
import type { ItemBatchRecord, CommunityPriceRecord } from '@/types/shopping';
import { ShoppingIcon, StoreIcon } from '@/components/shared/utils/Icons';
import { formatUnitForQuantity } from './ShoppingUnitSelect';
import { formatToItalianShortDate } from '@/utils/dateUtils';

export interface ShoppingItemPriceHistoryPanelProps {
  view: 'personal' | 'community';
  onViewChange: (view: 'personal' | 'community') => void;
  personalBatches: ItemBatchRecord[];
  communityPrices: CommunityPriceRecord[];
  isLoading: boolean;
}

export const ShoppingItemPriceHistoryPanel: React.FC<ShoppingItemPriceHistoryPanelProps> = ({
  view,
  onViewChange,
  personalBatches,
  communityPrices,
  isLoading,
}) => {
  return (
    <div className="pointer-events-auto flex-1 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col max-h-[85vh]">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingIcon className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Storico Prezzi Prodotto
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-gray-400">
          {view === 'personal' ? personalBatches.length : communityPrices.length} rilevazioni
        </span>
      </div>

      <div className="flex rounded-xl bg-gray-100 p-1 mb-3 shrink-0">
        <button
          type="button"
          onClick={() => onViewChange('personal')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            view === 'personal'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          I miei acquisti ({personalBatches.length})
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
          Dalla community ({communityPrices.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0">
        {isLoading ? (
          <p className="py-16 text-center text-xs text-gray-400">Caricamento storico prezzi...</p>
        ) : view === 'personal' ? (
          personalBatches.length === 0 ? (
            <p className="py-16 text-center text-xs text-gray-400">Nessun acquisto registrato.</p>
          ) : (
            personalBatches.map((b) => {
              const bUnit = formatUnitForQuantity(b.unitName, 1) || (b.unitName ? b.unitName : 'unità');
              return (
                <div
                  key={b.id}
                  className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/80 hover:bg-gray-100/70 transition-colors text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider pb-1 border-b border-gray-200/60">
                    <span className="flex items-center gap-1.5 truncate">
                      <ShoppingIcon className="w-3 h-3 text-blue-500 shrink-0" />
                      <span className="truncate">Lista: {b.listName || 'Senza Lista'}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-[1.3fr_1fr_1fr] sm:grid-cols-[1.4fr_1fr_1fr] items-center gap-2 text-xs">
                    <div className="text-left text-gray-500 font-medium text-[11px] truncate flex items-center gap-1.5 min-w-0">
                      <span className="shrink-0">{formatToItalianShortDate(b.purchaseDate)}</span>
                      {b.notes && (
                        <span
                          className="text-[11px] text-gray-400 font-normal truncate italic"
                          title={b.notes}
                        >
                          · {b.notes}
                        </span>
                      )}
                    </div>
                    <div className="text-center font-semibold text-gray-700 flex items-center justify-center gap-1.5 min-w-0 truncate">
                      <StoreIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span className="truncate">{b.supplierName || '—'}</span>
                      {b.brandName && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0 truncate">
                          {b.brandName}
                        </span>
                      )}
                    </div>
                    <div className="text-right flex items-center justify-end gap-1.5">
                      {b.isOnSale && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                          Offerta
                        </span>
                      )}
                      <span className="font-extrabold text-gray-900 text-xs sm:text-sm shrink-0">
                        € {b.unitPrice != null ? b.unitPrice.toFixed(2) : b.purchasePrice != null ? b.purchasePrice.toFixed(2) : '—'} / {bUnit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : communityPrices.length === 0 ? (
          <p className="py-16 text-center text-xs text-gray-400">Nessun prezzo dalla community.</p>
        ) : (
          communityPrices.map((p, i) => {
            const pUnit = formatUnitForQuantity(p.unitName, 1) || (p.unitName ? p.unitName : 'unità');
            return (
              <div
                key={i}
                className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/80 hover:bg-gray-100/70 transition-colors text-xs"
              >
                <div className="grid grid-cols-3 items-center gap-2 text-xs">
                  <div className="text-left text-gray-500 font-medium text-[11px] truncate">
                    {formatToItalianShortDate(p.purchaseDate)}
                  </div>
                  <div className="text-center font-semibold text-gray-700 flex items-center justify-center gap-1.5 min-w-0 truncate">
                    <StoreIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="truncate">{p.supplierName || '—'}</span>
                    {p.brandName && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0 truncate">
                        {p.brandName}
                      </span>
                    )}
                  </div>
                  <div className="text-right flex items-center justify-end gap-1.5">
                    {p.isOnSale && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                        Offerta
                      </span>
                    )}
                    <span className="font-extrabold text-gray-900 text-xs sm:text-sm shrink-0">
                      € {p.unitPrice.toFixed(2)} / {pUnit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
