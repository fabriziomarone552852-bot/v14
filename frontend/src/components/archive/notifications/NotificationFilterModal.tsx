// src/components/archive/notifications/NotificationFilterModal.tsx
import React from 'react';
import {
  ArchiveFilterModal,
  ArchiveFilterSearchInput,
  ArchiveFilterSegmentedGroup,
  ArchiveFilterDateRange,
} from '@/components/archive/common';
import type {
  NotificationArchiveTab,
  NotificationFilterState,
  NotificationReadStatusFilter,
} from '@/hooks/useNotificationArchiveData';

interface NotificationFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: NotificationFilterState;
  onFilterChange: (newFilters: NotificationFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const NotificationFilterModal: React.FC<NotificationFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
}) => {
  const handleFieldChange = <K extends keyof NotificationFilterState>(
    field: K,
    value: NotificationFilterState[K]
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
      title="Filtri & Ricerca Notifiche"
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
      overflowVisible={true}
    >
      {/* 1. Ricerca testuale */}
      <ArchiveFilterSearchInput
        label="Parole Chiave (Testo, Utente o Contesto)"
        value={filters.keyword}
        onChange={(val) => handleFieldChange('keyword', val)}
        placeholder="Cerca per messaggio, utente, film, serie o lista..."
      />

      {/* 2. Tipologia */}
      <ArchiveFilterSegmentedGroup<NotificationArchiveTab>
        label="Tipologia Notifica"
        value={filters.category}
        onChange={(val) => handleFieldChange('category', val)}
        options={[
          { value: 'all', label: 'Tutte' },
          { value: 'shopping', label: 'Spesa' },
          { value: 'media', label: 'Media' },
          { value: 'system', label: 'Sistema' },
        ]}
      />

      {/* 3. Stato Lettura */}
      <ArchiveFilterSegmentedGroup<NotificationReadStatusFilter>
        label="Stato Lettura"
        value={filters.readStatus}
        onChange={(val) => handleFieldChange('readStatus', val)}
        options={[
          { value: 'all', label: 'Tutte' },
          { value: 'unread', label: 'Non lette' },
          { value: 'read', label: 'Lette' },
        ]}
      />

      {/* 4. Intervallo Date (allineato a EventFilterModal) */}
      <ArchiveFilterDateRange
        label="Intervallo Date"
        startDate={filters.startDate}
        endDate={filters.endDate}
        onStartDateChange={(d) => handleFieldChange('startDate', d)}
        onEndDateChange={(d) => handleFieldChange('endDate', d)}
        onClearDateRange={() =>
          onFilterChange({
            ...filters,
            startDate: '',
            endDate: '',
          })
        }
        startPlaceholder="Data inizio..."
        endPlaceholder="Data fine..."
      />
    </ArchiveFilterModal>
  );
};

export default NotificationFilterModal;
