// src/views/Archive/HabitsPage.tsx
import React, { useMemo, useState } from 'react';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';
import { HabitIcon, UndoIcon } from '@/components/shared/utils/Icons';
import { ArchiveTabs, type HabitTabType } from '@/components/habits/ArchiveTabs';
import { HabitFilterBar } from '@/components/habits/HabitFilterBar';
import { RoutineCard } from '@/components/habits/RoutineCard';
import { HabitCard } from '@/components/habits/HabitCard';
import { HabitFilterModal } from '@/components/habits/HabitFilterModal';
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
import { getLocalDateString } from '@/utils/dateUtils';

const PANEL_CLASS = 'rounded-2xl border border-slate-200/90 bg-white shadow-xs';

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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 3. STATO MODALI ROUTINE
  const [selectedRoutine, setSelectedRoutine] = useState<EnrichedRoutineItem | null>(null);
  const [isRoutineDetailOpen, setIsRoutineDetailOpen] = useState(false);

  const [routineToEdit, setRoutineToEdit] = useState<EnrichedRoutineItem | null>(null);
  const [isRoutineFormOpen, setIsRoutineFormOpen] = useState(false);

  // 4. STATO MODALI HABIT
  const [selectedHabit, setSelectedHabit] = useState<EnrichedHabitItem | null>(null);
  const [isHabitDetailOpen, setIsHabitDetailOpen] = useState(false);

  const [habitToEdit, setHabitToEdit] = useState<EnrichedHabitItem | null>(null);
  const [isHabitFormOpen, setIsHabitFormOpen] = useState(false);

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
    pageSize: 12,
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
      setRoutineToEdit(null);
      setIsRoutineFormOpen(true);
    } else {
      setHabitToEdit(null);
      setIsHabitFormOpen(true);
    }
  };

  // --- AZIONI ROUTINE ---
  const handleSelectRoutine = (routine: EnrichedRoutineItem) => {
    setSelectedRoutine(routine);
    setIsRoutineDetailOpen(true);
  };

  const handleEditRoutineFromDetail = () => {
    if (!selectedRoutine) return;
    setRoutineToEdit(selectedRoutine);
    setIsRoutineDetailOpen(false);
    setIsRoutineFormOpen(true);
  };

  const handleDeleteRoutine = async (id: number) => {
    try {
      await deleteHabitMutation.mutateAsync(id);
      setIsRoutineDetailOpen(false);
      setSelectedRoutine(null);
    } catch (err) {
      console.error('Errore eliminazione routine:', err);
    }
  };

  const handleSuspendRoutine = async () => {
    if (!selectedRoutine?.activePeriod) return;
    try {
      await suspendHabitMutation.mutateAsync({
        habitId: selectedRoutine.id,
        periodId: selectedRoutine.activePeriod.id,
        endDate: getLocalDateString(),
      });
      setIsRoutineDetailOpen(false);
      setSelectedRoutine(null);
    } catch (err) {
      console.error('Errore sospensione routine:', err);
    }
  };

  const handleResumeRoutine = async () => {
    if (!selectedRoutine) return;
    try {
      await resumeHabitMutation.mutateAsync({
        habitId: selectedRoutine.id,
        target: selectedRoutine.targetCompletions || 1,
        startDate: getLocalDateString(),
      });
      setIsRoutineDetailOpen(false);
      setSelectedRoutine(null);
    } catch (err) {
      console.error('Errore riattivazione routine:', err);
    }
  };

  const handleSaveRoutine = async (payload: RoutineSavePayload) => {
    const isEdit = Boolean(routineToEdit);
    const existingId = routineToEdit?.id;

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

    setIsRoutineFormOpen(false);
    setRoutineToEdit(null);
  };

  // --- AZIONI HABIT ---
  const handleSelectHabit = (habit: EnrichedHabitItem) => {
    setSelectedHabit(habit);
    setIsHabitDetailOpen(true);
  };

  const handleEditHabitFromDetail = () => {
    if (!selectedHabit) return;
    setHabitToEdit(selectedHabit);
    setIsHabitDetailOpen(false);
    setIsHabitFormOpen(true);
  };

  const handleDeleteHabit = async (id: number) => {
    try {
      await deleteHabitMutation.mutateAsync(id);
      setIsHabitDetailOpen(false);
      setSelectedHabit(null);
    } catch (err) {
      console.error('Errore eliminazione abitudine:', err);
    }
  };

  const handleSuspendHabit = async () => {
    if (!selectedHabit?.activePeriod) return;
    try {
      await suspendHabitMutation.mutateAsync({
        habitId: selectedHabit.id,
        periodId: selectedHabit.activePeriod.id,
        endDate: getLocalDateString(),
      });
      setIsHabitDetailOpen(false);
      setSelectedHabit(null);
    } catch (err) {
      console.error('Errore sospensione abitudine:', err);
    }
  };

  const handleResumeHabit = async () => {
    if (!selectedHabit) return;
    try {
      await resumeHabitMutation.mutateAsync({
        habitId: selectedHabit.id,
        target: 1,
        startDate: getLocalDateString(),
      });
      setIsHabitDetailOpen(false);
      setSelectedHabit(null);
    } catch (err) {
      console.error('Errore riattivazione abitudine:', err);
    }
  };

  const handleSaveHabit = async (payload: HabitSavePayload) => {
    const isEdit = Boolean(habitToEdit);
    const existingId = habitToEdit?.id;

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

    setIsHabitFormOpen(false);
    setHabitToEdit(null);
  };

  return (
    <div className="h-full flex flex-col gap-3.5 max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER STANDARD */}
      <ArchiveHeader
        title="HABITS & ROUTINE"
        description="Monitora le tue abitudini quotidiane e la regolarità delle tue routine periodiche."
        icon={<HabitIcon className="h-6 w-6 text-white" />}
        className={PANEL_CLASS}
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
        onOpenSearch={() => setIsFilterModalOpen(true)}
        activeFiltersCount={activeFiltersCount}
        panelClass={PANEL_CLASS}
      />

      {/* 4. GRIGLIA CONTENUTI */}
      <div className={`${PANEL_CLASS} flex flex-col flex-1 min-h-0 overflow-hidden`}>
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
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
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center gap-2 shrink-0">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Precedente
            </button>
            <span className="text-xs font-semibold text-slate-500 px-2">
              Pagina {currentPage} di {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Successiva
            </button>
          </div>
        )}
      </div>

      {/* 5. MODALE FILTRI & RICERCA IN OVERLAY GLOBALE */}
      <HabitFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
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
        isOpen={isRoutineDetailOpen}
        onClose={() => {
          setIsRoutineDetailOpen(false);
          setSelectedRoutine(null);
        }}
        selectedRoutine={selectedRoutine}
        onEditClick={handleEditRoutineFromDetail}
        onDeleteClick={handleDeleteRoutine}
        isAttiva={selectedRoutine?.isAttiva ?? true}
        onSuspendClick={handleSuspendRoutine}
        onResumeClick={handleResumeRoutine}
      />

      <RoutineNewModal
        isOpen={isRoutineFormOpen}
        onClose={() => {
          setIsRoutineFormOpen(false);
          setRoutineToEdit(null);
        }}
        routineToEdit={routineToEdit}
        onSave={handleSaveRoutine}
      />

      {/* 7. MODALI HABIT (DETTAGLIO E FORM) */}
      <HabitDetailModal
        isOpen={isHabitDetailOpen}
        onClose={() => {
          setIsHabitDetailOpen(false);
          setSelectedHabit(null);
        }}
        selectedHabit={selectedHabit}
        onEditClick={handleEditHabitFromDetail}
        onDeleteClick={handleDeleteHabit}
        isAttiva={selectedHabit?.isAttiva ?? true}
        onSuspendClick={handleSuspendHabit}
        onResumeClick={handleResumeHabit}
      />

      <HabitNewModal
        isOpen={isHabitFormOpen}
        onClose={() => {
          setIsHabitFormOpen(false);
          setHabitToEdit(null);
        }}
        habitToEdit={habitToEdit}
        onSave={handleSaveHabit}
      />
    </div>
  );
};

export default HabitsPage;
