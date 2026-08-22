// src/components/archive/countdowns/CountdownFilterModal.tsx
import React from 'react';
import {
  ArchiveFilterModal,
  ArchiveFilterSearchInput,
  ArchiveFilterSegmentedGroup,
  ArchiveFilterDateRange,
} from '@/components/archive/common';

export interface CountdownFilterState {
  keyword: string;
  status: 'all' | 'active' | 'expired';
  dateFrom: string;
  dateTo: string;
}

interface CountdownFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CountdownFilterState;
  onFilterChange: (newFilters: CountdownFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const CountdownFilterModal: React.FC<CountdownFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
}) => {
  const handleFieldChange = <K extends keyof CountdownFilterState>(
    field: K,
    value: CountdownFilterState[K]
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
      title="Filtri & Ricerca Countdown"
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
      overflowVisible={true}
    >
      {/* 1. RICERCA PER NOME / PAROLA CHIAVE */}
      <ArchiveFilterSearchInput
        label="Titolo Evento"
        value={filters.keyword}
        onChange={(val) => handleFieldChange('keyword', val)}
        placeholder="Cerca per titolo..."
      />

      {/* 2. STATO */}
      <ArchiveFilterSegmentedGroup<'all' | 'active' | 'expired'>
        label="Stato Countdown"
        value={filters.status}
        onChange={(val) => handleFieldChange('status', val)}
        options={[
          { value: 'all', label: 'Tutti' },
          { value: 'active', label: 'Solo Attivi' },
          { value: 'expired', label: 'Solo Scaduti' },
        ]}
      />

      {/* 3. PERIODO DI SCADENZA */}
      <ArchiveFilterDateRange
        label="Periodo di Scadenza"
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

export default CountdownFilterModal;
