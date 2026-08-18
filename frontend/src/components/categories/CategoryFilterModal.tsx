// src/components/categories/CategoryFilterModal.tsx
import React from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { SearchIcon, UndoIcon } from '@/components/shared/utils/Icons';
import { CategoryGenre } from '@/types/categories';

export interface CategoryFilterState {
  keyword: string;
  genre: 'all' | 1 | 2 | 3 | 4;
}

interface CategoryFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CategoryFilterState;
  onFilterChange: (newFilters: CategoryFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const CategoryFilterModal: React.FC<CategoryFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
}) => {
  if (!isOpen) return null;

  const handleFieldChange = <K extends keyof CategoryFilterState>(
    field: K,
    value: CategoryFilterState[K]
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const modalFooter = (
    <div className="flex items-center justify-between gap-3 w-full">
      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 py-2.5 px-3 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
        >
          <UndoIcon className="w-4 h-4" />
          <span>Reset filtri</span>
        </button>
      ) : (
        <div />
      )}

      <button
        type="button"
        onClick={onClose}
        className="py-2.5 px-6 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer ml-auto"
      >
        {hasActiveFilters ? 'Applica Filtri' : 'Chiudi'}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Filtri & Ricerca Categorie"
      maxWidthClass="max-w-md"
      footer={modalFooter}
    >
      <div className="space-y-4">
        {/* 1. NOME CATEGORIA */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Nome Categoria
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => handleFieldChange('keyword', e.target.value)}
              placeholder="Cerca per nome..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* 2. TIPOLOGIA / GENERE */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Tipologia / Utilizzo
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(
              [
                { id: 'all', label: 'Tutte' },
                { id: CategoryGenre.TASKS, label: 'Tasks' },
                { id: CategoryGenre.EVENTS, label: 'Eventi' },
                { id: CategoryGenre.COMMON, label: 'Comune' },
                { id: CategoryGenre.MOOD, label: "Stato d'animo" },
              ] as const
            ).map((item) => (
              <button
                key={String(item.id)}
                type="button"
                onClick={() => handleFieldChange('genre', item.id as CategoryFilterState['genre'])}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  filters.genre === item.id
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default CategoryFilterModal;
