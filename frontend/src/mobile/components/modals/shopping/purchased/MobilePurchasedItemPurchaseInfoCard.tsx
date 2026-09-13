// src/mobile/components/modals/shopping/purchased/MobilePurchasedItemPurchaseInfoCard.tsx
import React from 'react';
import { TagIcon, CalendarIcon } from '@/components/shared/utils/Icons';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';
import type { ShoppingListItem } from '@/types/shopping';

export interface MobilePurchasedItemPurchaseInfoCardProps {
  item: ShoppingListItem;
  purchasePrice: number | null;
  unitPrice: number | null;
  supplierName: string;
  purchaseDate: string | null;
  isOnSale: boolean;
  isLoadingHistory: boolean;
}

export const MobilePurchasedItemPurchaseInfoCard: React.FC<MobilePurchasedItemPurchaseInfoCardProps> = ({
  item,
  purchasePrice,
  unitPrice,
  supplierName,
  purchaseDate,
  isOnSale,
  isLoadingHistory,
}) => {
  return (
    <div className="bg-emerald-50/40 rounded-2xl border border-emerald-200/80 p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
          Dettagli Acquisto
        </span>
        {isOnSale ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <TagIcon className="w-3 h-3 text-amber-600" />
            In Offerta
          </span>
        ) : (
          <span className="text-[11px] font-medium text-gray-500">Prezzo Standard</span>
        )}
      </div>

      {/* Prezzo Totale e Prezzo Unitario */}
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <span className="text-xs text-gray-500 font-medium block">Prezzo Totale</span>
          <span className="text-2xl font-black text-emerald-700">
            {purchasePrice != null
              ? `${purchasePrice.toFixed(2)} €`
              : isLoadingHistory
              ? 'Caricamento...'
              : 'N/D'}
          </span>
        </div>
        {unitPrice != null && (
          <div className="text-right">
            <span className="text-xs text-gray-500 font-medium block">Prezzo Unitario</span>
            <span className="text-sm font-bold text-emerald-800">
              {unitPrice.toFixed(2)} € / {formatUnitForQuantity(item.unitCodeName, 1) || 'unità'}
            </span>
          </div>
        )}
      </div>

      {/* Negozio & Data d'acquisto */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-100/70 text-xs">
        <div className="space-y-0.5">
          <span className="text-gray-500 font-medium flex items-center gap-1">
            🏪 Negozio
          </span>
          <span className="font-bold text-gray-800 block truncate">
            {supplierName}
          </span>
        </div>
        <div className="space-y-0.5 text-right">
          <span className="text-gray-500 font-medium flex items-center justify-end gap-1">
            <CalendarIcon className="w-3 h-3 text-gray-400" /> Data Acquisto
          </span>
          <span className="font-bold text-gray-800 block">
            {purchaseDate ? formatToItalianShortDate(purchaseDate) : isLoadingHistory ? 'Caricamento...' : 'N/D'}
          </span>
        </div>
      </div>
    </div>
  );
};
