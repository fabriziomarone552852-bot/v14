// src/components/archive/habits/HabitFilterModal.tsx
import React from 'react';
import type { HabitFilterState } from '@/hooks/useHabitArchiveData';
import type { HabitTabType } from '@/components/archive/habits/ArchiveTabs';
import {
  ArchiveFilterModal,
  ArchiveFilterSearchInput,
  ArchiveFilterSegmentedGroup,
  ArchiveFilterDateRange,
} from '@/components/archive/common';

interface HabitFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: HabitFilterState;
  onFilterChange: (newFilters: HabitFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  activeTab: HabitTabType;
}

export const HabitFilterModal: React.FC<HabitFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
  activeTab,
}) => {
  const handleFieldChange = <K extends keyof HabitFilterState>(
    field: K,
    value: HabitFilterState[K]
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const titleSuffix = activeTab === 'routines' ? 'Routines' : 'Habits';

  return (
    <ArchiveFilterModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Filtri & Ricerca ${titleSuffix}`}
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
      overflowVisible={true}
    >
      {/* 1. RICERCA PER PAROLA CHIAVE NEL NOME */}
      <ArchiveFilterSearchInput
        label={`Nome ${activeTab === 'routines' ? 'Routine' : 'Habit'}`}
        value={filters.keyword}
        onChange={(val) => handleFieldChange('keyword', val)}
        placeholder="Cerca per nome..."
      />

      {/* 2. STATO */}
      <ArchiveFilterSegmentedGroup<HabitFilterState['status']>
        label="Stato"
        value={filters.status}
        onChange={(val) => handleFieldChange('status', val)}
        options={[
          { value: 'all', label: 'Tutti' },
          { value: 'active', label: 'Solo Attivi' },
          { value: 'paused', label: 'Solo in Pausa' },
        ]}
      />

      {/* 3. PERIODO DI SCADENZA / INIZIO */}
      <ArchiveFilterDateRange
        label="Intervallo Date"
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

export default HabitFilterModal;
