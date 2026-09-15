import React from 'react';
import { TagIcon, StoreIcon, EditIcon, TrashIcon } from '@/components/shared/utils/Icons';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import type { CommunityPriceRecord, ItemBatchRecord } from '@/types/shopping';
import type { PriceSourceTab } from './useProductPriceModalStats';

export interface ProductPriceSidePanelProps {
  view: PriceSourceTab;
  setView: (v: PriceSourceTab) => void;
  personalBatches: ItemBatchRecord[];
  communityPrices: CommunityPriceRecord[];
  isLoadingCommunity: boolean;
  onEditBatch?: (batch: ItemBatchRecord) => void;
  onDeleteBatch?: (batchId: number) => void;
}

export const ProductPriceSidePanel: React.FC<ProductPriceSidePanelProps> = ({
  view,
  setView,
  personalBatches,
  communityPrices,
  isLoadingCommunity,
  onEditBatch,
  onDeleteBatch,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-100 flex flex-col h-full w-full text-xs overflow-hidden">
      <div className="pb-2 border-b border-gray-100 mb-3 flex items-center justify-between">
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
          Storico Rilevazioni
        </h4>
        <span className="text-[11px] font-semibold text-gray-400">
          {view === 'personal' ? personalBatches.length : communityPrices.length} registrati
        </span>
      </div>

      {/* Switcher Schede Storico */}
      <div className="flex rounded-xl bg-gray-100 p-1 mb-3 shrink-0">
        <button
          type="button"
          onClick={() => setView('personal')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            view === 'personal'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          I Miei Acquisti ({personalBatches.length})
        </button>
        <button
          type="button"
          onClick={() => setView('community')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            view === 'community'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Community ({communityPrices.length})
        </button>
      </div>

      {/* Elenco Rilevazioni */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[220px]">
        {view === 'personal' ? (
          personalBatches.length === 0 ? (
            <p className="py-8 text-center text-xs text-gray-400">
              Nessun acquisto personale registrato per questo prodotto.
            </p>
          ) : (
            personalBatches.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-gray-900">
                    {b.purchasePrice != null ? `${b.purchasePrice.toFixed(2)} €` : 'Prezzo N/D'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {b.isOnSale && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        <TagIcon className="w-3 h-3 text-amber-600" />
                        Offerta
                      </span>
                    )}
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

                <div className="flex items-center justify-between text-gray-500 text-[11px]">
                  <span className="flex items-center gap-1 truncate" title={b.supplierName || 'Non specificato'}>
                    <StoreIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{b.supplierName || 'Non specificato'}</span>
                  </span>
                  <span>{b.purchaseDate ? formatToItalianShortDate(b.purchaseDate) : 'N/D'}</span>
                </div>

                {b.quantityPurchased && (
                  <div className="flex items-center justify-between text-gray-400 text-[10px] pt-1 border-t border-gray-100">
                    <span>Q.tà: {b.quantityPurchased} {b.unitName || ''}</span>
                    {b.unitPrice != null && (
                      <span>({b.unitPrice.toFixed(2)} € / {b.unitName || 'unità'})</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )
        ) : isLoadingCommunity ? (
          <p className="py-8 text-center text-xs text-gray-400">Caricamento dati community...</p>
        ) : communityPrices.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-400">
            Nessuna rilevazione condivisa disponibile per questo prodotto.
          </p>
        ) : (
          communityPrices.map((cp, idx) => (
            <div
              key={`${cp.purchaseDate}-${cp.supplierId ?? ''}-${idx}`}
              className="p-3 rounded-xl border border-gray-100 bg-blue-50/30 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-blue-950">
                  {cp.unitPrice != null ? `${cp.unitPrice.toFixed(2)} €` : 'N/D'}
                </span>
                {cp.isOnSale && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    <TagIcon className="w-3 h-3 text-amber-600" />
                    Offerta
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-gray-500 text-[11px]">
                <span className="flex items-center gap-1 truncate" title={cp.supplierName || 'Negozio non specificato'}>
                  <StoreIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{cp.supplierName || 'Negozio non specificato'}</span>
                </span>
                <span>{cp.purchaseDate ? formatToItalianShortDate(cp.purchaseDate) : 'N/D'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
