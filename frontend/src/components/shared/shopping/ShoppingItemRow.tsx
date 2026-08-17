// src/components/shared/shopping/ShoppingItemRow.tsx
import React from 'react';
import { Pencil, Trash2, Receipt, Check, BarChart2 } from 'lucide-react';
import type { ShoppingListItem } from '@/types/shopping';
import {
  shoppingCardClass,
  shoppingIconButtonClass,
} from './shoppingUi';

interface ShoppingItemRowProps {
  item: ShoppingListItem;
  onToggle: (item: ShoppingListItem) => void;
  onEdit: (item: ShoppingListItem) => void;
  onDelete: (item: ShoppingListItem) => void;
  onPurchase: (item: ShoppingListItem) => void;
  onOpenSuggestions?: (item: ShoppingListItem) => void;
  userRole?: string; // 'owner' | 'admin' | 'editor' | 'reader'
}

const ShoppingItemRow: React.FC<ShoppingItemRowProps> = ({
  item,
  onToggle,
  onEdit,
  onDelete,
  onPurchase,
  onOpenSuggestions,
  userRole = 'owner',
}) => {
  const itemLabel = item.productName || 'articolo';
  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin';
  const isEditor = userRole === 'editor';
  const isReader = userRole === 'reader';

  // L'Editor non ha alcun privilegio di editing sugli articoli.
  // Admin può editare gli articoli solo se aperti (!item.isPurchased). Owner sempre.
  const canEdit = isOwner || (isAdmin && !item.isPurchased);

  // Solo l'owner del gruppo può eliminare gli articoli della lista
  const canDelete = isOwner;

  // Se l'articolo è già acquistato (chiuso), solo l'owner può annullare l'acquisto / deselezionarlo
  const canToggleCheck = !isReader && (!item.isPurchased || isOwner);

  return (
    <div className={`${shoppingCardClass} flex flex-col gap-2 p-3 transition hover:border-slate-300`}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => canToggleCheck && onToggle(item)}
          disabled={!canToggleCheck}
          className={[
            'inline-flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-full border-2 transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1',
            item.isPurchased
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 bg-white text-transparent hover:border-emerald-400',
            !canToggleCheck ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
          aria-label={
            item.isPurchased
              ? `Segna ${itemLabel} come non acquistato`
              : `Segna ${itemLabel} come acquistato`
          }
          aria-pressed={item.isPurchased}
        >
          <Check className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={[
              'truncate text-sm font-semibold',
              item.isPurchased
                ? 'text-slate-400 line-through'
                : 'text-slate-800',
            ].join(' ')}
          >
            {item.productName}
          </p>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            {item.quantity != null ? (
              <span className="font-medium">
                Qtà: {item.quantity}
                {item.unitCodeName ? ` ${item.unitCodeName}` : ''}
              </span>
            ) : null}

            {item.notes ? <span className="truncate italic">"{item.notes}"</span> : null}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1">
          {onOpenSuggestions ? (
            <button
              type="button"
              onClick={() => onOpenSuggestions(item)}
              className={`${shoppingIconButtonClass} border-blue-200 text-blue-600 hover:bg-blue-50`}
              title="Vedi suggerimenti e storico prezzi"
            >
              <BarChart2 className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}

          {!isReader && !item.isPurchased ? (
            <button
              type="button"
              onClick={() => onPurchase(item)}
              className={shoppingIconButtonClass}
              title={`Registra acquisto per ${itemLabel}`}
            >
              <Receipt className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}

          {canEdit ? (
            <button
              type="button"
              onClick={() => onEdit(item)}
              className={shoppingIconButtonClass}
              title={`Modifica ${itemLabel}`}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}

          {canDelete ? (
            <button
              type="button"
              onClick={() => onDelete(item)}
              className={[
                shoppingIconButtonClass,
                'border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 focus:ring-red-100',
              ].join(' ')}
              title={`Elimina ${itemLabel}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ShoppingItemRow;