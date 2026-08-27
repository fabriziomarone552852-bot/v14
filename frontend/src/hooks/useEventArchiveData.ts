// src/hooks/useEventArchiveData.ts
import { useMemo } from 'react';
import type { DbEvent, CalendarEvent } from '@/types';
import type { EventFilterState } from '@/components/archive/events/EventFilterModal';
import type { EventSortField, EventSortDirection } from '@/components/archive/events/EventTableHeader';
import { mapDbEventsToCalendarEvents } from '@/utils/eventUtils';
import { getLocalTodayStr } from '@/utils/dateUtils';
import { formatEventRecurrence } from '@/components/archive/events/eventRecurrenceUtils';
import { paginate } from '@/utils/paginationUtils';

interface UseEventArchiveDataOptions {
  rawEvents: DbEvent[];
  modalFilters: EventFilterState;
  sortField: EventSortField;
  sortDirection: EventSortDirection;
  currentPage: number;
  pageSize?: number;
}

export interface EventArchiveDataResult {
  filteredEvents: CalendarEvent[];
  paginatedEvents: CalendarEvent[];
  totalPages: number;
}

export const useEventArchiveData = ({
  rawEvents,
  modalFilters,
  sortField,
  sortDirection,
  currentPage,
  pageSize = 8,
}: UseEventArchiveDataOptions): EventArchiveDataResult => {
  return useMemo(() => {
    const todayStr = getLocalTodayStr();

    // 1. Mappatura eventi in RAM (Zero any, conformità al mazzo di carte)
    const allEvents = mapDbEventsToCalendarEvents(rawEvents);

    // 2. Filtraggio in RAM
    const hasModalSearch =
      Boolean(modalFilters.keyword.trim()) ||
      modalFilters.categoryId !== 'all' ||
      modalFilters.timeframe !== 'all' ||
      modalFilters.durationType !== 'all' ||
      Boolean(modalFilters.startDate) ||
      Boolean(modalFilters.endDate);

    const filtered = allEvents.filter((event) => {
      const eventDate = event.dateStr || '';
      const isEventPast = eventDate !== '' && eventDate < todayStr;
      const isEventUpcoming = eventDate !== '' && eventDate >= todayStr;

      // Filtri del Modale di ricerca
      if (hasModalSearch) {
        if (modalFilters.keyword.trim()) {
          const query = modalFilters.keyword.toLowerCase().trim();
          const matchTitle = event.title.toLowerCase().includes(query);
          const matchDesc = event.description ? event.description.toLowerCase().includes(query) : false;
          const matchLoc = event.location ? event.location.toLowerCase().includes(query) : false;
          if (!matchTitle && !matchDesc && !matchLoc) return false;
        }

        if (modalFilters.categoryId !== 'all') {
          const originalDbEvent = rawEvents.find((e) => String(e.id) === String(event.originalId));
          const catId = originalDbEvent?.user_category_id || originalDbEvent?.category?.id;
          if (String(catId) !== modalFilters.categoryId) {
            return false;
          }
        }

        if (modalFilters.timeframe === 'upcoming' && !isEventUpcoming) return false;
        if (modalFilters.timeframe === 'past' && !isEventPast) return false;

        if (modalFilters.durationType === 'timed' && event.tutto_il_giorno) return false;
        if (modalFilters.durationType === 'allDay' && !event.tutto_il_giorno) return false;

        if (modalFilters.startDate && eventDate < modalFilters.startDate) return false;
        if (modalFilters.endDate && eventDate > modalFilters.endDate) return false;
      }

      return true;
    });

    // 3. Ordinamento colonne
    const sorted = [...filtered].sort((a, b) => {
      let comparison: number;
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        case 'startDate': {
          const dateA = `${a.dateStr || '9999-99-99'} ${a.time || '00:00'}`;
          const dateB = `${b.dateStr || '9999-99-99'} ${b.time || '00:00'}`;
          comparison = dateA.localeCompare(dateB);
          break;
        }
        case 'endDate': {
          const dateA = `${a.endDateStr || a.dateStr || '9999-99-99'} ${a.endTime || '23:59'}`;
          const dateB = `${b.endDateStr || b.dateStr || '9999-99-99'} ${b.endTime || '23:59'}`;
          comparison = dateA.localeCompare(dateB);
          break;
        }
        case 'allDay': {
          const allDayA = a.tutto_il_giorno ? 1 : 0;
          const allDayB = b.tutto_il_giorno ? 1 : 0;
          comparison = allDayA - allDayB;
          break;
        }
        case 'recurrence': {
          const recA = formatEventRecurrence(a.rrule);
          const recB = formatEventRecurrence(b.rrule);
          comparison = recA.localeCompare(recB);
          break;
        }
        case 'created':
        default:
          comparison = (Number(a.originalId) || 0) - (Number(b.originalId) || 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    // 4. Paginazione
    const { paginatedItems, totalPages: totalPagesCount } = paginate(sorted, currentPage, pageSize);

    return {
      filteredEvents: sorted,
      totalPages: totalPagesCount,
      paginatedEvents: paginatedItems,
    };
  }, [
    rawEvents,
    modalFilters,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
  ]);
};
