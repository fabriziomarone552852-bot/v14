// src/components/archive/suppliers/SupplierFilterModal.tsx
import React from 'react';
import type { SupplierFilterState } from '@/hooks/useSupplierArchiveData';
import {
  ArchiveFilterModal,
  ArchiveFilterSearchInput,
  ArchiveFilterSegmentedGroup,
} from '@/components/archive/common';

interface SupplierFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SupplierFilterState;
  onFilterChange: (newFilters: SupplierFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  isSuperuser?: boolean;
}

export const SupplierFilterModal: React.FC<SupplierFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
  isSuperuser = false,
}) => {
  const handleFieldChange = <K extends keyof SupplierFilterState>(
    field: K,
    value: SupplierFilterState[K]
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
      title="Filtra Negozi & Fornitori"
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
    >
      {/* 1. RICERCA PER NOME NEGOZIO */}
      <ArchiveFilterSearchInput
        label="Cerca Negozio"
        value={filters.keyword}
        onChange={(val) => handleFieldChange('keyword', val)}
        placeholder="Es. Coop, Esselunga, Conad, Farmacia..."
      />

      {/* 2. FILTRO STATO (Visibile solo per Superuser) */}
      {isSuperuser && (
        <ArchiveFilterSegmentedGroup<SupplierFilterState['status']>
          label="Stato Attività"
          value={filters.status}
          onChange={(val) => handleFieldChange('status', val)}
          options={[
            { value: 'all', label: 'Tutti', activeClass: 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs font-bold' },
            { value: 'active', label: 'Attivi', activeClass: 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs font-bold' },
            { value: 'inactive', label: 'Inattivi', activeClass: 'bg-slate-200 border-slate-300 text-slate-800 shadow-2xs font-bold' },
          ]}
        />
      )}
    </ArchiveFilterModal>
  );
};

export default SupplierFilterModal;

