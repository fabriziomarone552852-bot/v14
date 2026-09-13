// src/components/archive/habits/useHabitsPageLogic.ts
import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '@/mobile/hooks/useIsMobile';
import {
  useHabits,
  useSaveHabit,
  useDeleteHabit,
  useSuspendHabit,
  useResumeHabit,
} from '@/hooks/useHabits';
import {
  useHabitArchiveData,
  type HabitFilterState,
  type EnrichedRoutineItem,
  type EnrichedHabitItem,
} from '@/hooks/useHabitArchiveData';
import type { HabitTabType } from '@/components/archive/habits/ArchiveTabs';
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { useModal } from '@/hooks/useModals';
import { useArchiveHeader } from '@/context/ArchiveHeaderContext';
import { getLocalDateString } from '@/utils/dateUtils';
import { calculateSafeSuspendDate, getActivePeriodToSuspend } from '@/utils/habitUtils';
import type { RoutineSavePayload } from '@/components/day/RoutineNewModal';
import type { HabitSavePayload } from '@/components/day/HabitNewModal';

const initialFilterState: HabitFilterState = {
  keyword: '',
  status: 'all',
  dateFrom: '',
  dateTo: '',
};

export const useHabitsPageLogic = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Caricamento dati e mutazioni
  const { data: rawHabits = [], isLoading: loading, isError } = useHabits();
  const saveHabitMutation = useSaveHabit();
  const deleteHabitMutation = useDeleteHabit();
  const suspendHabitMutation = useSuspendHabit();
  const resumeHabitMutation = useResumeHabit();

  // Stato tab attiva, filtri e paginazione
  const [activeTab, setActiveTab] = useState<HabitTabType>('routines');
  const [filters, setFilters] = useState<HabitFilterState>(initialFilterState);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modali
  const filterModal = useModal();
  const routineDetailModal = useModal<EnrichedRoutineItem>();
  const routineFormModal = useModal<EnrichedRoutineItem>();
  const habitDetailModal = useModal<EnrichedHabitItem>();
  const habitFormModal = useModal<EnrichedHabitItem>();

  // Calcolo dinamico page size
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 145,
    columns: (w) => (w >= 1024 ? 3 : w >= 640 ? 2 : 1),
    defaultPageSize: 6,
    minItems: 2,
    maxItems: 18,
  });

  // Elaborazione dati in RAM
  const {
    routinesCount,
    habitsCount,
    paginatedItems,
    totalPages,
    totalCount,
  } = useHabitArchiveData({
    rawHabits,
    filters,
    activeTab,
    currentPage,
    pageSize,
  });

  // Conteggio filtri attivi
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.keyword.trim()) count++;
    if (filters.status !== 'all') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  const handleResetFilters = () => {
    setFilters(initialFilterState);
    setCurrentPage(1);
  };

  const handleTabSwitch = (tab: HabitTabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleOpenNew = () => {
    if (activeTab === 'routines') {
      routineFormModal.open(null);
    } else {
      habitFormModal.open(null);
    }
  };

  // Routine Actions
  const handleSelectRoutine = (routine: EnrichedRoutineItem) => routineDetailModal.open(routine);

  const handleEditRoutineFromDetail = () => {
    if (!routineDetailModal.data) return;
    routineFormModal.open(routineDetailModal.data);
    routineDetailModal.close();
  };

  const handleDeleteRoutine = async (id: number) => {
    await deleteHabitMutation.mutateAsync(id);
    routineDetailModal.close();
  };

  const handleSuspendRoutine = async () => {
    const routine = routineDetailModal.data;
    const periodToSuspend = getActivePeriodToSuspend(routine);
    if (!routine || !periodToSuspend) return;

    const todayStr = getLocalDateString();
    const endDate = calculateSafeSuspendDate(periodToSuspend.data_inizio, todayStr);

    await suspendHabitMutation.mutateAsync({
      habitId: routine.id,
      periodId: periodToSuspend.id,
      endDate,
    });
    routineDetailModal.close();
  };

  const handleResumeRoutine = async () => {
    const routine = routineDetailModal.data;
    if (!routine) return;
    await resumeHabitMutation.mutateAsync({
      habitId: routine.id,
      target: routine.targetCompletions || 1,
      startDate: getLocalDateString(),
    });
    routineDetailModal.close();
  };

  const handleSaveRoutine = async (payload: RoutineSavePayload) => {
    const existingId = routineFormModal.data?.id;
    const isEdit = Boolean(existingId);

    await saveHabitMutation.mutateAsync({
      existingId,
      data: {
        titolo: payload.titolo,
        tipo: 'R',
        immagine_url: payload.immagine_url,
        rrule: payload.rrule,
        data_inizio: payload.data_inizio,
        target_completamenti: payload.target_completamenti,
        periods: isEdit
          ? undefined
          : [{ data_inizio: payload.data_inizio, target: payload.target_completamenti }],
      },
    });

    routineFormModal.close();
  };

  // Habit Actions
  const handleSelectHabit = (habit: EnrichedHabitItem) => habitDetailModal.open(habit);

  const handleEditHabitFromDetail = () => {
    if (!habitDetailModal.data) return;
    habitFormModal.open(habitDetailModal.data);
    habitDetailModal.close();
  };

  const handleDeleteHabit = async (id: number) => {
    await deleteHabitMutation.mutateAsync(id);
    habitDetailModal.close();
  };

  const handleSuspendHabit = async () => {
    const habit = habitDetailModal.data;
    const periodToSuspend = getActivePeriodToSuspend(habit);
    if (!habit || !periodToSuspend) return;

    const todayStr = getLocalDateString();
    const endDate = calculateSafeSuspendDate(periodToSuspend.data_inizio, todayStr);

    await suspendHabitMutation.mutateAsync({
      habitId: habit.id,
      periodId: periodToSuspend.id,
      endDate,
    });
    habitDetailModal.close();
  };

  const handleResumeHabit = async () => {
    const habit = habitDetailModal.data;
    if (!habit) return;
    await resumeHabitMutation.mutateAsync({
      habitId: habit.id,
      target: 1,
      startDate: getLocalDateString(),
    });
    habitDetailModal.close();
  };

  const handleSaveHabit = async (payload: HabitSavePayload) => {
    const existingId = habitFormModal.data?.id;
    const isEdit = Boolean(existingId);

    await saveHabitMutation.mutateAsync({
      existingId,
      data: {
        titolo: payload.titolo,
        tipo: 'H',
        immagine_url: payload.immagine_url,
        rrule: payload.rrule,
        data_inizio: payload.data_inizio,
        target_completamenti: 1,
        periods: isEdit
          ? undefined
          : [{ data_inizio: payload.data_inizio, target: 1 }],
      },
    });

    habitFormModal.close();
  };

  // Registrazione header archivio mobile
  useArchiveHeader({
    title: 'Abitudini & Routine',
    onOpenSearch: filterModal.open,
    onOpenNew: handleOpenNew,
    activeFiltersCount,
  });

  return {
    queryClient,
    isMobile,
    activeTab,
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    loading,
    isError,
    routinesCount,
    habitsCount,
    paginatedItems,
    totalPages,
    totalCount,
    activeFiltersCount,
    hasActiveFilters,
    containerRef,
    filterModal,
    routineDetailModal,
    routineFormModal,
    habitDetailModal,
    habitFormModal,
    handleResetFilters,
    handleTabSwitch,
    handleOpenNew,
    handleSelectRoutine,
    handleEditRoutineFromDetail,
    handleDeleteRoutine,
    handleSuspendRoutine,
    handleResumeRoutine,
    handleSaveRoutine,
    handleSelectHabit,
    handleEditHabitFromDetail,
    handleDeleteHabit,
    handleSuspendHabit,
    handleResumeHabit,
    handleSaveHabit,
  };
};
