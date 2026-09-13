// src/mobile/components/modals/shopping/list/MobileShoppingListDetailItemsList.tsx
import React from 'react';
import { ShoppingIcon, CheckCircleIcon, SearchIcon } from '@/components/shared/utils/Icons';
import type { ShoppingListItem } from '@/types/shopping';
import type { ItemFilterStatus } from './useMobileShoppingListDetailLogic';

export interface MobileShoppingListDetailItemsListProps {
  items: ShoppingListItem[];
  filteredItems: ShoppingListItem[];
  filterStatus: ItemFilterStatus;
  setFilterStatus: (status: ItemFilterStatus) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onTogglePurchased: (item: ShoppingListItem, e: React.MouseEvent) => void;
}

export const MobileShoppingListDetailItemsList: React.FC<MobileShoppingListDetailItemsListProps> = ({
  items,
  filteredItems,
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
  onTogglePurchased,
}) => {
  const openCount = items.filter((it) => !it.isPurchased).length;
  const completedCount = items.filter((it) => it.isPurchased).length;

  return (
    <>
      {/* Toolbar con Ricerca e Switcher Stato */}
      <div className="space-y-2">
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs w-full">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer text-center text-xs ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tutti ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('open')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer text-center text-xs ${
              filterStatus === 'open'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Da fare ({openCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('completed')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition cursor-pointer text-center text-xs ${
              filterStatus === 'completed'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Presi ({completedCount})
          </button>
        </div>

        <div className="relative w-full">
          <SearchIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca articoli nella lista..."
            className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Elenco Articoli Spesa */}
      <div className="space-y-1.5">
        {filteredItems.length === 0 ? (
          <div className="py-10 text-center text-slate-400 bg-white border border-gray-200 rounded-xl">
            <ShoppingIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-semibold">Nessun articolo trovato in questa lista.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const qtyDisplay = item.quantity != null ? `${item.quantity}` : '';
            const unitDisplay = item.unitName || item.unitCode || '';
            const amountStr = [qtyDisplay, unitDisplay].filter(Boolean).join(' ');

            return (
              <div
                key={item.id}
                onClick={(e) => onTogglePurchased(item, e)}
                className={`flex items-center justify-between gap-2.5 p-3 rounded-xl border transition cursor-pointer active:scale-[0.99] select-none ${
                  item.isPurchased
                    ? 'bg-slate-50/80 border-slate-200/80 text-slate-400'
                    : 'bg-white border-slate-200 hover:border-blue-300 text-slate-800 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => onTogglePurchased(item, e)}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition cursor-pointer shrink-0 ${
                      item.isPurchased
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-300 hover:border-blue-500'
                    }`}
                  >
                    {item.isPurchased && <CheckCircleIcon className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`font-bold truncate text-xs ${
                        item.isPurchased ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {item.productName}
                    </p>
                    {item.note && (
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">
                        {item.note}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {amountStr && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {amountStr}
                    </span>
                  )}

                  {item.estimatedPrice != null && item.estimatedPrice > 0 && (
                    <span className="text-xs font-bold text-slate-700">
                      €{item.estimatedPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};
