// src/views/Archive/CountdownsPage.tsx
import React from 'react';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';
import { CountdownIcon } from '@/components/shared/utils/Icons';
import { CountdownFilterBar } from '@/components/archive/countdowns/CountdownFilterBar';
import { CountdownsPageGrid } from '@/components/archive/countdowns/CountdownsPageGrid';
import { CountdownsPageModals } from '@/components/archive/countdowns/CountdownsPageModals';
import { useCountdownsPageLogic } from '@/components/archive/countdowns/useCountdownsPageLogic';
import { ARCHIVE_PANEL_CLASS } from './CategoriesPage';

export const CountdownsPage: React.FC = () => {
  const logic = useCountdownsPageLogic();

  return (
    <div className="h-full flex flex-col gap-2 sm:gap-3.5 w-full max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER STANDARD */}
      <ArchiveHeader
        title="GESTIONE COUNTDOWN"
        subtitle="Tieni traccia dei giorni mancanti alle tue date più importanti."
        icon={<CountdownIcon className="w-5 h-5 text-white" />}
        className={ARCHIVE_PANEL_CLASS}
      />

      {/* 2. RIGA AZIONI: TASTO NUOVO COUNTDOWN E LENTE DI RICERCA */}
      <CountdownFilterBar
        onOpenNewCountdown={logic.handleOpenNew}
        onOpenSearch={logic.filterModal.open}
        activeFiltersCount={logic.activeFiltersCount}
        panelClass={ARCHIVE_PANEL_CLASS}
      />

      {/* 3. GRIGLIA COUNTDOWN */}
      <CountdownsPageGrid
        loading={logic.loading}
        isError={Boolean(logic.isError)}
        totalCount={logic.totalCount}
        hasActiveFilters={logic.hasActiveFilters}
        onResetFilters={logic.handleResetFilters}
        onRetry={() => logic.queryClient.refetchQueries()}
        paginatedCountdowns={logic.paginatedCountdowns}
        onSelectCountdown={logic.handleSelectCountdown}
        containerRef={logic.containerRef}
        currentPage={logic.currentPage}
        totalPages={logic.totalPages}
        onPageChange={logic.setCurrentPage}
        panelClass={ARCHIVE_PANEL_CLASS}
      />

      {/* 4. MODALI */}
      <CountdownsPageModals
        isMobile={logic.isMobile}
        filterModal={logic.filterModal}
        filters={logic.filters}
        onFilterChange={logic.setFilters}
        onResetFilters={logic.handleResetFilters}
        hasActiveFilters={logic.hasActiveFilters}
        onPageReset={() => logic.setCurrentPage(1)}
        detailModal={logic.detailModal}
        formModal={logic.formModal}
        onEditFromDetail={logic.handleEditFromDetail}
        onDelete={logic.handleDelete}
        onRenew={logic.handleRenew}
        onSaveCountdown={logic.handleSaveCountdown}
      />
    </div>
  );
};

export default CountdownsPage;
