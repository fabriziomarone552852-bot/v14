// src/components/archive/shopping/products/ShoppingCatalogProductFilterModal.tsx
import React from 'react';
import {
  ArchiveFilterModal,
  ArchiveFilterSearchInput,
  ArchiveFilterSegmentedGroup,
} from '@/components/archive/common';
import type { ShoppingCatalogProductFilterState } from './useShoppingArchiveProductsLogic';

interface ShoppingCatalogProductFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ShoppingCatalogProductFilterState;
  onFilterChange: (filters: ShoppingCatalogProductFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const ShoppingCatalogProductFilterModal: React.FC<
  ShoppingCatalogProductFilterModalProps
> = ({ isOpen, onClose, filters, onFilterChange, onReset, hasActiveFilters }) => {
  const handleFieldChange = <K extends keyof ShoppingCatalogProductFilterState>(
    field: K,
    value: ShoppingCatalogProductFilterState[K]
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <ArchiveFilterModal
      isOpen={isOpen}
      onClose={onClose}
      title="Filtri & Ricerca Prodotti"
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
    >
      <ArchiveFilterSearchInput
        label="Parole Chiave (Prodotto, Marca o Negozio)"
        value={filters.keyword}
        onChange={(val) => handleFieldChange('keyword', val)}
        placeholder="Cerca prodotto, marchio o supermercato..."
      />

      <ArchiveFilterSegmentedGroup<ShoppingCatalogProductFilterState['brandStatus']>
        label="Marche Associate"
        value={filters.brandStatus}
        onChange={(val) => handleFieldChange('brandStatus', val)}
        options={[
          { value: 'all', label: 'Tutti' },
          { value: 'with_brands', label: 'Con marche' },
          { value: 'without_brands', label: 'Senza marche' },
        ]}
      />

      <ArchiveFilterSegmentedGroup<ShoppingCatalogProductFilterState['purchaseStatus']>
        label="Storico Acquisti"
        value={filters.purchaseStatus}
        onChange={(val) => handleFieldChange('purchaseStatus', val)}
        options={[
          { value: 'all', label: 'Tutti' },
          { value: 'purchased', label: 'Acquistati' },
          { value: 'never_purchased', label: 'Mai acquistati' },
        ]}
      />
    </ArchiveFilterModal>
  );
};

export default ShoppingCatalogProductFilterModal;
