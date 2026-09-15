import React from 'react';
import { ShoppingIcon, StoreIcon, EditIcon, TrashIcon } from '@/components/shared/utils/Icons';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import type { ItemBatchRecord, CommunityPriceRecord } from '@/types/shopping';
import type { PriceSourceTab } from './useMobileProductPriceStats';

export interface MobileProductPriceBatchesListProps {
  view: PriceSourceTab;
  setView: (v: PriceSourceTab) => void;
  personalBatches: ItemBatchRecord[];
  communityPrices: CommunityPriceRecord[];
  isLoadingCommunity: boolean;
  onEditBatch?: (batch: ItemBatchRecord) => void;
  onDeleteBatch?: (batchId: number) => void;
}

export const MobileProductPriceBatchesList: React.FC<MobileProductPriceBatchesListProps> = ({
  view,
  setView,
  personalBatches,
  communityPrices,
  isLoadingCommunity,
  onEditBatch,
  onDeleteBatch,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setView('personal')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
            view === 'personal'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          I miei acquisti ({personalBatches.length})
        </button>
        <button
          type="button"
          onClick={() => setView('community')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
            view === 'community'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Community ({communityPrices.length})
        </button>
      </div>

      {/* Elenco Rilevazioni Storiche */}
      <div className="space-y-2">
        {view === 'personal' ? (
          personalBatches.length === 0 ? (
            <p className="py-12 text-center text-xs text-gray-400 bg-white border border-gray-200 rounded-xl">
              Nessun acquisto personale registrato.
            </p>
          ) : (
            personalBatches.map((b) => {
              const uPrice = b.unitPrice != null ? b.unitPrice : b.purchasePrice;
              const bUnit = formatUnitForQuantity(b.unitName, 1) || b.unitName || 'unità';
              return (
                <div
                  key={b.id}
                  className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-2xs space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-gray-500 uppercase pb-1 border-b border-gray-100">
                    <span className="flex items-center gap-1.5 truncate">
                      <ShoppingIcon className="w-3 h-3 text-blue-500 shrink-0" />
                      <span className="truncate">{b.listName || 'Senza Lista'}</span>
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-gray-400 font-normal">
                        {formatToItalianShortDate(b.purchaseDate)}
                      </span>
                      {onEditBatch && (
                        <button
                          type="button"
                          onClick={() => onEditBatch(b)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Modifica rilevazione"
                        >
                          <EditIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteBatch && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Sei sicuro di voler eliminare questa rilevazione di prezzo?')) {
                              onDeleteBatch(b.id);
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Elimina rilevazione"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <StoreIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      <span className="font-semibold text-gray-800 truncate text-xs">
                        {b.supplierName || 'Negozio non spec.'}
                      </span>
                      {b.notes && (
                        <span className="text-[10px] text-gray-400 truncate italic">
                          · {b.notes}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {b.isOnSale && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                          Offerta
                        </span>
                      )}
                      <span className="font-extrabold text-gray-900 text-xs sm:text-sm">
                        €{uPrice != null ? uPrice.toFixed(2) : '—'}
                        <span className="text-[10px] font-normal text-gray-500">/{bUnit}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : isLoadingCommunity ? (
          <p className="py-12 text-center text-xs text-gray-400 bg-white border border-gray-200 rounded-xl">
            Caricamento storico prezzi community...
          </p>
        ) : communityPrices.length === 0 ? (
          <p className="py-12 text-center text-xs text-gray-400 bg-white border border-gray-200 rounded-xl">
            Nessun prezzo dalla community per questo prodotto.
          </p>
        ) : (
          communityPrices.map((cp, idx) => {
            const cpUnit = formatUnitForQuantity(cp.unitName, 1) || cp.unitName || 'unità';
            return (
              <div
                key={idx}
                className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-2xs text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <StoreIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="font-semibold text-gray-800 truncate text-xs">
                      {cp.supplierName || 'Negozio'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-normal shrink-0">
                      · {formatToItalianShortDate(cp.purchaseDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {cp.isOnSale && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                        Offerta
                      </span>
                    )}
                    <span className="font-extrabold text-gray-900 text-xs sm:text-sm">
                      €{cp.unitPrice.toFixed(2)}
                      <span className="text-[10px] font-normal text-gray-500">/{cpUnit}</span>
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
