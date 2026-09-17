import React from 'react';
import type { UseModalResult } from '@/hooks/useModals';
import type { EnrichedRoutineItem, EnrichedHabitItem, HabitFilterState } from '@/hooks/useHabitArchiveData';
import type { HabitTabType } from './ArchiveTabs';
import type { RoutineSavePayload } from '@/components/day/RoutineNewModal';
import type { HabitSavePayload } from '@/components/day/HabitNewModal';

import { HabitFilterModal } from './HabitFilterModal';
import RoutineDetailModal from '@/components/day/RoutineDetailModal';
import RoutineNewModal from '@/components/day/RoutineNewModal';
import HabitDetailModal from '@/components/day/HabitDetailModal';
import HabitNewModal from '@/components/day/HabitNewModal';

import { MobileRoutineDetailModal } from '@/mobile/components/modals/MobileRoutineDetailModal';
import { MobileRoutineNewModal } from '@/mobile/components/modals/MobileRoutineNewModal';
import { MobileHabitDetailModal } from '@/mobile/components/modals/MobileHabitDetailModal';
import { MobileHabitNewModal } from '@/mobile/components/modals/MobileHabitNewModal';

interface HabitsPageModalsProps {
  isMobile: boolean;
  activeTab: HabitTabType;
  /** Il modale filtri non usa .data — unknown è il default di useModal<T> */
  filterModal: UseModalResult<unknown>;
  filters: HabitFilterState;
  onFilterChange: (filters: HabitFilterState) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  onPageReset: () => void;
  // Routine modals & handlers
  routineDetailModal: UseModalResult<EnrichedRoutineItem>;
  routineFormModal: UseModalResult<EnrichedRoutineItem>;
  onEditRoutineFromDetail: () => void;
  onDeleteRoutine: (id: number) => void;
  onSuspendRoutine: () => void;
  onResumeRoutine: () => void;
  onSaveRoutine: (payload: RoutineSavePayload) => void;
  // Habit modals & handlers
  habitDetailModal: UseModalResult<EnrichedHabitItem>;
  habitFormModal: UseModalResult<EnrichedHabitItem>;
  onEditHabitFromDetail: () => void;
  onDeleteHabit: (id: number) => void;
  onSuspendHabit: () => void;
  onResumeHabit: () => void;
  onSaveHabit: (payload: HabitSavePayload) => void;
}

export const HabitsPageModals: React.FC<HabitsPageModalsProps> = ({
  isMobile,
  activeTab,
  filterModal,
  filters,
  onFilterChange,
  onResetFilters,
  hasActiveFilters,
  onPageReset,
  routineDetailModal,
  routineFormModal,
  onEditRoutineFromDetail,
  onDeleteRoutine,
  onSuspendRoutine,
  onResumeRoutine,
  onSaveRoutine,
  habitDetailModal,
  habitFormModal,
  onEditHabitFromDetail,
  onDeleteHabit,
  onSuspendHabit,
  onResumeHabit,
  onSaveHabit,
}) => {
  return (
    <>
      {/* 1. FILTRI OVERLAY */}
      <HabitFilterModal
        isOpen={filterModal.isOpen}
        onClose={filterModal.close}
        filters={filters}
        onFilterChange={(newFilters) => {
          onFilterChange(newFilters);
          onPageReset();
        }}
        onReset={onResetFilters}
        hasActiveFilters={hasActiveFilters}
        activeTab={activeTab}
      />

      {/* 2. MODALI ROUTINE */}
      {isMobile ? (
        <>
          <MobileRoutineDetailModal
            isOpen={routineDetailModal.isOpen}
            onClose={routineDetailModal.close}
            selectedRoutine={routineDetailModal.data}
            onEditClick={onEditRoutineFromDetail}
            onDeleteClick={onDeleteRoutine}
            isAttiva={routineDetailModal.data?.isAttiva ?? true}
            onSuspendClick={onSuspendRoutine}
            onResumeClick={onResumeRoutine}
          />

          <MobileRoutineNewModal
            isOpen={routineFormModal.isOpen}
            onClose={routineFormModal.close}
            routineToEdit={routineFormModal.data}
            onSave={onSaveRoutine}
          />
        </>
      ) : (
        <>
          <RoutineDetailModal
            isOpen={routineDetailModal.isOpen}
            onClose={routineDetailModal.close}
            selectedRoutine={routineDetailModal.data}
            onEditClick={onEditRoutineFromDetail}
            onDeleteClick={onDeleteRoutine}
            isAttiva={routineDetailModal.data?.isAttiva ?? true}
            onSuspendClick={onSuspendRoutine}
            onResumeClick={onResumeRoutine}
          />

          <RoutineNewModal
            isOpen={routineFormModal.isOpen}
            onClose={routineFormModal.close}
            routineToEdit={routineFormModal.data}
            onSave={onSaveRoutine}
          />
        </>
      )}

      {/* 3. MODALI HABIT */}
      {isMobile ? (
        <>
          <MobileHabitDetailModal
            isOpen={habitDetailModal.isOpen}
            onClose={habitDetailModal.close}
            selectedHabit={habitDetailModal.data}
            onEditClick={onEditHabitFromDetail}
            onDeleteClick={onDeleteHabit}
            isAttiva={habitDetailModal.data?.isAttiva ?? true}
            onSuspendClick={onSuspendHabit}
            onResumeClick={onResumeHabit}
          />

          <MobileHabitNewModal
            isOpen={habitFormModal.isOpen}
            onClose={habitFormModal.close}
            habitToEdit={habitFormModal.data}
            onSave={onSaveHabit}
          />
        </>
      ) : (
        <>
          <HabitDetailModal
            isOpen={habitDetailModal.isOpen}
            onClose={habitDetailModal.close}
            selectedHabit={habitDetailModal.data}
            onEditClick={onEditHabitFromDetail}
            onDeleteClick={onDeleteHabit}
            isAttiva={habitDetailModal.data?.isAttiva ?? true}
            onSuspendClick={onSuspendHabit}
            onResumeClick={onResumeHabit}
          />

          <HabitNewModal
            isOpen={habitFormModal.isOpen}
            onClose={habitFormModal.close}
            habitToEdit={habitFormModal.data}
            onSave={onSaveHabit}
          />
        </>
      )}
    </>
  );
};

