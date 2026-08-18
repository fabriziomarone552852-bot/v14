// src/views/Archive/TasksPage.tsx
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { useCategories } from '@/hooks/useCategories';
import { useTaskMutations } from '@/hooks/mutations/useTaskMutations';
import { useTaskModals } from '@/context/TaskModalContext';
import { useTaskArchiveTree } from '@/hooks/useTaskArchiveTree';
import { TaskListIcon } from '@/components/shared/utils/Icons';
import { mapTaskToSummary } from '@/utils/taskUtils';
import { ArchiveTableContainer } from '@/components/shared/layout/ArchiveTableContainer';
import { TaskStatsOverview } from '@/components/tasks/TaskStatsOverview';
import { TaskFilterBar } from '@/components/tasks/TaskFilterBar';
import { TaskTableHeader, type TaskSortField, type TaskSortDirection } from '@/components/tasks/TaskTableHeader';
import { TaskTreeRow } from '@/components/tasks/TaskTreeRow';
import { TaskFilterModal, type TaskFilterState } from '@/components/tasks/TaskFilterModal';
import type { DbTask } from '@/types';

const PANEL_CLASS = 'rounded-2xl border border-slate-200/90 bg-white shadow-xs';

const initialFilterState: TaskFilterState = {
  keyword: '',
  status: 'all',
  noDeadlineOnly: false,
  categoryId: 'all',
  priority: 'all',
  dateDeadline: '',
};

export const TasksPage: React.FC = () => {
  const { openTaskForm, openTaskDetail } = useTaskModals();
  const { data: categories = [] } = useCategories();
  const { toggleTask } = useTaskMutations(['tasks']);

  // 1. CARICAMENTO DATI (Mazzo di carte in React Query)
  const { data: rawTasks = [], isLoading: loading } = useQuery<DbTask[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await api.get<{ items?: DbTask[] } | DbTask[]>('/tasks');
      if (!res) return [];
      return Array.isArray(res) ? res : res?.items ?? [];
    },
  });

  // 2. STATO FILTRI, ORDINAMENTO E PAGINAZIONE
  const [modalFilters, setModalFilters] = useState<TaskFilterState>(initialFilterState);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [sortField, setSortField] = useState<TaskSortField>('created');
  const [sortDirection, setSortDirection] = useState<TaskSortDirection>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // 3. HOOK PER ELABORAZIONE AD ALTE PRESTAZIONI DELL'ALBERO TASK
  const { filteredRoots, paginatedRoots, totalStats, totalPages, isSearchMode } = useTaskArchiveTree({
    rawTasks,
    modalFilters,
    sortField,
    sortDirection,
    currentPage,
  });

  // Conteggio filtri attivi nel modale di ricerca
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (modalFilters.keyword.trim()) count++;
    if (modalFilters.status !== 'all') count++;
    if (modalFilters.noDeadlineOnly) count++;
    if (modalFilters.categoryId !== 'all') count++;
    if (modalFilters.priority !== 'all') count++;
    if (modalFilters.dateDeadline && !modalFilters.noDeadlineOnly) count++;
    return count;
  }, [modalFilters]);

  const hasActiveFilters = activeFiltersCount > 0;

  const handleResetFilters = () => {
    setModalFilters(initialFilterState);
    setCurrentPage(1);
  };

  const handleSort = (field: TaskSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleToggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleTaskCompletion = (task: DbTask) => {
    toggleTask({
      id: task.id,
      isDone: !task.fatto,
    });
  };

  return (
    <div className="h-full flex flex-col gap-3.5 max-w-[1600px] mx-auto relative z-10 pb-1">
      {/* 1. HEADER COMPATTO CON PANORAMICA STATS */}
      <TaskStatsOverview stats={totalStats} panelClass={PANEL_CLASS} />

      {/* 2. RIGA AZIONI: TASTO NUOVA TASK E LENTE DI RICERCA */}
      <TaskFilterBar
        onOpenNewTask={() => openTaskForm()}
        onOpenSearch={() => setIsFilterModalOpen(true)}
        activeFiltersCount={activeFiltersCount}
        panelClass={PANEL_CLASS}
      />

      {/* 3. LISTA DELLE TASK CON GERARCHIA E PAGINAZIONE */}
      <ArchiveTableContainer
        header={
          <TaskTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        }
        loading={loading}
        loadingMessage="Caricamento task in corso..."
        isEmpty={filteredRoots.length === 0}
        emptyIcon={<TaskListIcon className="w-8 h-8 text-slate-400" />}
        emptyTitle="Nessuna task trovata"
        emptyDescription={
          hasActiveFilters
            ? 'Nessuna attività corrisponde ai filtri selezionati. Prova ad azzerarli.'
            : 'Non ci sono task registrate in archivio.'
        }
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className={PANEL_CLASS}
      >
        {paginatedRoots.map((root) => (
          <TaskTreeRow
            key={root.id}
            node={root}
            level={0}
            expandedIds={expandedIds}
            onToggleExpand={handleToggleExpand}
            onSelectTask={(task) => openTaskDetail(mapTaskToSummary(task))}
            onOpenNewSubtask={(task) => openTaskForm(null, task.id)}
            onToggleTaskCompletion={handleToggleTaskCompletion}
            isSearchMode={isSearchMode}
          />
        ))}
      </ArchiveTableContainer>

      {/* 4. MODALE FILTRI & RICERCA IN OVERLAY GLOBALE */}
      <TaskFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={modalFilters}
        onFilterChange={(newFilters) => {
          setModalFilters(newFilters);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
        categories={categories}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
};

export default TasksPage;