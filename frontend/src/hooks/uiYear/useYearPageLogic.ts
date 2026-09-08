// frontend/src/hooks/uiYear/useYearPageLogic.ts
import { useState } from 'react';
import { useYearNavigation } from './useYearNavigation';
import { useAgendaYear, type SyncYearResponse } from '@/hooks/useAgendaYear';
import { useYearEntries } from './useYearEntries';
import { useYearBingo } from './useYearBingo';
import { useYearReview } from './useYearReview';
import { useYearHighlights } from './useYearHighlights';

import type { DailyEntry } from '@/types/dailyentries';
import type { Habit } from '@/types/habits';

export type YearSidebarTab = 'propositi' | 'moods' | 'spheres';

export interface UseYearPageLogicResult {
  state: {
    selectedYear: number;
    isCurrentYear: boolean;
    isLoading: boolean;
    isError: boolean;
    yearData: SyncYearResponse | undefined;
    activeSidebarTab: YearSidebarTab;
    setActiveSidebarTab: (tab: YearSidebarTab) => void;
  };
  nav: ReturnType<typeof useYearNavigation>;
  apiData: {
    entries: ReturnType<typeof useYearEntries>;
    dailyEntries: DailyEntry[];
    tasksCompleted: number;
    tasksTotal: number;
    tasksByMonth: Record<number, number>;
    tasksByWeekday: Record<number, number>;
    habits: Habit[];
  };
  handlers: {
    handlePrevYear: () => void;
    handleNextYear: () => void;
    handleResetCurrentYear: () => void;
    handleSelectYear: (year: number) => void;
  };
  highlights: ReturnType<typeof useYearHighlights>;
  review: ReturnType<typeof useYearReview>;
  bingo: ReturnType<typeof useYearBingo>;
}

export const useYearPageLogic = (): UseYearPageLogicResult => {
  const nav = useYearNavigation();
  const agendaYear = useAgendaYear(nav.selectedYear);

  const entries = useYearEntries(agendaYear.yearData, nav.selectedYear);
  const bingo = useYearBingo(agendaYear.yearData, nav.selectedYear);
  const highlights = useYearHighlights(
    nav.selectedYear,
    agendaYear.yearData?.events ?? [],
    agendaYear.yearData?.tasks ?? []
  );

  const review = useYearReview(nav.selectedYear, entries.entries, nav.isCurrentYear, {
    assignedTags: entries.assignedTags,
    allTags: entries.allTags,
    tagEntryMap: entries.tagEntryMap,
    onAddTag: entries.handleAddTag,
    onCreateAndAddTag: entries.handleCreateAndAddTag,
    onRemoveTag: entries.handleRemoveTag,
  });

  const [activeSidebarTab, setActiveSidebarTab] = useState<YearSidebarTab>('moods');

  return {
    state: {
      selectedYear: nav.selectedYear,
      isCurrentYear: nav.isCurrentYear,
      isLoading: agendaYear.isLoading,
      isError: agendaYear.isError,
      yearData: agendaYear.yearData,
      activeSidebarTab,
      setActiveSidebarTab,
    },
    nav,
    apiData: {
      entries,
      dailyEntries: agendaYear.yearData?.dailyEntries || [],
      ...(() => {
        const allTasks = agendaYear.yearData?.tasks || [];
        const yearTasks = allTasks.filter(t => {
          if (!t.data_scadenza) return false;
          const dStr = t.data_scadenza.split('T')[0];
          const y = parseInt(dStr.split('-')[0], 10);
          return y === nav.selectedYear;
        });

        const tasksCompleted = yearTasks.filter(t => t.fatto).length;
        const tasksTotal = yearTasks.length;
        const tasksByMonth: Record<number, number> = {};
        const tasksByWeekday: Record<number, number> = {};
        
        yearTasks.forEach(t => {
          // Solo i task completati concorrono alle statistiche di produttività
          if (t.fatto && t.data_scadenza) {
            const dStr = t.data_scadenza.split('T')[0];
            const [y, mStr, dayStr] = dStr.split('-').map(Number);
            if (y === nav.selectedYear) {
              const d = new Date(y, mStr - 1, dayStr);
              const m = mStr; // 1..12
              const w = (d.getDay() + 6) % 7; // 0 = Lun, 1 = Mar, ..., 6 = Dom
              tasksByMonth[m] = (tasksByMonth[m] || 0) + 1;
              tasksByWeekday[w] = (tasksByWeekday[w] || 0) + 1;
            }
          }
        });
        
        return {
          tasksCompleted,
          tasksTotal,
          tasksByMonth,
          tasksByWeekday,
          habits: agendaYear.yearData?.habits || [],
        };
      })(),
    },
    handlers: {
      handlePrevYear: nav.handlePrevYear,
      handleNextYear: nav.handleNextYear,
      handleResetCurrentYear: nav.handleResetCurrentYear,
      handleSelectYear: nav.setSelectedYear,
    },
    highlights,
    review,
    bingo,
  };
};
