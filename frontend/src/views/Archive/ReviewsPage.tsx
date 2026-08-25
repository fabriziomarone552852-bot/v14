// src/views/Archive/ReviewsPage.tsx
import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { useCategories } from '@/hooks/useCategories';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';
import { ReviewIcon } from '@/components/shared/utils/Icons';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import { ReviewActionBar } from '@/components/archive/reviews/ReviewActionBar';
import { ReviewTableHeader } from '@/components/archive/reviews/ReviewTableHeader';
import { ReviewTableRow } from '@/components/archive/reviews/ReviewTableRow';
import { ReviewFilterModal } from '@/components/archive/reviews/ReviewFilterModal';
import { MonthReviewArchiveModal } from '@/components/archive/reviews/MonthReviewArchiveModal';
import { YearReviewArchiveModal } from '@/components/archive/reviews/YearReviewArchiveModal';
import {
  useReviewArchiveData,
  type ReviewTabType,
  type ReviewFilterState,
  type MonthReviewItem,
  type YearReviewItem,
} from '@/hooks/useReviewArchiveData';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { useModal } from '@/hooks/useModals';
import { ARCHIVE_PANEL_CLASS } from './CategoriesPage';
import { ERROR_MESSAGES } from '@/data/loadingMessages';
import type { MonthlyEntryResponse } from '@/types/monthlyentries';
import type { DbYearlyEntry } from '@/types/yearlyentries';

const initialFilterState: ReviewFilterState = {
  keyword: '',
  tag: '',
  status: 'all',
};

export const ReviewsPage: React.FC = () => {
  const queryClient = useQueryClient();
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
  const [filters, setFilters] = useState<ReviewFilterState>(initialFilterState);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 3. CALCOLO DINAMICO DEL PAGE SIZE IN BASE ALL'ALTEZZA
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 48,
    defaultPageSize: 8,
    minItems: 3,
    maxItems: 30,
  });

  // 4. MODALI — useModal<T> al posto di coppie useState separate
  // Il dato associato è il valore discriminante (Date per mesi, number per anni)
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
    setFilters(initialFilterState);
    setCurrentPage(1);
  };

  const handleTabSwitch = (tab: ReviewTabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Apertura modale di revisione corrispondente
  const handleSelectReview = (item: MonthReviewItem | YearReviewItem) => {
    if (activeTab === 'months') {
      monthModal.open((item as MonthReviewItem).monthDate);
    } else {
      yearModal.open((item as YearReviewItem).year);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3.5 max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER STANDARD */}
      <ArchiveHeader
        title="REVISIONI PERIODICHE"
        subtitle="Archivio e bilancio delle risposte di review, tag ed obiettivi dei mesi e degli anni."
        icon={<ReviewIcon className="w-5 h-5 text-white" />}
        className={ARCHIVE_PANEL_CLASS}
      />

      {/* 2. RIGA AZIONI: SLIDER SCHEDE A SINISTRA E RICERCA A DESTRA */}
      <ReviewActionBar
        activeTab={activeTab}
        onTabChange={handleTabSwitch}
        monthsCount={monthsCount}
        yearsCount={yearsCount}
        onOpenSearch={filterModal.open}
        activeFiltersCount={activeFiltersCount}
        panelClass={ARCHIVE_PANEL_CLASS}
      />

      {/* 3. TABELLA REVISIONI CON ORDINAMENTO E PAGINAZIONE */}
      <ArchiveTableContainer
        header={<ReviewTableHeader />}
        loading={loading}
        loadingMessage="Caricamento revisioni in corso..."
        isError={isError}
        errorMessage={ERROR_MESSAGES.archive}
        onRetry={() => queryClient.refetchQueries()}
        isEmpty={filteredItems.length === 0}
        emptyIcon={<ReviewIcon className="w-8 h-8 text-slate-400" />}
        emptyTitle="Nessuna revisione trovata"
        emptyDescription={
          hasActiveFilters
            ? 'Nessuna revisione corrisponde ai filtri selezionati. Prova ad azzerarli.'
            : 'Non ci sono revisioni disponibili.'
        }
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className={ARCHIVE_PANEL_CLASS}
        bodyRef={containerRef}
      >
        {paginatedItems.map((item) => (
          <ReviewTableRow
            key={item.id}
            item={item}
            onSelect={handleSelectReview}
          />
        ))}
      </ArchiveTableContainer>

      {/* 4. MODALE FILTRI & RICERCA IN OVERLAY GLOBALE */}
      <ReviewFilterModal
        isOpen={filterModal.isOpen}
        onClose={filterModal.close}
        filters={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        availableTags={availableTags}
        activeTab={activeTab}
      />

      {/* 5. MODALE REVIEW MESE (Apertura al click sulla riga mese) */}
      <MonthReviewArchiveModal
        isOpen={monthModal.isOpen}
        onClose={monthModal.close}
        monthDate={monthModal.data}
      />

      {/* 6. MODALE REVIEW ANNO (Apertura al click sulla riga anno) */}
      <YearReviewArchiveModal
        isOpen={yearModal.isOpen}
        onClose={yearModal.close}
        year={yearModal.data}
      />
    </div>
  );
};

export default ReviewsPage;
