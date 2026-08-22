// src/components/shared/shopping/ShoppingActiveListHeader.tsx
import React from 'react';
import type { ShoppingListItem, ShoppingListSummary } from '@/types/shopping';
import {
  EditIcon,
  TrashIcon,
  CheckIcon,
} from '@/components/shared/utils/Icons';

export type FiltroStato = 'tutti' | 'aperti' | 'completati';

export interface ShoppingActiveListHeaderProps {
  activeList: ShoppingListSummary;
  items: ShoppingListItem[];
  filtroStato: FiltroStato;
  onFiltroStatoChange: (stato: FiltroStato) => void;
  canEditList: boolean;
  onToggleCompleteList?: (list: ShoppingListSummary, isCompleted: boolean) => void;
  onEditList?: (list: ShoppingListSummary) => void;
  onDeleteList?: (list: ShoppingListSummary) => void;
}

export const ShoppingActiveListHeader: React.FC<ShoppingActiveListHeaderProps> = ({
  activeList,
  items,
  filtroStato,
  onFiltroStatoChange,
  canEditList,
  onToggleCompleteList,
  onEditList,
  onDeleteList,
}) => {
  const openCount = items.filter((i) => !i.isPurchased).length;
  const purchasedCount = items.filter((i) => i.isPurchased).length;

  return (
    <div className="shrink-0 space-y-3 pb-3 border-b border-gray-200/80">
      <div className="flex items-center justify-between gap-3 min-h-[42px]">
        {/* Titolo Lista Spesa */}
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 truncate tracking-tight flex-1 min-w-0">
          {activeList.name}
        </h2>

        {/* Pulsanti Azione Header Lista */}
        <div className="flex items-center gap-1 shrink-0">
          {onToggleCompleteList && canEditList && (
            <button
              type="button"
              onClick={() => onToggleCompleteList(activeList, !activeList.isCompleted)}
              className={`p-2 rounded-xl transition cursor-pointer ${
                activeList.isCompleted
                  ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                  : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
              title={activeList.isCompleted ? 'Riapri lista spesa' : 'Segna lista come completata'}
            >
              <CheckIcon className="w-5 h-5" />
            </button>
          )}

          {onEditList && canEditList && (
            <button
              type="button"
              onClick={() => onEditList(activeList)}
              className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
              title="Modifica lista spesa"
            >
              <EditIcon className="w-5 h-5" />
            </button>
          )}

          {onDeleteList && canEditList && (
            <button
              type="button"
              onClick={() => onDeleteList(activeList)}
              className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              title="Elimina lista spesa"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Descrizione / Note (se presenti) */}
      {activeList.description && (
        <div className="rounded-xl bg-gray-50/80 p-3 border border-gray-100">
          <p className="text-xs text-gray-600 italic leading-relaxed">
            "{activeList.description}"
          </p>
        </div>
      )}

      {/* Statistiche Riassuntive Lista / Filtri Interattivi */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* 1. TUTTI */}
        <button
          type="button"
          onClick={() => onFiltroStatoChange('tutti')}
          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
            filtroStato === 'tutti'
              ? 'border-blue-400 bg-blue-100/90 text-blue-950 ring-2 ring-blue-400/50 shadow-xs scale-[1.02]'
              : 'border-gray-200 bg-gray-50/70 text-gray-600 hover:bg-gray-100 hover:border-gray-300 opacity-75'
          }`}
          title="Mostra tutti gli articoli"
        >
          <p className="text-lg sm:text-xl font-black">{items.length}</p>
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            Tutti
          </p>
        </button>

        {/* 2. DA COMPRARE */}
        <button
          type="button"
          onClick={() => onFiltroStatoChange('aperti')}
          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
            filtroStato === 'aperti'
              ? 'border-amber-500 bg-amber-100/95 text-amber-950 ring-2 ring-amber-400/60 shadow-xs scale-[1.02]'
              : 'border-amber-200/80 bg-amber-50/40 text-amber-700 hover:bg-amber-100/60 hover:border-amber-300 opacity-75'
          }`}
          title="Mostra articoli da comprare"
        >
          <p className="text-lg sm:text-xl font-black">{openCount}</p>
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            Da Comprare
          </p>
        </button>

        {/* 3. ACQUISTATI */}
        <button
          type="button"
          onClick={() => onFiltroStatoChange('completati')}
          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
            filtroStato === 'completati'
              ? 'border-emerald-500 bg-emerald-100/95 text-emerald-950 ring-2 ring-emerald-400/60 shadow-xs scale-[1.02]'
              : 'border-emerald-200/80 bg-emerald-50/40 text-emerald-700 hover:bg-emerald-100/60 hover:border-emerald-300 opacity-75'
          }`}
          title="Mostra articoli acquistati"
        >
          <p className="text-lg sm:text-xl font-black">{purchasedCount}</p>
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
            Acquistati
          </p>
        </button>
      </div>
    </div>
  );
};
