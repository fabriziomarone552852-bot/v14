// src/components/archive/reviews/useReviewsPageLogic.ts
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { useCategories } from '@/hooks/useCategories';
import type { TabItem } from '@/components/shared/layout/SegmentedTabs';
import {
  useReviewArchiveData,
  type ReviewTabType,
  type ReviewFilterState,
  type MonthReviewItem,
  type YearReviewItem,
} from '@/hooks/useReviewArchiveData';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { useModal } from '@/hooks/useModals';
import { useArchiveHeader } from '@/context/ArchiveHeaderContext';
import type { MonthlyEntryResponse } from '@/types/monthlyentries';
import type { DbYearlyEntry } from '@/types/yearlyentries';

export const initialReviewFilterState: ReviewFilterState = {
  keyword: '',
  tag: '',
  status: 'all',
};

export const useReviewsPageLogic = () => {
  const { data: categories = [] } = useCategories();

  // 1. CARICAMENTO DATI IN RAM CON REACT QUERY
  const { data: rawMonthlyEntries = [], isLoading: loadingMonths, isError: monthsError } = useQuery<
    MonthlyEntryResponse[]
  >({
    queryKey: ['monthly_entries'],
    queryFn: async () => {
      const res = await api.get<MonthlyEntryResponse[]>('/monthly-entries');
      return Array.isArray(res) ? res : [];
    },
  });

  const { data: rawYearlyEntries = [], isLoading: loadingYears, isError: yearsError } = useQuery<
    DbYearlyEntry[]
  >({
    queryKey: ['yearly_entries'],
    queryFn: async () => {
      const res = await api.get<DbYearlyEntry[]>('/yearly-entries');
      return Array.isArray(res) ? res : [];
    },
  });

  const loading = loadingMonths || loadingYears;
  const isError = monthsError || yearsError;

  // 2. STATO TAB, FILTRI E PAGINAZIONE
  const [activeTab, setActiveTab] = useState<ReviewTabType>('months');
  const [filters, setFilters] = useState<ReviewFilterState>(initialReviewFilterState);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 3. CALCOLO DINAMICO DEL PAGE SIZE IN BASE ALL'ALTEZZA
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 48,
    defaultPageSize: 8,
    minItems: 3,
    maxItems: 30,
  });

  // 4. MODALI
  const filterModal = useModal();
  const monthModal = useModal<Date>();
  const yearModal = useModal<number>();

  // 5. HOOK DI ELABORAZIONE IN RAM
  const {
    monthsCount,
    yearsCount,
    filteredItems,
    paginatedItems,
    totalPages,
    availableTags,
  } = useReviewArchiveData({
    rawMonthlyEntries,
    rawYearlyEntries,
    categories,
    activeTab,
    filters,
    currentPage,
    pageSize,
  });

  // Conteggio filtri attivi
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.keyword.trim()) count++;
    if (filters.tag.trim()) count++;
    if (filters.status !== 'all') count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  const handleResetFilters = () => {
    setFilters(initialReviewFilterState);
    setCurrentPage(1);
  };

  const handleTabSwitch = (tab: ReviewTabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Configurazione Slider / Tabs
  const tabsConfig: TabItem<ReviewTabType>[] = useMemo(
    () => [
      {
        id: 'months',
        label: 'Mesi',
        icon: '📅',
        count: monthsCount,
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/60',
      },
      {
        id: 'years',
        label: 'Anni',
        icon: '📆',
        count: yearsCount,
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
      },
    ],
    [monthsCount, yearsCount]
  );

  // Apertura modale di revisione corrispondente
  const handleSelectReview = (item: MonthReviewItem | YearReviewItem) => {
    if (activeTab === 'months') {
      monthModal.open((item as MonthReviewItem).monthDate);
    } else {
      yearModal.open((item as YearReviewItem).year);
    }
  };

  // 6. REGISTRAZIONE HEADER ARCHIVIO PER MOBILE
  useArchiveHeader({
    title: 'Review Mesi & Anni',
    onOpenSearch: filterModal.open,
    activeFiltersCount,
  });

  return {
    loading,
    isError,
    activeTab,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    containerRef,
    filterModal,
    monthModal,
    yearModal,
    filteredItems,
    paginatedItems,
    totalPages,
    availableTags,
    activeFiltersCount,
    hasActiveFilters,
    tabsConfig,
    handleResetFilters,
    handleTabSwitch,
    handleSelectReview,
  };
};
