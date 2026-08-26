// frontend/src/hooks/uiYear/useYearPageLogic.ts
import { useState } from 'react';
import { useYearNavigation } from './useYearNavigation';
import { useAgendaYear } from '@/hooks/useAgendaYear';
import { useYearEntries } from './useYearEntries';
import { useYearBingo } from './useYearBingo';
import { useYearReview } from './useYearReview';
import { useYearHighlights } from './useYearHighlights';

import type { DailyEntry } from '@/types/dailyentries';

export type YearSidebarTab = 'propositi' | 'moods' | 'spheres';

export interface UseYearPageLogicResult {
  state: {
    selectedYear: number;
    isCurrentYear: boolean;
    isLoading: boolean;
    isError: boolean;
    activeSidebarTab: YearSidebarTab;
    setActiveSidebarTab: (tab: YearSidebarTab) => void;
  };
  nav: ReturnType<typeof useYearNavigation>;
  apiData: {
    entries: ReturnType<typeof useYearEntries>;
    dailyEntries: DailyEntry[];
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
      activeSidebarTab,
      setActiveSidebarTab,
    },
    nav,
    apiData: {
      entries,
      dailyEntries: agendaYear.yearData?.dailyEntries || [],
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
