// src/views/Archive/HabitsPage.tsx
import React, { useMemo, useState } from 'react';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';
import { HabitIcon, UndoIcon } from '@/components/shared/utils/Icons';
import { Pagination } from '@/components/shared/utils/Pagination';
import { ArchiveTabs, type HabitTabType } from '@/components/archive/habits/ArchiveTabs';
import { HabitFilterBar } from '@/components/archive/habits/HabitFilterBar';
import { RoutineCard } from '@/components/archive/habits/RoutineCard';
import { HabitCard } from '@/components/archive/habits/HabitCard';
import { HabitFilterModal } from '@/components/archive/habits/HabitFilterModal';
import RoutineDetailModal from '@/components/day/RoutineDetailModal';
import RoutineNewModal, {
  type RoutineSavePayload,
} from '@/components/day/RoutineNewModal';
import HabitDetailModal from '@/components/day/HabitDetailModal';
import HabitNewModal, {
  type HabitSavePayload,
} from '@/components/day/HabitNewModal';
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
import { useDynamicPageSize } from '@/hooks/useDynamicPageSize';
import { useModal } from '@/hooks/useModals';
import { getLocalDateString } from '@/utils/dateUtils';
import { ARCHIVE_PANEL_CLASS } from './CategoriesPage';

const initialFilterState: HabitFilterState = {
  keyword: '',
  status: 'all',
  dateFrom: '',
  dateTo: '',
};

export const HabitsPage: React.FC = () => {
  // 1. CARICAMENTO DATI CON REACT QUERY
  const { data: rawHabits = [], isLoading: loading } = useHabits();
  const saveHabitMutation = useSaveHabit();
  const deleteHabitMutation = useDeleteHabit();
  const suspendHabitMutation = useSuspendHabit();
  const resumeHabitMutation = useResumeHabit();

  // 2. STATO TAB ATTIVA E FILTRI
  const [activeTab, setActiveTab] = useState<HabitTabType>('routines');
  const [filters, setFilters] = useState<HabitFilterState>(initialFilterState);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 3. MODALI — useModal<T> al posto di 10 useState separate
  const filterModal = useModal();
  const routineDetailModal = useModal<EnrichedRoutineItem>();
  const routineFormModal = useModal<EnrichedRoutineItem>();
  const habitDetailModal = useModal<EnrichedHabitItem>();
  const habitFormModal = useModal<EnrichedHabitItem>();

  // 4. CALCOLO DINAMICO DEL PAGE SIZE IN BASE ALL'ALTEZZA
  const { containerRef, pageSize } = useDynamicPageSize({
    rowHeight: 230,
    columns: (w) => (w >= 1024 ? 3 : w >= 640 ? 2 : 1),
    defaultPageSize: 6,
    minItems: 2,
    maxItems: 18,
  });

  // 5. ELABORAZIONE DATI IN RAM
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

  // --- AZIONI CREAZIONE / MODIFICA ---
  const handleOpenNew = () => {
    if (activeTab === 'routines') {
      routineFormModal.open(null);
    } else {
      habitFormModal.open(null);
    }
  };

  // --- AZIONI ROUTINE ---
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
    if (!routine?.activePeriod) return;
    await suspendHabitMutation.mutateAsync({
      habitId: routine.id,
      periodId: routine.activePeriod.id,
      endDate: getLocalDateString(),
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

  // --- AZIONI HABIT ---
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
    if (!habit?.activePeriod) return;
    await suspendHabitMutation.mutateAsync({
      habitId: habit.id,
      periodId: habit.activePeriod.id,
      endDate: getLocalDateString(),
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

  return (
    <div className="h-full flex flex-col gap-3.5 max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER STANDARD */}
      <ArchiveHeader
        title="HABITS & ROUTINE"
        subtitle="Monitora le tue abitudini quotidiane e la regolarità delle tue routine periodiche."
        icon={<HabitIcon className="h-6 w-6 text-white" />}
        className={ARCHIVE_PANEL_CLASS}
      />

      {/* 2. SCHEDE TIPO CHROME (ROUTINES / HABITS) */}
      <div className="flex items-center justify-between">
        <ArchiveTabs
          activeTab={activeTab}
          onTabChange={handleTabSwitch}
          routinesCount={routinesCount}
          habitsCount={habitsCount}
        />
      </div>

      {/* 3. BARRA AZIONI (NUOVA ROUTINE / HABIT + RICERCA) */}
      <HabitFilterBar
        activeTab={activeTab}
        onOpenNew={handleOpenNew}
        onOpenSearch={filterModal.open}
        activeFiltersCount={activeFiltersCount}
        panelClass={ARCHIVE_PANEL_CLASS}
      />

      {/* 4. GRIGLIA CONTENUTI */}
      <div className={`${ARCHIVE_PANEL_CLASS} flex flex-col flex-1 min-h-0 overflow-hidden`}>
        <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold">Caricamento in corso...</span>
            </div>
          ) : totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <div className="p-4 rounded-full bg-slate-50 text-slate-400 mb-3 border border-slate-100">
                <HabitIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Nessun {activeTab === 'routines' ? 'routine' : 'habit'} trovato
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {hasActiveFilters
                  ? 'Nessun elemento corrisponde ai filtri selezionati. Prova ad azzerarli.'
                  : `Non ci sono ${activeTab === 'routines' ? 'routine' : 'abitudini'} registrate.`}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                >
                  <UndoIcon className="w-3.5 h-3.5" />
                  <span>Azzera filtri</span>
                </button>
              )}
            </div>
          ) : activeTab === 'routines' ? (
            /* GRIGLIA A 3 COLONNE PER ROUTINES (TARGHE CON IMMAGINE) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(paginatedItems as EnrichedRoutineItem[]).map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  onClick={() => handleSelectRoutine(routine)}
                />
              ))}
            </div>
          ) : (
            /* GRIGLIA A 3/4 COLONNE PER HABITS (CARD BIANCHE CON EMOJI) */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(paginatedItems as EnrichedHabitItem[]).map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onClick={() => handleSelectHabit(habit)}
                />
              ))}
            </div>
          )}
        </div>

        {/* PAGINAZIONE INFERIORE */}
        {totalPages > 1 && (
          <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center shrink-0">
            <Pagination
              current={currentPage}
              total={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* 5. MODALE FILTRI & RICERCA IN OVERLAY GLOBALE */}
      <HabitFilterModal
        isOpen={filterModal.isOpen}
        onClose={filterModal.close}
        filters={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        activeTab={activeTab}
      />

      {/* 6. MODALI ROUTINE (DETTAGLIO E FORM) */}
      <RoutineDetailModal
        isOpen={routineDetailModal.isOpen}
        onClose={routineDetailModal.close}
        selectedRoutine={routineDetailModal.data}
        onEditClick={handleEditRoutineFromDetail}
        onDeleteClick={handleDeleteRoutine}
        isAttiva={routineDetailModal.data?.isAttiva ?? true}
        onSuspendClick={handleSuspendRoutine}
        onResumeClick={handleResumeRoutine}
      />

      <RoutineNewModal
        isOpen={routineFormModal.isOpen}
        onClose={routineFormModal.close}
        routineToEdit={routineFormModal.data}
        onSave={handleSaveRoutine}
      />

      {/* 7. MODALI HABIT (DETTAGLIO E FORM) */}
      <HabitDetailModal
        isOpen={habitDetailModal.isOpen}
        onClose={habitDetailModal.close}
        selectedHabit={habitDetailModal.data}
        onEditClick={handleEditHabitFromDetail}
        onDeleteClick={handleDeleteHabit}
        isAttiva={habitDetailModal.data?.isAttiva ?? true}
        onSuspendClick={handleSuspendHabit}
        onResumeClick={handleResumeHabit}
      />

      <HabitNewModal
        isOpen={habitFormModal.isOpen}
        onClose={habitFormModal.close}
        habitToEdit={habitFormModal.data}
        onSave={handleSaveHabit}
      />
    </div>
  );
};

export default HabitsPage;
