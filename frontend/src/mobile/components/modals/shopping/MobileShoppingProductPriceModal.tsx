import React, { useState } from 'react';
import MobileBaseModal from '../MobileBaseModal';
import { TagIcon, CalendarIcon } from '@/components/shared/utils/Icons';
import type { ProductPriceSummary } from '@/components/archive/shopping/ShoppingPriceTableRow';
import type { ItemBatchRecord } from '@/types/shopping';
import LookbackUnitSelect, { type LookbackUnit } from '@/components/shared/shopping/LookbackUnitSelect';
import {
  useMobileProductPriceStats,
  MobileProductPriceSummaryCards,
  MobileProductPriceBatchesList,
} from './price';
import ShoppingEditBatchModal from '@/components/archive/shopping/price/ShoppingEditBatchModal';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';

export type { LookbackUnit };

export interface MobileShoppingProductPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  productSummary: ProductPriceSummary | null;
  zIndexClass?: string;
}

export const MobileShoppingProductPriceModal: React.FC<MobileShoppingProductPriceModalProps> = ({
  isOpen,
  onClose,
  productSummary,
  zIndexClass = 'z-[10010]',
}) => {
  const mutations = useShoppingMutations();
  const [editingBatch, setEditingBatch] = useState<ItemBatchRecord | null>(null);

  const {
    lookbackValue,
    setLookbackValue,
    lookbackUnit,
    setLookbackUnit,
    view,
    setView,
    personalBatches,
    communityPrices,
    isLoadingCommunity,
    commonUnitDisplay,
    stats,
  } = useMobileProductPriceStats({
    isOpen,
    productSummary,
  });

  if (!isOpen || !productSummary) return null;

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={onClose}
      zIndexClass={zIndexClass}
      title={
        <div className="flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="truncate">Statistiche Prezzo</span>
        </div>
      }
    >
      <div className="space-y-3.5 text-xs max-w-lg mx-auto pb-6">
        {/* Info Principale Prodotto */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-200/90 shadow-2xs">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-emerald-200 bg-emerald-100 text-emerald-700 text-lg font-extrabold shrink-0">
            <TagIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-gray-900 truncate">
              {productSummary.productName}
            </h3>
            {commonUnitDisplay && (
              <p className="text-[11px] text-gray-500 mt-0.5">
                Unità registrata: <span className="font-bold text-gray-700">{commonUnitDisplay}</span>
              </p>
            )}
          </div>
        </div>

        {/* Selettore Periodo di Riferimento */}
        <div className="p-3 bg-white rounded-2xl border border-gray-200/90 shadow-2xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Periodo di Calcolo</span>
          </span>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-gray-500 font-medium shrink-0">Ultimi</span>
            <input
              type="number"
              min={1}
              max={999}
              value={lookbackValue}
              onChange={(e) => setLookbackValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-14 px-2 py-1.5 text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl text-center focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <LookbackUnitSelect
              value={lookbackUnit}
              onChange={(newUnit) => setLookbackUnit(newUnit)}
              className="flex-1"
            />
          </div>
        </div>

        {/* Card Statistiche Prezzi */}
        <MobileProductPriceSummaryCards view={view} stats={stats} />

        {/* Switcher Schede Storico & Elenco */}
        <MobileProductPriceBatchesList
          view={view}
          setView={setView}
          personalBatches={personalBatches}
          communityPrices={communityPrices}
          isLoadingCommunity={isLoadingCommunity}
          onEditBatch={(b) => setEditingBatch(b)}
          onDeleteBatch={async (batchId) => {
            await mutations.deleteInventoryBatch({
              batchId,
              listId: 0,
            });
          }}
        />

        {/* Modale Modifica/Eliminazione Rilevazione Prezzo */}
        {editingBatch && (
          <ShoppingEditBatchModal
            isOpen={Boolean(editingBatch)}
            batch={editingBatch}
            onClose={() => setEditingBatch(null)}
            onSave={async (batchId, data) => {
              await mutations.updateInventoryBatch({
                batchId,
                listId: 0,
                data: {
                  purchasePrice: data.purchasePrice,
                  purchaseDate: data.purchaseDate,
                  quantity: data.quantityPurchased,
                  supplierId: data.supplierId,
                  isOnSale: data.isOnSale,
                },
              });
            }}
          />
        )}
      </div>
    </MobileBaseModal>
  );
};

export default MobileShoppingProductPriceModal;
