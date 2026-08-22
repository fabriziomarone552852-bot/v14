// src/hooks/useHabitArchiveData.ts
import { useMemo } from 'react';
import type { Habit, HabitPeriod } from '@/types/habits';
import type { RoutineItem } from '@/components/day/RoutineColumn';
import type { HabitItem } from '@/components/day/HabitDetailModal';
import { translateRRule } from '@/utils/rruleUtils';
import { formatToItalianShortDate } from '@/utils/dateUtils';
import { rrulestr } from 'rrule';
import { logger } from '@/utils/logger';

export interface HabitFilterState {
  keyword: string;
  status: 'all' | 'active' | 'paused';
  dateFrom: string;
  dateTo: string;
}

export interface EnrichedRoutineItem extends RoutineItem {
  isAttiva: boolean;
  activePeriod?: HabitPeriod;
  frequencyLabel: string;
  nextOccurrenceLabel: string;
  nextOccurrenceDate: Date | null;
}

export interface EnrichedHabitItem extends HabitItem {
  isAttiva: boolean;
  activePeriod?: HabitPeriod;
  startDate?: string;
}

interface UseHabitArchiveDataOptions {
  rawHabits: Habit[];
  filters: HabitFilterState;
  activeTab: 'routines' | 'habits';
  currentPage: number;
  pageSize?: number;
}

/**
 * Calcola la frequenza naturale per la routine:
 * - Se 1 volta: "Ogni settimana", "Ogni mese", "Ogni 2 giorni", ecc.
 * - Se più volte al giorno: aggiunge " • X volte al giorno"
 */
export const formatRoutineFrequency = (
  rruleStr?: string | null,
  startDateStr?: string,
  targetCompletions?: number
): string => {
  const baseTranslation = translateRRule(rruleStr || undefined, startDateStr);
  const completions = targetCompletions || 1;

  if (completions > 1) {
    return `${baseTranslation} • ${completions} volte al giorno`;
  }
  return baseTranslation;
};

/**
 * Calcola la data della prossima scadenza della routine
 */
export const calculateNextRoutineOccurrence = (
  rruleStr?: string | null,
  _startDateStr?: string
): { date: Date | null; label: string } => {
  if (!rruleStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return {
      date: today,
      label: `Prossima scadenza: ${formatToItalianShortDate(today.toISOString().substring(0, 10))}`,
    };
  }

  try {
    const rule = rrulestr(rruleStr);
    const now = new Date();
    const next = rule.after(now, true);

    if (next) {
      const isToday =
        next.getDate() === now.getDate() &&
        next.getMonth() === now.getMonth() &&
        next.getFullYear() === now.getFullYear();

      const nextIso = next.toISOString().substring(0, 10);
      const label = isToday
        ? 'Prossima scadenza: Oggi'
        : `Prossima scadenza: ${formatToItalianShortDate(nextIso)}`;

      return { date: next, label };
    }
  } catch (e) {
    logger.error('Errore calcolo prossima occorrenza RRULE:', e);
  }

  return { date: null, label: 'Nessuna data futura' };
};

export const useHabitArchiveData = ({
  rawHabits,
  filters,
  activeTab,
  currentPage,
  pageSize = 6,
}: UseHabitArchiveDataOptions) => {
  return useMemo(() => {
    // 1. Mappatura & Arricchimento Routines
    const routinesRaw = rawHabits.filter((h) => h.tipo === 'R');
    const enrichedRoutines: EnrichedRoutineItem[] = routinesRaw.map((h) => {
      const periods = h.periods || [];
      const activePeriod = periods.find((p) => !p.data_fine);
      const isAttiva = Boolean(activePeriod);
      const latestPeriod = activePeriod || periods[0];
      const targetCompletions = latestPeriod?.target || 1;
      const startDate = latestPeriod?.data_inizio;

      const frequencyLabel = formatRoutineFrequency(h.rrule, startDate, targetCompletions);
      const { date: nextDate, label: nextLabel } = calculateNextRoutineOccurrence(
        h.rrule,
        startDate
      );

      return {
        id: h.id,
        title: h.titolo,
        titolo: h.titolo,
        rrule: h.rrule || '',
        data_inizio: startDate,
        imageUrl: h.immagine_url || '',
        targetCompletions,
        currentCompletions: 0,
        currentCount: 0,
        done: false,
        periods: periods.map((p) => ({
          id: p.id,
          data_inizio: p.data_inizio,
          data_fine: p.data_fine,
          target: p.target,
        })),
        isAttiva,
        activePeriod,
        frequencyLabel,
        nextOccurrenceLabel: nextLabel,
        nextOccurrenceDate: nextDate,
      };
    });

    // 2. Mappatura & Arricchimento Habits
    const habitsRaw = rawHabits.filter((h) => h.tipo === 'H');
    const enrichedHabits: EnrichedHabitItem[] = habitsRaw.map((h) => {
      const periods = h.periods || [];
      const activePeriod = periods.find((p) => !p.data_fine);
      const isAttiva = Boolean(activePeriod);
      const latestPeriod = activePeriod || periods[0];

      return {
        id: h.id,
        title: h.titolo,
        icon: h.immagine_url || '✨',
        done: false,
        periods: periods.map((p) => ({
          id: p.id,
          data_inizio: p.data_inizio,
          data_fine: p.data_fine,
          target: p.target,
        })),
        isAttiva,
        activePeriod,
        startDate: latestPeriod?.data_inizio,
      };
    });

    // 3. Filtraggio in RAM in base alla tab attiva
    const currentList = activeTab === 'routines' ? enrichedRoutines : enrichedHabits;

    const filtered = currentList.filter((item) => {
      // Filtro Stato (Attivo / In Pausa)
      if (filters.status === 'active' && !item.isAttiva) return false;
      if (filters.status === 'paused' && item.isAttiva) return false;

      // Filtro per Parola Chiave nel nome
      if (filters.keyword.trim()) {
        const q = filters.keyword.toLowerCase().trim();
        if (!item.title.toLowerCase().includes(q)) return false;
      }

      // Filtro per Intervallo Date
      const itemDate =
        activeTab === 'routines'
          ? (item as EnrichedRoutineItem).data_inizio?.substring(0, 10)
          : (item as EnrichedHabitItem).startDate?.substring(0, 10);

      if (itemDate) {
        if (filters.dateFrom && itemDate < filters.dateFrom) return false;
        if (filters.dateTo && itemDate > filters.dateTo) return false;
      }

      return true;
    });

    // 4. Ordinamento: attive prima, poi cronologico / alfabetico
    const sorted = [...filtered].sort((a, b) => {
      if (a.isAttiva !== b.isAttiva) {
        return a.isAttiva ? -1 : 1;
      }
      return a.title.localeCompare(b.title);
    });

    // 5. Paginazione fluida a 12 card per pagina
    const totalPagesCount = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(currentPage, totalPagesCount);
    const startIdx = (safePage - 1) * pageSize;
    const paginated = sorted.slice(startIdx, startIdx + pageSize);

    return {
      routinesCount: enrichedRoutines.length,
      habitsCount: enrichedHabits.length,
      filteredItems: sorted,
      paginatedItems: paginated,
      totalPages: totalPagesCount,
      totalCount: sorted.length,
    };
  }, [rawHabits, filters, activeTab, currentPage, pageSize]);
};
