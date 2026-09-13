// src/mobile/components/modals/shopping/supplier/MobileSupplierBatchesList.tsx
import React from 'react';
import { StoreIcon, TagIcon } from '@/components/shared/utils/Icons';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import type { ItemBatchRecord } from '@/types/shopping';

export interface MobileSupplierBatchesListProps {
  batches: ItemBatchRecord[];
}

export const MobileSupplierBatchesList: React.FC<MobileSupplierBatchesListProps> = ({
  batches,
}) => {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5 mb-2.5">
        <TagIcon className="w-3.5 h-3.5 text-gray-400" />
        <span>Acquisti Registrati ({batches.length})</span>
      </h4>

      <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-0.5">
        {batches.length === 0 ? (
          <div className="py-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-gray-200/80 p-4">
            <StoreIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="font-bold text-xs text-gray-600">Nessun acquisto registrato in questo negozio.</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Quando registrerai una spesa per questo negozio, comparirà qui lo storico.
            </p>
          </div>
        ) : (
          batches.map((batch) => {
            const quantityNum = batch.quantityPurchased != null ? batch.quantityPurchased : 1;
            const unitFormatted = batch.unitName
              ? formatUnitForQuantity(batch.unitName, quantityNum) || batch.unitName
              : '';
            const quantityDisplay = `${quantityNum}${unitFormatted ? ` ${unitFormatted}` : ''}`;

            const totalPrice =
              batch.purchasePrice != null
                ? batch.purchasePrice
                : batch.unitPrice != null
                ? batch.unitPrice * quantityNum
                : null;

            return (
              <div
                key={batch.id}
                className="p-3 rounded-xl border border-gray-200 bg-white hover:border-blue-200 transition-colors flex items-center justify-between gap-3 text-xs shadow-2xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 truncate text-xs">
                    {batch.productName || 'Prodotto'}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                    <span>{formatToItalianShortDate(batch.purchaseDate)}</span>
                    {batch.listName && (
                      <>
                        <span>•</span>
                        <span className="truncate">Lista: {batch.listName}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  {batch.isOnSale && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                      Offerta
                    </span>
                  )}

                  <div className="flex flex-col items-end gap-0.5">
                    <span className="font-extrabold text-gray-900 text-xs">
                      {totalPrice != null ? `€ ${totalPrice.toFixed(2)}` : '—'}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500">
                      {quantityDisplay}
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
