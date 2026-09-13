// src/mobile/components/shopping/omni/OmniSearchItemsInListsSection.tsx
import React from 'react';
import { CheckCircleIcon } from '@/components/shared/utils/Icons';
import type { ShoppingListItem } from '@/types/shopping';

export interface OmniSearchItemsInListsSectionProps {
  items: ShoppingListItem[];
  onSelectList: (listId: number) => void;
  onClose: () => void;
}

export const OmniSearchItemsInListsSection: React.FC<OmniSearchItemsInListsSectionProps> = ({
  items,
  onSelectList,
  onClose,
}) => {
  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 mb-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
        <CheckCircleIcon className="w-3.5 h-3.5" />
        <span>Articoli nelle Liste ({items.length})</span>
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div
            key={`${item.shoppingListId}-${item.id}`}
            onClick={() => {
              if (item.shoppingListId) {
                onSelectList(item.shoppingListId);
              }
              onClose();
            }}
            className="p-3 bg-white border border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 rounded-xl flex items-center justify-between transition-all shadow-2xs cursor-pointer"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-gray-800 truncate">{item.productName}</h4>
                {item.isPurchased && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 shrink-0">
                    Acquistato
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 block truncate mt-0.5">
                {item.quantity ? `Q.tà: ${item.quantity} ${item.unitCodeName || ''} ` : ''}
                {item.brandName ? `• ${item.brandName} ` : ''}
                {item.listName ? `• Lista: ${item.listName}` : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
