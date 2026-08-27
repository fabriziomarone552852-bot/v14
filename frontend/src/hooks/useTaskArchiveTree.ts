// src/hooks/useTaskArchiveTree.ts
import { useMemo } from 'react';
import type { DbTask } from '@/types';
import type { TaskFilterState } from '@/components/archive/tasks/TaskFilterModal';
import type { TaskSortField, TaskSortDirection } from '@/components/archive/tasks/TaskTableHeader';
import type { TaskStats } from '@/components/archive/tasks/TaskStatsOverview';
import { getLocalTodayStr } from '@/utils/dateUtils';
import type { TaskTreeNode } from '@/components/archive/tasks/TaskTreeRow';
import { paginate } from '@/utils/paginationUtils';
import { getPriorityWeight } from '@/utils/calendarLayoutUtils';

interface UseTaskArchiveTreeOptions {
  rawTasks: DbTask[];
  modalFilters: TaskFilterState;
  sortField: TaskSortField;
  sortDirection: TaskSortDirection;
  currentPage: number;
  pageSize?: number;
}

export interface TaskArchiveTreeResult {
  filteredRoots: TaskTreeNode[];
  paginatedRoots: TaskTreeNode[];
  totalStats: TaskStats;
  totalPages: number;
  isSearchMode: boolean;
}

export const useTaskArchiveTree = ({
  rawTasks,
  modalFilters,
  sortField,
  sortDirection,
  currentPage,
  pageSize = 8,
}: UseTaskArchiveTreeOptions): TaskArchiveTreeResult => {
  return useMemo(() => {
    const todayStr = getLocalTodayStr();

    // 1. Mappatura e unificazione dati in RAM
    const allTasksList: TaskTreeNode[] = rawTasks.map((task) => ({
      ...task,
      children: [],
      category_name: task.category?.category_name,
      category_color: task.category?.colore || undefined,
    }));

    const taskMap = new Map<number, TaskTreeNode>();
    allTasksList.forEach((t) => taskMap.set(t.id, t));

    // 2. Costruzione Gerarchia Genitore -> Figli
    const roots: TaskTreeNode[] = [];
    allTasksList.forEach((node) => {
      const parentId = node.parent_id;
      if (parentId) {
        const parent = taskMap.get(parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        if (!roots.some((r) => r.id === node.id)) {
          roots.push(node);
        }
      }
    });

    // 3. Statistiche complessive su tutti i task e sottotask
    const totalCount = allTasksList.length;
    const completedCount = allTasksList.filter((t) => t.fatto).length;
    const activeCount = allTasksList.filter((t) => !t.fatto).length;
    const overdueCount = allTasksList.filter(
      (t) => !t.fatto && !!t.data_scadenza && t.data_scadenza.substring(0, 10) < todayStr
    ).length;

    // 4. Verifica se la ricerca modale è attiva
    const hasModalSearch =
      Boolean(modalFilters.keyword.trim()) ||
      modalFilters.status !== 'all' ||
      modalFilters.noDeadlineOnly ||
      modalFilters.categoryId !== 'all' ||
      modalFilters.priority !== 'all' ||
      Boolean(modalFilters.dateDeadline);

    // 5. Criterio di corrispondenza filtri
    const matchesModalFilters = (node: TaskTreeNode): boolean => {
      // Filtro Stato
      if (modalFilters.status === 'open' && node.fatto) return false;
      if (modalFilters.status === 'completed' && !node.fatto) return false;

      // Filtro Scadenza
      if (modalFilters.noDeadlineOnly && Boolean(node.data_scadenza)) return false;
      if (
        modalFilters.dateDeadline &&
        !modalFilters.noDeadlineOnly &&
        (!node.data_scadenza || node.data_scadenza.substring(0, 10) > modalFilters.dateDeadline)
      ) {
        return false;
      }

      // Filtro Categoria
      if (
        modalFilters.categoryId !== 'all' &&
        String(node.user_category_id || node.category?.id) !== modalFilters.categoryId
      ) {
        return false;
      }

      // Filtro Priorità
      if (modalFilters.priority !== 'all' && node.priorita !== modalFilters.priority) {
        return false;
      }

      // Filtro Parole Chiave (Titolo, Note o Luogo)
      if (modalFilters.keyword.trim()) {
        const query = modalFilters.keyword.toLowerCase().trim();
        const matchTitle = node.titolo ? node.titolo.toLowerCase().includes(query) : false;
        const matchDesc = node.descrizione ? node.descrizione.toLowerCase().includes(query) : false;
        const matchLuogo = node.luogo ? node.luogo.toLowerCase().includes(query) : false;
        if (!matchTitle && !matchDesc && !matchLuogo) return false;
      }

      return true;
    };

    // 6. Selezione elementi da mostrare:
    // - In modalità normale: albero canonico con radici principali
    // - In modalità ricerca: estrazione di tutte le task e sottotask corrispondenti come entità singole
    const displayNodes: TaskTreeNode[] = !hasModalSearch
      ? roots
      : allTasksList.filter((node) => matchesModalFilters(node));

    // 7. Ordinamento
    const sorted = [...displayNodes].sort((a, b) => {
      let comparison: number;
      switch (sortField) {
        case 'title':
          comparison = a.titolo.localeCompare(b.titolo);
          break;
        case 'category': {
          const catA = a.category?.category_name || a.category_name || '';
          const catB = b.category?.category_name || b.category_name || '';
          comparison = catA.localeCompare(catB);
          break;
        }
        case 'priority': {
          const weightA = getPriorityWeight(a.priorita);
          const weightB = getPriorityWeight(b.priorita);
          comparison = weightA - weightB;
          break;
        }
        case 'deadline': {
          const dateA = a.data_scadenza || '9999-99-99';
          const dateB = b.data_scadenza || '9999-99-99';
          comparison = dateA.localeCompare(dateB);
          break;
        }
        case 'created':
        default:
          comparison = (a.id || 0) - (b.id || 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    // 8. Paginazione
    const { paginatedItems, totalPages: totalPagesCount } = paginate(sorted, currentPage, pageSize);

    return {
      filteredRoots: sorted,
      paginatedRoots: paginatedItems,
      totalStats: {
        total: totalCount,
        active: activeCount,
        completed: completedCount,
        overdue: overdueCount,
      },
      totalPages: totalPagesCount,
      isSearchMode: hasModalSearch,
    };
  }, [
    rawTasks,
    modalFilters,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
  ]);
};
