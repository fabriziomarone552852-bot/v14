// src/components/archive/shopping/list/ArchiveListDetailItemsSection.tsx
import React from 'react';
import type { ShoppingListItem } from '@/types/shopping';
import { SearchIcon, CheckCircleIcon, TrashIcon } from '@/components/shared/utils/Icons';
import type { ItemFilterStatus } from './useArchiveListDetailLogic';

export interface ArchiveListDetailItemsSectionProps {
  itemsCount: number;
  openCount: number;
  completedCount: number;
  filteredItems: ShoppingListItem[];
  filterStatus: ItemFilterStatus;
  setFilterStatus: (status: ItemFilterStatus) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onTogglePurchased: (item: ShoppingListItem, e: React.MouseEvent) => void;
  onDeleteItem: (item: ShoppingListItem, e: React.MouseEvent) => void;
}

export const ArchiveListDetailItemsSection: React.FC<ArchiveListDetailItemsSectionProps> = ({
  itemsCount,
  openCount,
  completedCount,
  filteredItems,
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
  onTogglePurchased,
  onDeleteItem,
}) => {
  return (
    <div className="space-y-3">
      {/* Filtri e Ricerca */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="flex rounded-xl bg-gray-100 p-1 w-full sm:w-auto text-xs shrink-0">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Tutti ({itemsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('open')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterStatus === 'open'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Da comprare ({openCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('completed')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterStatus === 'completed'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Acquistati ({completedCount})
          </button>
        </div>

        {/* Input Ricerca */}
        <div className="relative w-full sm:w-48">
          <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca articolo..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
          />
        </div>
      </div>

      {/* Lista Articoli */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredItems.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-400">
            Nessun articolo trovato in questa lista.
          </p>
        ) : (
          filteredItems.map((it) => (
            <div
              key={it.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                it.isPurchased
                  ? 'bg-emerald-50/40 border-emerald-100'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Checkbox / Toggle Acquistato */}
              <button
                type="button"
                onClick={(e) => onTogglePurchased(it, e)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition shrink-0 cursor-pointer ${
                  it.isPurchased
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50'
                }`}
                title={it.isPurchased ? 'Segna come non acquistato' : 'Segna come acquistato'}
              >
                {it.isPurchased && <CheckCircleIcon className="w-4 h-4" />}
              </button>

              {/* Informazioni Articolo */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-sm font-semibold truncate min-w-0 flex-1 ${
                      it.isPurchased ? 'line-through text-gray-400' : 'text-gray-900'
                    }`}
                    title={it.productName}
                  >
                    {it.productName}
                  </span>
                  {it.brandName && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                      {it.brandName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  {it.quantity != null && (
                    <span>
                      {it.quantity} {it.unitCodeName || 'pz'}
                    </span>
                  )}
                  {it.lastPrice != null && (
                    <span>• {it.lastPrice.toFixed(2)} €</span>
                  )}
                  {it.lastSupplierName && (
                    <span>• {it.lastSupplierName}</span>
                  )}
                </div>

                {it.notes && (
                  <p className="text-[11px] text-gray-400 italic truncate mt-0.5">
                    {it.notes}
                  </p>
                )}
              </div>

              {/* Azioni */}
              <button
                type="button"
                onClick={(e) => onDeleteItem(it, e)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0 cursor-pointer"
                title="Elimina articolo"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
