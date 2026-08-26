// src/components/shared/shopping/ShoppingItemRow.tsx
import React from 'react';
import { Check } from 'lucide-react';
import type { ShoppingListItem } from '@/types/shopping';
import { shoppingCardClass } from './shoppingUi';
import { StoreIcon } from '@/components/shared/utils/Icons';
import { formatUnitForQuantity } from './ShoppingUnitSelect';

interface ShoppingItemRowProps {
  item: ShoppingListItem;
  onToggle: (item: ShoppingListItem) => void;
  onOpenDetail?: (item: ShoppingListItem) => void;
  userRole?: string; // 'owner' | 'admin' | 'editor' | 'reader'
}

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const ShoppingItemRow: React.FC<ShoppingItemRowProps> = ({
  item,
  onToggle,
  onOpenDetail,
  userRole = 'owner',
}) => {
  const itemLabel = item.productName || 'articolo';
  const isOwner = userRole === 'owner';
  const isReader = userRole === 'reader';

  // Se l'articolo è già acquistato (chiuso), solo chi non è reader o l'owner può annullare/spuntare
  const canToggleCheck = !isReader && (!item.isPurchased || isOwner);

  const unitDisplay = formatUnitForQuantity(item.unitCodeName, item.quantity);
  const formattedName = capitalizeFirstLetter(item.productName);

  return (
    <div
      onClick={() => onOpenDetail?.(item)}
      className={`${shoppingCardClass} flex items-center justify-between gap-3 p-3 transition-all duration-150 cursor-pointer ${
        item.isPurchased
          ? 'bg-slate-50/60 opacity-60 border-slate-200 hover:opacity-90'
          : 'bg-white hover:border-blue-300 hover:shadow-xs'
      }`}
    >
      {/* 1. CHECKBOX */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (canToggleCheck) onToggle(item);
        }}
        disabled={!canToggleCheck}
        className={[
          'inline-flex min-h-[32px] min-w-[32px] shrink-0 items-center justify-center rounded-full border-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer',
          item.isPurchased
            ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
            : 'border-slate-300 bg-white text-transparent hover:border-emerald-500 hover:text-emerald-500',
          !canToggleCheck ? 'opacity-50 cursor-not-allowed' : '',
        ].join(' ')}
        aria-label={
          item.isPurchased
            ? `Segna ${itemLabel} come da acquistare`
            : `Segna ${itemLabel} come acquistato`
        }
        aria-pressed={item.isPurchased}
      >
        <Check className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* 2. QUANTITÀ CON UNITÀ SINGOLARE/PLURALE */}
      {item.quantity != null ? (
        <span className="shrink-0 px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 capitalize">
          {item.quantity} {unitDisplay}
        </span>
      ) : null}

      {/* 3. NOME PRODOTTO E BRAND (Prima lettera maiuscola) */}
      <div className="min-w-0 flex-1 flex items-center gap-1.5 truncate">
        <p
          className={[
            'truncate text-sm font-semibold',
            item.isPurchased
              ? 'text-slate-400 line-through'
              : 'text-slate-800',
          ].join(' ')}
        >
          {formattedName}
        </p>
        {item.brandName && (
          <span
            className={[
              'shrink-0 text-xs px-1.5 py-0.5 rounded-md font-medium',
              item.isPurchased
                ? 'bg-slate-100 text-slate-400 border border-slate-200 line-through'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-100',
            ].join(' ')}
          >
            {item.brandName}
          </span>
        )}
      </div>

      {/* 4. NOTE (se presenti) */}
      {item.notes ? (
        <div className="hidden md:block max-w-[200px] truncate text-xs text-slate-400 italic">
          "{item.notes}"
        </div>
      ) : null}

      {/* 5. ULTIMO FORNITORE E PREZZO UNITARIO */}
      <div className="shrink-0 flex items-center gap-2 text-xs">
        {item.lastSupplierName && (
          <span className="hidden sm:inline-flex items-center gap-1 font-medium text-slate-600 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
            <StoreIcon className="w-3 h-3 text-orange-500" />
            <span className="truncate max-w-[90px]">{item.lastSupplierName}</span>
          </span>
        )}

        {item.lastPrice != null && (
          <span className="font-bold text-slate-700 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
            € {Number(item.lastPrice).toFixed(2)}
            {item.quantity && item.quantity > 1 ? '/pz' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

export default ShoppingItemRow;