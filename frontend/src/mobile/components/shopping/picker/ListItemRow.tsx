// src/mobile/components/shopping/picker/ListItemRow.tsx
import React from 'react';
import type { ShoppingListSummary } from '@/types/shopping';
import { InfoIcon } from '@/components/shared/utils/Icons';
import { useLongPress } from '@/mobile/hooks/useLongPress';

export interface ListItemRowProps {
  list: ShoppingListSummary;
  isCurrent: boolean;
  isSelected: boolean;
  isSelectionActive: boolean;
  onSelect: (listId: number) => void;
  onToggleSelect: (listKey: string) => void;
  onOpenDetail: (list: ShoppingListSummary) => void;
}

export const ListItemRow: React.FC<ListItemRowProps> = ({
  list,
  isCurrent,
  isSelected,
  isSelectionActive,
  onSelect,
  onToggleSelect,
  onOpenDetail,
}) => {
  const listKey = `list-${list.id}`;
  const longPressHandlers = useLongPress({
    onLongPress: () => onToggleSelect(listKey),
    onClick: () => {
      if (isSelectionActive) {
        onToggleSelect(listKey);
      } else {
        onSelect(list.id);
      }
    },
  });

  const isEmpty =
    (list.openItemsCount ?? 0) === 0 && (list.purchasedItemsCount ?? 0) === 0;

  return (
    <div
      {...longPressHandlers}
      className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer select-none active:scale-[0.99] ${
        isSelected
          ? 'ring-2 ring-blue-400 ring-inset bg-blue-50/90 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)] relative z-10 text-gray-900'
          : isCurrent
          ? 'bg-blue-600 text-white shadow-xs font-bold'
          : 'bg-white text-gray-800 border border-gray-200/90 hover:border-blue-300 font-medium'
      }`}
    >
      <div className="min-w-0 flex-1 pr-2 pointer-events-none">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm truncate min-w-0 flex-1" title={list.name}>
            {list.name}
          </span>
          {list.isCompleted && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                isCurrent && !isSelected ? 'bg-blue-500 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              ✓ Completata
            </span>
          )}
        </div>
        <p
          className={`text-[11px] mt-0.5 truncate ${
            isCurrent && !isSelected ? 'text-blue-100' : 'text-gray-400'
          }`}
        >
          {isEmpty
            ? 'Vuota'
            : `${list.openItemsCount} da comprare • ${list.purchasedItemsCount} presi`}
        </p>
      </div>

      {/* Tasto icon-only per aprire i dettagli della lista */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetail(list);
        }}
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
          isCurrent && !isSelected
            ? 'text-white/80 hover:text-white hover:bg-white/20'
            : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'
        }`}
        title="Dettagli e Modifica lista"
        aria-label={`Dettagli ${list.name}`}
      >
        <InfoIcon className="w-4 h-4" />
      </button>
    </div>
  );
};
