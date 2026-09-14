// src/mobile/components/shopping/MobileShoppingItemRows.tsx
import React from 'react';
import { useLongPress } from '@/mobile/hooks/useLongPress';
import type { ShoppingListItem } from '@/types/shopping';

export interface ShoppingItemRowProps {
  item: ShoppingListItem;
  isSelected: boolean;
  isSelectionActive: boolean;
  onToggleSelect: (id: number) => void;
  onOpenDetail: (item: ShoppingListItem) => void;
  onTogglePurchased: (item: ShoppingListItem) => void;
  onOpenPurchase?: (item: ShoppingListItem) => void;
}

export const ShoppingItemRow: React.FC<ShoppingItemRowProps> = ({
  item,
  isSelected,
  isSelectionActive,
  onToggleSelect,
  onOpenDetail,
  onTogglePurchased,
  onOpenPurchase,
}) => {
  const longPressHandlers = useLongPress({
    onLongPress: () => onToggleSelect(item.id),
    onClick: () => {
      if (isSelectionActive) {
        onToggleSelect(item.id);
      } else {
        onOpenDetail(item);
      }
    },
  });

  const checkLongPress = useLongPress({
    stopPropagation: true,
    onLongPress: () => {
      if (onOpenPurchase) {
        onOpenPurchase(item);
      } else {
        onTogglePurchased(item);
      }
    },
    onClick: () => {
      onTogglePurchased(item);
    },
  });

  return (
    <div
      {...longPressHandlers}
      className={`p-2.5 border rounded-xl transition-all shadow-2xs flex items-center gap-2.5 group select-none cursor-pointer ${
        isSelected
          ? 'ring-2 ring-blue-400 ring-inset bg-blue-50/90 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)] relative z-10'
          : 'bg-white border-gray-200 hover:border-blue-300'
      }`}
    >
      <button
        type="button"
        {...checkLongPress}
        className="w-7 h-7 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 active:scale-90 flex items-center justify-center shrink-0 transition-all cursor-pointer"
        title="Spunta rapida (tieni premuto per dettagli acquisto)"
        aria-label={`Acquista ${item.productName}`}
      >
        <span className="opacity-0 group-hover:opacity-30 text-blue-600 text-xs">✓</span>
      </button>

      <div className="flex-1 min-w-0 pointer-events-none">
        <div className="flex items-center justify-between gap-1">
          <h4 className="text-xs font-bold text-gray-900 truncate">
            {item.productName}
          </h4>
          {item.quantity != null && (
            <span className="text-xs font-extrabold text-blue-600 shrink-0">
              {item.quantity} {item.unitCodeName || ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5 truncate">
          {item.brandName && (
            <span className="text-gray-600 font-medium">
              {item.brandName}
            </span>
          )}
          {item.notes && (
            <span className="italic text-gray-400 truncate">
              • {item.notes}
            </span>
          )}
          {item.lastPrice != null && item.lastPrice > 0 && (
            <span className="text-emerald-600 font-semibold ml-auto shrink-0">
              ~{item.lastPrice.toFixed(2)} €
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export interface PurchasedShoppingItemRowProps {
  item: ShoppingListItem;
  isSelected: boolean;
  isSelectionActive: boolean;
  onToggleSelect: (id: number) => void;
  onOpenDetail: (item: ShoppingListItem) => void;
  onTogglePurchased: (item: ShoppingListItem) => void;
}

export const PurchasedShoppingItemRow: React.FC<PurchasedShoppingItemRowProps> = ({
  item,
  isSelected,
  isSelectionActive,
  onToggleSelect,
  onOpenDetail,
  onTogglePurchased,
}) => {
  const longPressHandlers = useLongPress({
    onLongPress: () => onToggleSelect(item.id),
    onClick: () => {
      if (isSelectionActive) {
        onToggleSelect(item.id);
      } else {
        onOpenDetail(item);
      }
    },
  });

  return (
    <div
      {...longPressHandlers}
      className={`p-2.5 border rounded-xl transition-all shadow-2xs flex items-center gap-2.5 select-none cursor-pointer ${
        isSelected
          ? 'ring-2 ring-blue-400 ring-inset bg-blue-50/90 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)] relative z-10'
          : 'bg-gray-50/90 border-gray-200/80 opacity-80'
      }`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onTogglePurchased(item);
        }}
        className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 active:scale-90 transition-all cursor-pointer shadow-2xs"
        title="Annulla acquisto"
        aria-label={`Annulla acquisto ${item.productName}`}
      >
        <span className="text-xs font-bold">✓</span>
      </button>

      <div className="flex-1 min-w-0 pointer-events-none">
        <div className="flex items-center justify-between gap-1">
          <h4 className="text-xs font-bold text-gray-500 line-through truncate">
            {item.productName}
          </h4>
          {item.lastPrice != null && item.lastPrice > 0 && (
            <span className="text-xs font-extrabold text-emerald-700 shrink-0">
              {item.lastPrice.toFixed(2)} €
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5 truncate">
          {item.quantity != null && (
            <span>
              Q.tà: {item.quantity} {item.unitCodeName || ''}
            </span>
          )}
          {item.lastSupplierName && <span>• {item.lastSupplierName}</span>}
        </div>
      </div>
    </div>
  );
};
