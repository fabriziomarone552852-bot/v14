// src/components/archive/shopping/ShoppingPriceFilterModal.tsx
import React from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { SearchIcon, CalendarIcon, UndoIcon } from '@/components/shared/utils/Icons';
import LookbackUnitSelect, { type LookbackUnit } from '@/components/shared/shopping/LookbackUnitSelect';

export type { LookbackUnit };

export interface ShoppingPriceFilterState {
  keyword: string;
  lookbackValue: number;
  lookbackUnit: LookbackUnit;
}

interface ShoppingPriceFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ShoppingPriceFilterState;
  onFilterChange: (newFilters: ShoppingPriceFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const ShoppingPriceFilterModal: React.FC<ShoppingPriceFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
}) => {
  if (!isOpen) return null;

  const handleFieldChange = <K extends keyof ShoppingPriceFilterState>(
    field: K,
    value: ShoppingPriceFilterState[K]
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const modalFooter = (
    <div className="flex items-center justify-between gap-3 w-full">
      <button
        type="button"
        onClick={onReset}
        disabled={!hasActiveFilters}
        className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
          hasActiveFilters
            ? 'text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900'
            : 'text-slate-300 bg-slate-50 cursor-not-allowed'
        }`}
      >
        <UndoIcon className="w-3.5 h-3.5" />
        <span>Azzera Filtri</span>
      </button>

      <button
        type="button"
        onClick={onClose}
        className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition cursor-pointer shadow-xs"
      >
        Mostra Risultati
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Filtra e Configura Prezzi"
      footer={modalFooter}
      maxWidthClass="max-w-md"
    >
      <div className="space-y-4 text-xs">
        {/* 1. RICERCA PER NOME PRODOTTO */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Cerca Prodotto per Nome
          </label>
          <div className="relative">
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => handleFieldChange('keyword', e.target.value)}
              placeholder="Es. Latte, Pasta, Caffè..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium"
              autoFocus
            />
          </div>
        </div>

        {/* 2. SELETTORE PERIODO DI CALCOLO PER MEDIE E PREZZO CONVENIENTE */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span>Periodo per media e miglior prezzo:</span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            I prezzi medi e più convenienti mostrati nella tabella verranno calcolati considerando questo intervallo di tempo.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-slate-600 font-medium shrink-0">Considera gli ultimi</span>
            <input
              type="number"
              min={1}
              max={999}
              value={filters.lookbackValue}
              onChange={(e) =>
                handleFieldChange(
                  'lookbackValue',
                  Math.max(1, parseInt(e.target.value, 10) || 1)
                )
              }
              className="w-16 px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <LookbackUnitSelect
              value={filters.lookbackUnit}
              onChange={(newUnit) => handleFieldChange('lookbackUnit', newUnit)}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ShoppingPriceFilterModal;
