// src/components/archive/notes/NoteFilterModal.tsx
import React from 'react';
import type { NoteFilterState } from '@/hooks/useNoteArchiveData';
import {
  ArchiveFilterModal,
  ArchiveFilterSearchInput,
  ArchiveFilterSegmentedGroup,
  ArchiveFilterDateRange,
} from '@/components/archive/common';

interface NoteFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: NoteFilterState;
  onFilterChange: (newFilters: NoteFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const NoteFilterModal: React.FC<NoteFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
}) => {
  const handleFieldChange = <K extends keyof NoteFilterState>(
    field: K,
    value: NoteFilterState[K]
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
      title="Filtri & Ricerca Note"
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
      overflowVisible={true}
    >
      {/* 1. RICERCA PER PAROLA CHIAVE NEL TESTO */}
      <ArchiveFilterSearchInput
        label="Parola Chiave nel Testo"
        value={filters.keyword}
        onChange={(val) => handleFieldChange('keyword', val)}
        placeholder="Cerca negli appunti..."
      />

      {/* 2. TIPOLOGIA COLORE / VARIANTE */}
      <ArchiveFilterSegmentedGroup<NoteFilterState['variant']>
        label="Tipologia / Colore Nota"
        value={filters.variant}
        onChange={(val) => handleFieldChange('variant', val)}
        gridColsClass="grid-cols-5"
        options={[
          { value: 'all', label: 'Tutte', activeClass: 'ring-2 ring-blue-600 font-extrabold shadow-sm bg-slate-100 text-slate-700 border-slate-200' },
          { value: 'N1', label: 'Giallo', activeClass: 'ring-2 ring-blue-600 font-extrabold shadow-sm bg-yellow-100 text-yellow-900 border-yellow-300' },
          { value: 'N2', label: 'Verde', activeClass: 'ring-2 ring-blue-600 font-extrabold shadow-sm bg-green-100 text-green-900 border-green-300' },
          { value: 'N3', label: 'Blu', activeClass: 'ring-2 ring-blue-600 font-extrabold shadow-sm bg-blue-100 text-blue-900 border-blue-300' },
          { value: 'N4', label: 'Rosa', activeClass: 'ring-2 ring-blue-600 font-extrabold shadow-sm bg-pink-100 text-pink-900 border-pink-300' },
        ]}
      />

      {/* 3. INTERVALLO DI DATE */}
      <ArchiveFilterDateRange
        label="Intervallo di Date"
        startDate={filters.dateFrom}
        endDate={filters.dateTo}
        onStartDateChange={(d) => handleFieldChange('dateFrom', d)}
        onEndDateChange={(d) => handleFieldChange('dateTo', d)}
        onClearDateRange={() => {
          handleFieldChange('dateFrom', '');
          handleFieldChange('dateTo', '');
        }}
        startPlaceholder="Da data..."
        endPlaceholder="A data..."
      />
    </ArchiveFilterModal>
  );
};

export default NoteFilterModal;
