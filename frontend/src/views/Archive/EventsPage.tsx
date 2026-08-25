// src/views/Archive/EventsPage.tsx
import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { useCategories } from '@/hooks/useCategories';
import { useEventModals } from '@/context/EventModalContext';
import { useEventArchiveData } from '@/hooks/useEventArchiveData';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { CalendarIcon } from '@/components/shared/utils/Icons';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import { EventStatsOverview } from '@/components/archive/events/EventStatsOverview';
import { EventFilterBar } from '@/components/archive/events/EventFilterBar';
import { EventTableHeader, type EventSortField, type EventSortDirection } from '@/components/archive/events/EventTableHeader';
import { EventTableRow } from '@/components/archive/events/EventTableRow';
import { EventFilterModal, type EventFilterState } from '@/components/archive/events/EventFilterModal';
import { ERROR_MESSAGES } from '@/data/loadingMessages';
import type { DbEvent } from '@/types';

const PANEL_CLASS = 'rounded-2xl border border-slate-200/90 bg-white shadow-xs';

const initialFilterState: EventFilterState = {
  keyword: '',
  categoryId: 'all',
  timeframe: 'all',
  durationType: 'all',
  startDate: '',
  endDate: '',
};

export const EventsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { openEventForm, openEventDetail } = useEventModals();
  const { data: categories = [] } = useCategories();

  // 1. CARICAMENTO DATI (Mazzo di carte in React Query)
  const { data: rawEvents = [], isLoading: loading, isError } = useQuery<DbEvent[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await api.get<{ items?: DbEvent[] } | DbEvent[]>('/events');
      if (!res) return [];
      return Array.isArray(res) ? res : res?.items ?? [];
    },
  });

  // 2. STATO FILTRI, ORDINAMENTO E PAGINAZIONE
  const [modalFilters, setModalFilters] = useState<EventFilterState>(initialFilterState);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [sortField, setSortField] = useState<EventSortField>('startDate');
  const [sortDirection, setSortDirection] = useState<EventSortDirection>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 3. CALCOLO DINAMICO DEL PAGE SIZE IN BASE ALL'ALTEZZA
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 46,
    defaultPageSize: 8,
    minItems: 3,
    maxItems: 30,
  });

  // 4. HOOK PER ELABORAZIONE AD ALTE PRESTAZIONI DEI DATI DEGLI EVENTI
  const { filteredEvents, paginatedEvents, totalPages } = useEventArchiveData({
    rawEvents,
    modalFilters,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
  });

  // Conteggio filtri attivi nel modale di ricerca
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (modalFilters.keyword.trim()) count++;
    if (modalFilters.categoryId !== 'all') count++;
    if (modalFilters.timeframe !== 'all') count++;
    if (modalFilters.durationType !== 'all') count++;
    if (modalFilters.startDate) count++;
    if (modalFilters.endDate) count++;
    return count;
  }, [modalFilters]);

  const hasActiveFilters = activeFiltersCount > 0;

  const handleResetFilters = () => {
    setModalFilters(initialFilterState);
    setCurrentPage(1);
  };

  const handleSort = (field: EventSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="h-full flex flex-col gap-3.5 max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER COMPATTO PULITO */}
      <EventStatsOverview panelClass={PANEL_CLASS} />

      {/* 2. RIGA FILTRI: AddButton A SINISTRA E LENTE A DESTRA */}
      <EventFilterBar
        onOpenNewEvent={() => openEventForm()}
        onOpenSearch={() => setIsFilterModalOpen(true)}
        activeFiltersCount={activeFiltersCount}
        panelClass={PANEL_CLASS}
      />

      {/* 3. LISTA DEGLI EVENTI CON ORDINAMENTO E PAGINAZIONE */}
      <ArchiveTableContainer
        header={
          <EventTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        }
        loading={loading}
        loadingMessage="Caricamento eventi in corso..."
        isError={isError}
        errorMessage={ERROR_MESSAGES.archive}
        onRetry={() => queryClient.refetchQueries()}
        isEmpty={filteredEvents.length === 0}
        emptyIcon={<CalendarIcon className="w-8 h-8 text-slate-400" />}
        emptyTitle="Nessun evento trovato"
        emptyDescription={
          hasActiveFilters
            ? 'Nessun appuntamento corrisponde ai filtri selezionati. Prova ad azzerarli.'
            : 'Non ci sono eventi registrati in archivio.'
        }
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className={PANEL_CLASS}
        bodyRef={containerRef}
      >
        {paginatedEvents.map((ev) => (
          <EventTableRow
            key={ev.id}
            event={ev}
            onSelectEvent={openEventDetail}
          />
        ))}
      </ArchiveTableContainer>

      {/* 4. MODALE FILTRI & RICERCA IN OVERLAY GLOBALE (BaseModal via createPortal) */}
      <EventFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={modalFilters}
        onFilterChange={(newFilters) => {
          setModalFilters(newFilters);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
        categories={categories}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
};

export default EventsPage;