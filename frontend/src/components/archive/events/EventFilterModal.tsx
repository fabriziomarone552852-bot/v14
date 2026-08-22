// src/components/archive/events/EventFilterModal.tsx
import React, { useMemo } from 'react';
import { CategoryGenre, type Category } from '@/types';
import {
  ArchiveFilterModal,
  ArchiveFilterSearchInput,
  ArchiveFilterCategorySelect,
  ArchiveFilterSegmentedGroup,
  ArchiveFilterDateRange,
} from '@/components/archive/common';

export interface EventFilterState {
  keyword: string;
  categoryId: string;
  timeframe: 'all' | 'upcoming' | 'past';
  durationType: 'all' | 'timed' | 'allDay';
  startDate: string;
  endDate: string;
}

interface EventFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: EventFilterState;
  onFilterChange: (newFilters: EventFilterState) => void;
  onReset: () => void;
  categories: Category[];
  hasActiveFilters: boolean;
}

export const EventFilterModal: React.FC<EventFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  categories,
  hasActiveFilters,
}) => {
  // Mostra SOLO categorie con genre 2 (EVENTS) e genre 3 (COMMON)
  const eventCategories = useMemo(
    () =>
      categories.filter(
        (c: Category) =>
          c.genre === CategoryGenre.EVENTS ||
          c.genre === CategoryGenre.COMMON ||
          c.genre === 2 ||
          c.genre === 3
      ),
    [categories]
  );

  const handleFieldChange = <K extends keyof EventFilterState>(
    field: K,
    value: EventFilterState[K]
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
      title="Filtri & Ricerca Eventi"
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
      overflowVisible={true}
    >
      {/* 1. CAMPO UNICO PAROLE CHIAVE */}
      <ArchiveFilterSearchInput
        label="Parole Chiave (Titolo, Note o Luogo)"
        value={filters.keyword}
        onChange={(val) => handleFieldChange('keyword', val)}
        placeholder="Cerca per titolo, note o luogo..."
      />

      {/* 2. CATEGORIA */}
      <ArchiveFilterCategorySelect
        label="Categoria"
        categories={eventCategories}
        selectedCategoryId={filters.categoryId === 'all' ? '' : filters.categoryId}
        onChange={(catId) => handleFieldChange('categoryId', catId || 'all')}
        allLabel="Tutte le categorie"
      />

      {/* 3. PERIODO */}
      <ArchiveFilterSegmentedGroup<'all' | 'upcoming' | 'past'>
        label="Periodo"
        value={filters.timeframe}
        onChange={(val) => handleFieldChange('timeframe', val)}
        options={[
          { value: 'all', label: 'Tutti' },
          { value: 'upcoming', label: 'In Programma' },
          { value: 'past', label: 'Passati' },
        ]}
      />

      {/* 4. TIPOLOGIA DURATA */}
      <ArchiveFilterSegmentedGroup<'all' | 'timed' | 'allDay'>
        label="Tipologia Orario"
        value={filters.durationType}
        onChange={(val) => handleFieldChange('durationType', val)}
        options={[
          { value: 'all', label: 'Tutti' },
          { value: 'timed', label: 'Con Orario' },
          { value: 'allDay', label: 'Tutto il Giorno' },
        ]}
      />

      {/* 5. INTERVALLO DATE */}
      <ArchiveFilterDateRange
        label="Intervallo Date"
        startDate={filters.startDate}
        endDate={filters.endDate}
        onStartDateChange={(d) => handleFieldChange('startDate', d)}
        onEndDateChange={(d) => handleFieldChange('endDate', d)}
        onClearDateRange={() => {
          handleFieldChange('startDate', '');
          handleFieldChange('endDate', '');
        }}
        startPlaceholder="Data inizio..."
        endPlaceholder="Data fine..."
      />
    </ArchiveFilterModal>
  );
};

export default EventFilterModal;
