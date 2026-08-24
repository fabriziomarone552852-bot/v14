// src/components/archive/categories/CategoryFilterModal.tsx
import React from 'react';
import { CategoryGenre } from '@/types/categories';
import {
  ArchiveFilterModal,
  ArchiveFilterSearchInput,
  ArchiveFilterSegmentedGroup,
} from '@/components/archive/common';

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
  const handleFieldChange = <K extends keyof CategoryFilterState>(
    field: K,
    value: CategoryFilterState[K]
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
      title="Filtri & Ricerca Categorie"
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
    >
      {/* 1. NOME CATEGORIA */}
      <ArchiveFilterSearchInput
        label="Nome Categoria"
        value={filters.keyword}
        onChange={(val) => handleFieldChange('keyword', val)}
        placeholder="Cerca per nome..."
      />

      {/* 2. TIPOLOGIA / GENERE */}
      <ArchiveFilterSegmentedGroup<CategoryFilterState['genre']>
        label="Tipologia / Utilizzo"
        value={filters.genre}
        onChange={(val) => handleFieldChange('genre', val)}
        gridColsClass="grid-cols-2 sm:grid-cols-3"
        options={[
          { value: 'all', label: 'Tutte' },
          { value: CategoryGenre.TASKS, label: 'Tasks' },
          { value: CategoryGenre.EVENTS, label: 'Eventi' },
          { value: CategoryGenre.COMMON, label: 'Comune' },
          { value: CategoryGenre.MOOD, label: "Stato d'animo" },
        ]}
      />
    </ArchiveFilterModal>
  );
};

export default CategoryFilterModal;
