// src/views/Archive/ReviewsPage.tsx
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';
import { ReviewIcon } from '@/components/shared/utils/Icons';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import { ArchiveActionBar } from '@/components/shared/layout/ArchiveActionBar';
import { SegmentedTabs } from '@/components/shared/layout/SegmentedTabs';
import { ReviewTableHeader } from '@/components/archive/reviews/ReviewTableHeader';
import { ReviewTableRow } from '@/components/archive/reviews/ReviewTableRow';
import { ReviewsPageModals } from '@/components/archive/reviews/ReviewsPageModals';
import { useReviewsPageLogic } from '@/components/archive/reviews/useReviewsPageLogic';
import { ARCHIVE_PANEL_CLASS } from './CategoriesPage';
import { ERROR_MESSAGES } from '@/data/loadingMessages';

export const ReviewsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const {
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
  } = useReviewsPageLogic();

  return (
    <div className="h-full flex flex-col gap-2 sm:gap-3.5 w-full max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER STANDARD */}
      <ArchiveHeader
        title="REVISIONI PERIODICHE"
        subtitle="Archivio e bilancio delle risposte di review, tag ed obiettivi dei mesi e degli anni."
        icon={<ReviewIcon className="w-5 h-5 text-white" />}
        className={ARCHIVE_PANEL_CLASS}
      />

      {/* 2. RIGA AZIONI: SLIDER SCHEDE E RICERCA */}
      <ArchiveActionBar
        centerContent={
          <SegmentedTabs
            tabs={tabsConfig}
            activeTab={activeTab}
            onChange={handleTabSwitch}
          />
        }
        onOpenSearch={filterModal.open}
        activeFiltersCount={activeFiltersCount}
        className={ARCHIVE_PANEL_CLASS}
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

      {/* 4. MODALI */}
      <ReviewsPageModals
        filterModal={filterModal}
        monthModal={monthModal}
        yearModal={yearModal}
        filters={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        availableTags={availableTags}
        activeTab={activeTab}
      />
    </div>
  );
};

export default ReviewsPage;
