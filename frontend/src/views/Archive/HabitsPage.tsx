// src/views/Archive/HabitsPage.tsx
import React from 'react';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';
import { HabitIcon } from '@/components/shared/utils/Icons';
import { HabitFilterBar } from '@/components/archive/habits/HabitFilterBar';
import { HabitsPageGrid } from '@/components/archive/habits/HabitsPageGrid';
import { HabitsPageModals } from '@/components/archive/habits/HabitsPageModals';
import { useHabitsPageLogic } from '@/components/archive/habits/useHabitsPageLogic';
import { ARCHIVE_PANEL_CLASS } from './CategoriesPage';

export const HabitsPage: React.FC = () => {
  const logic = useHabitsPageLogic();

  return (
    <div className="h-full flex flex-col gap-2 sm:gap-3.5 w-full max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER STANDARD */}
      <ArchiveHeader
        title="HABITS & ROUTINE"
        subtitle="Monitora le tue abitudini quotidiane e la regolarità delle tue routine periodiche."
        icon={<HabitIcon className="w-5 h-5 text-white" />}
        className={ARCHIVE_PANEL_CLASS}
      />

      {/* 2. BARRA AZIONI (NUOVA ROUTINE / HABIT + SLIDER CENTRALE + RICERCA) */}
      <HabitFilterBar
        activeTab={logic.activeTab}
        onTabChange={logic.handleTabSwitch}
        routinesCount={logic.routinesCount}
        habitsCount={logic.habitsCount}
        onOpenNew={logic.handleOpenNew}
        onOpenSearch={logic.filterModal.open}
        activeFiltersCount={logic.activeFiltersCount}
        panelClass={ARCHIVE_PANEL_CLASS}
      />

      {/* 3. GRIGLIA CONTENUTI */}
      <HabitsPageGrid
        activeTab={logic.activeTab}
        loading={logic.loading}
        isError={Boolean(logic.isError)}
        totalCount={logic.totalCount}
        hasActiveFilters={logic.hasActiveFilters}
        onResetFilters={logic.handleResetFilters}
        onRetry={() => logic.queryClient.refetchQueries()}
        paginatedItems={logic.paginatedItems}
        onSelectRoutine={logic.handleSelectRoutine}
        onSelectHabit={logic.handleSelectHabit}
        containerRef={logic.containerRef}
        currentPage={logic.currentPage}
        totalPages={logic.totalPages}
        onPageChange={logic.setCurrentPage}
        panelClass={ARCHIVE_PANEL_CLASS}
      />

      {/* 4. MODALI FILTRI, ROUTINE E HABIT */}
      <HabitsPageModals
        isMobile={logic.isMobile}
        activeTab={logic.activeTab}
        filterModal={logic.filterModal}
        filters={logic.filters}
        onFilterChange={logic.setFilters}
        onResetFilters={logic.handleResetFilters}
        hasActiveFilters={logic.hasActiveFilters}
        onPageReset={() => logic.setCurrentPage(1)}
        routineDetailModal={logic.routineDetailModal}
        routineFormModal={logic.routineFormModal}
        onEditRoutineFromDetail={logic.handleEditRoutineFromDetail}
        onDeleteRoutine={logic.handleDeleteRoutine}
        onSuspendRoutine={logic.handleSuspendRoutine}
        onResumeRoutine={logic.handleResumeRoutine}
        onSaveRoutine={logic.handleSaveRoutine}
        habitDetailModal={logic.habitDetailModal}
        habitFormModal={logic.habitFormModal}
        onEditHabitFromDetail={logic.handleEditHabitFromDetail}
        onDeleteHabit={logic.handleDeleteHabit}
        onSuspendHabit={logic.handleSuspendHabit}
        onResumeHabit={logic.handleResumeHabit}
        onSaveHabit={logic.handleSaveHabit}
      />
    </div>
  );
};

export default HabitsPage;
