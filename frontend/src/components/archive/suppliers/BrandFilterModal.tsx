// src/components/archive/suppliers/BrandFilterModal.tsx
import React from 'react';
import type { BrandFilterState } from '@/hooks/useBrandArchiveData';
import {
  ArchiveFilterModal,
  ArchiveFilterSearchInput,
} from '@/components/archive/common';

interface BrandFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: BrandFilterState;
  onFilterChange: (newFilters: BrandFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const BrandFilterModal: React.FC<BrandFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
}) => {
  const handleFieldChange = <K extends keyof BrandFilterState>(
    field: K,
    value: BrandFilterState[K]
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
      title="Filtra Marchi & Brand"
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
    >
      {/* 1. RICERCA PER NOME BRAND */}
      <ArchiveFilterSearchInput
        label="Cerca Marchio / Brand"
        value={filters.keyword}
        onChange={(val) => handleFieldChange('keyword', val)}
        placeholder="Es. Barilla, Mulino Bianco, De Cecco, Coca Cola..."
      />
    </ArchiveFilterModal>
  );
};

export default BrandFilterModal;
