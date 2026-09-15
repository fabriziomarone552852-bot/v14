import React, { useState } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { TagIcon, ShoppingIcon } from '@/components/shared/utils/Icons';
import type { ProductPriceSummary } from './ShoppingPriceTableRow';
import type { ItemBatchRecord } from '@/types/shopping';
import LookbackUnitSelect, { type LookbackUnit } from '@/components/shared/shopping/LookbackUnitSelect';
import {
  useProductPriceModalStats,
  ProductPriceSummaryCards,
  ProductPriceSidePanel,
} from './price';
import ShoppingEditBatchModal from './price/ShoppingEditBatchModal';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';

export type { LookbackUnit };

export interface ShoppingProductPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  productSummary: ProductPriceSummary | null;
}

export const ShoppingProductPriceModal: React.FC<ShoppingProductPriceModalProps> = ({
  isOpen,
  onClose,
  productSummary,
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
    communityPrices,
    isLoadingCommunity,
    personalBatches,
    commonUnitDisplay,
    stats,
  } = useProductPriceModalStats({
    isOpen,
    productSummary,
  });

  if (!isOpen || !productSummary) return null;

  const brandName = productSummary.batches?.[0]?.brandName || null;

  const sidePanel = (
    <ProductPriceSidePanel
      view={view}
      setView={setView}
      personalBatches={personalBatches}
      communityPrices={communityPrices}
      isLoadingCommunity={isLoadingCommunity}
      onEditBatch={(b) => setEditingBatch(b)}
      onDeleteBatch={async (batchId) => {
        await mutations.deleteInventoryBatch({ batchId, listId: 0 });
      }}
    />
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-blue-600" />
          <span className="text-base font-bold text-gray-800">
            Andamento Prezzo
          </span>
        </div>
      }
      sidePanel={sidePanel}
      maxWidthClass="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Info Principale Prodotto */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-100/60 border border-blue-200 text-blue-700 flex items-center justify-center text-xl shrink-0">
              <ShoppingIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-gray-900 truncate" title={productSummary.productName}>
                {productSummary.productName}
              </h3>
              {brandName && (
                <span className="inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                  {brandName}
                </span>
              )}
            </div>
          </div>

          {/* Selettore Finestra Temporale */}
          <div className="shrink-0 flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              max="99"
              value={lookbackValue}
              onChange={(e) => setLookbackValue(Math.max(1, Number(e.target.value) || 1))}
              className="w-12 px-2 py-1.5 text-xs font-bold text-center bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
            <LookbackUnitSelect
              value={lookbackUnit}
              onChange={(u) => setLookbackUnit(u)}
            />
          </div>
        </div>

        {/* Griglia Card Statistiche */}
        <ProductPriceSummaryCards
          stats={stats}
          commonUnitDisplay={commonUnitDisplay}
          currency="€"
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
            onDelete={async (batchId) => {
              await mutations.deleteInventoryBatch({
                batchId,
                listId: 0,
              });
            }}
          />
        )}
      </div>
    </BaseModal>
  );
};

export default ShoppingProductPriceModal;
