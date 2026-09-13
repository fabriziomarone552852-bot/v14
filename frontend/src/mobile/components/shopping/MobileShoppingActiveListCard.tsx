// src/mobile/components/shopping/MobileShoppingActiveListCard.tsx
import React from 'react';
import { ShoppingItemRow, PurchasedShoppingItemRow } from './MobileShoppingItemRows';
import { MobileShoppingQuickAddBar } from './MobileShoppingQuickAddBar';
import { MobileShoppingNoListEmptyState } from './MobileShoppingNoListEmptyState';
import type { ConfigOption, ShoppingListItem, ShoppingListSummary } from '@/types/shopping';
import type { useShoppingItemsColumn } from '@/components/shared/shopping/useShoppingItemsColumn';

export interface MobileShoppingActiveListCardProps {
  activeListId: number | null;
  activeList: ShoppingListSummary | null;
  canCreateItem: boolean;
  columnLogic: ReturnType<typeof useShoppingItemsColumn>;
  unitOptions: ConfigOption[];
  openItems: ShoppingListItem[];
  purchasedItems: ShoppingListItem[];
  isShoppingItemsSelection: boolean;
  selectedIds: (number | string)[];
  onOpenPicker: () => void;
  onOpenQuickPrice: () => void;
  onToggleSelectShoppingItem: (id: number) => void;
}

export const MobileShoppingActiveListCard: React.FC<MobileShoppingActiveListCardProps> = ({
  activeListId,
  activeList,
  canCreateItem,
  columnLogic,
  unitOptions,
  openItems,
  purchasedItems,
  isShoppingItemsSelection,
  selectedIds,
  onOpenPicker,
  onOpenQuickPrice,
  onToggleSelectShoppingItem,
}) => {
  return (
    <div className="flex-1 min-h-0 w-full bg-white border border-gray-200/90 rounded-2xl shadow-2xs p-2.5 flex flex-col justify-between overflow-hidden">
      {!activeListId || !activeList ? (
        <MobileShoppingNoListEmptyState
          onOpenPicker={onOpenPicker}
          onOpenQuickPrice={onOpenQuickPrice}
        />
      ) : (
        <>
          {/* MINI QUICK ADD BAR (Fissa in alto) */}
          {canCreateItem && (
            <MobileShoppingQuickAddBar
              columnLogic={columnLogic}
              unitOptions={unitOptions}
            />
          )}

          {/* AREA ARTICOLI CON SCROLL INTERNO FLUIDO */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pt-2 space-y-2">
            {/* Stato Vuoto se 0 articoli totali */}
            {openItems.length === 0 && purchasedItems.length === 0 && (
              <div className="py-8 px-4 bg-gray-50/70 border border-dashed border-gray-200 rounded-2xl text-center my-2">
                <p className="text-xs font-semibold text-gray-600">
                  Nessun articolo nella lista! 🎉
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Usa la barra sopra per aggiungere prodotti alla spesa.
                </p>
              </div>
            )}

            {/* 🛒 PRODOTTI DA COMPRARE */}
            {openItems.length > 0 && (
              <div className="space-y-1.5">
                {openItems.map((item) => (
                  <ShoppingItemRow
                    key={item.id}
                    item={item}
                    isSelected={isShoppingItemsSelection && selectedIds.includes(item.id)}
                    isSelectionActive={isShoppingItemsSelection}
                    onToggleSelect={onToggleSelectShoppingItem}
                    onOpenDetail={(it) => columnLogic.detailModal.open(it)}
                    onTogglePurchased={(it) => columnLogic.handleTogglePurchased(it)}
                  />
                ))}
              </div>
            )}

            {/* ✅ PRODOTTI ACQUISTATI */}
            {purchasedItems.length > 0 && (
              <>
                <div className="pt-2 pb-1 flex items-center gap-2">
                  <div className="h-px bg-gray-200 flex-1" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Acquistati
                  </span>
                  <div className="h-px bg-gray-200 flex-1" />
                </div>

                <div className="space-y-1.5">
                  {purchasedItems.map((item) => (
                    <PurchasedShoppingItemRow
                      key={item.id}
                      item={item}
                      isSelected={isShoppingItemsSelection && selectedIds.includes(item.id)}
                      isSelectionActive={isShoppingItemsSelection}
                      onToggleSelect={onToggleSelectShoppingItem}
                      onOpenDetail={(it) => columnLogic.purchasedDetailModal.open(it)}
                      onTogglePurchased={(it) => columnLogic.handleTogglePurchased(it)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MobileShoppingActiveListCard;
