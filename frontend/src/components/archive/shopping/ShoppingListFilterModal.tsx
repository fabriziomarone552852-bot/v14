// src/components/archive/shopping/ShoppingListFilterModal.tsx
import React, { useState } from 'react';
import { TagIcon, CloseIcon } from '@/components/shared/utils/Icons';
import {
  ArchiveFilterModal,
  ArchiveFilterSearchInput,
  ArchiveFilterSegmentedGroup,
} from '@/components/archive/common';

export interface ShoppingListFilterState {
  keyword: string;
  status: 'all' | 'active' | 'completed';
  products: string[];
}

interface ShoppingListFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ShoppingListFilterState;
  onFilterChange: (newFilters: ShoppingListFilterState) => void;
  onReset: () => void;
  allKnownProducts: string[];
  hasActiveFilters: boolean;
}

export const ShoppingListFilterModal: React.FC<ShoppingListFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  allKnownProducts,
  hasActiveFilters,
}) => {
  const [productInput, setProductInput] = useState('');

  const handleFieldChange = <K extends keyof ShoppingListFilterState>(
    field: K,
    value: ShoppingListFilterState[K]
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const handleAddProduct = (p: string) => {
    if (!filters.products.includes(p)) {
      handleFieldChange('products', [...filters.products, p]);
    }
    setProductInput('');
  };

  const handleRemoveProduct = (p: string) => {
    handleFieldChange(
      'products',
      filters.products.filter((item) => item !== p)
    );
  };

  const productSuggestions = allKnownProducts.filter(
    (p) =>
      !filters.products.includes(p) &&
      (!productInput || p.toLowerCase().includes(productInput.toLowerCase().trim()))
  );

  return (
    <ArchiveFilterModal
      isOpen={isOpen}
      onClose={onClose}
      title="Filtra Liste Spesa"
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
      maxWidthClass="max-w-lg"
    >
      {/* 1. RICERCA PER NOME / GRUPPO */}
      <ArchiveFilterSearchInput
        label="Cerca per Nome Lista o Gruppo"
        value={filters.keyword}
        onChange={(val) => handleFieldChange('keyword', val)}
        placeholder="Es. Spesa settimanale, Cena sabato..."
      />

      {/* 2. STATO DELLA LISTA */}
      <ArchiveFilterSegmentedGroup<ShoppingListFilterState['status']>
        label="Stato della Lista"
        value={filters.status}
        onChange={(val) => handleFieldChange('status', val)}
        options={[
          { value: 'all', label: 'Tutte', activeClass: 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs font-bold' },
          { value: 'active', label: 'Attive', activeClass: 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs font-bold' },
          { value: 'completed', label: 'Completate', activeClass: 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs font-bold' },
        ]}
      />

      {/* 3. FILTRO PER PRODOTTI CONTENUTI (TAG-STYLE) */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Filtra per Prodotti Contenuti
        </label>

        {/* Chip Prodotti Selezionati */}
        {filters.products.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {filters.products.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                <TagIcon className="w-3 h-3" />
                <span>{p}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(p)}
                  className="text-emerald-400 hover:text-emerald-700 cursor-pointer"
                >
                  <CloseIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            value={productInput}
            onChange={(e) => setProductInput(e.target.value)}
            placeholder="Digita per cercare tra i prodotti..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium"
          />
        </div>

        {productSuggestions.length > 0 && (
          <div className="mt-2 max-h-32 overflow-y-auto border border-slate-200 rounded-xl p-1 bg-white custom-scrollbar flex flex-wrap gap-1">
            {productSuggestions.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleAddProduct(p)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-100 transition cursor-pointer"
              >
                + {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </ArchiveFilterModal>
  );
};

export default ShoppingListFilterModal;
