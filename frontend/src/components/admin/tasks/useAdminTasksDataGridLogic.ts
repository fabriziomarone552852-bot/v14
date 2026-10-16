// src/components/admin/tasks/useAdminTasksDataGridLogic.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AdminTaskItem, TaskPriority } from '@/api/adminTasksApi';
import {
  fetchAdminTasks,
  updateAdminTask,
  deleteAdminTask,
} from '@/api/adminTasksApi';
import type { AdminCategoryOption } from '@/api/adminEventsApi';
import { fetchAdminCategories } from '@/api/adminEventsApi';
import type { SystemUserItem } from '@/api/adminApi';
import { fetchSystemUsers } from '@/api/adminApi';
import { extractErrorMessage } from '@/utils/errorUtils';

export type TasksDatePreset = 'today' | '7days' | 'month' | 'year' | 'all' | 'custom';
export type TasksSortField = 'data_scadenza' | 'titolo' | 'priorita' | 'username' | 'fatto';

export interface UseAdminTasksDataGridLogicReturn {
  loading: boolean;
  saving: boolean;
  message: { text: string; type: 'success' | 'error' } | null;
  setMessage: (msg: { text: string; type: 'success' | 'error' } | null) => void;
  tasks: AdminTaskItem[];
  users: SystemUserItem[];
  categories: AdminCategoryOption[];
  // Filtri
  datePreset: TasksDatePreset;
  setDatePreset: (preset: TasksDatePreset) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  selectedUserId: number | 'all';
  setSelectedUserId: (id: number | 'all') => void;
  selectedCategoryId: number | 'all';
  setSelectedCategoryId: (id: number | 'all') => void;
  selectedPriority: TaskPriority | 'all';
  setSelectedPriority: (p: TaskPriority | 'all') => void;
  selectedStatus: 'all' | 'pending' | 'completed';
  setSelectedStatus: (s: 'all' | 'pending' | 'completed') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onlyAnomalies: boolean;
  setOnlyAnomalies: (val: boolean) => void;
  // Ordinamento
  sortField: TasksSortField;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: TasksSortField) => void;
  // Dati & Drafts
  filteredTasks: AdminTaskItem[];
  totalTasksCount: number;
  filteredSummary: { count: number; completedCount: number; anomaliesCount: number };
  drafts: Record<number, Partial<AdminTaskItem>>;
  pendingCount: number;
  hasRowChanges: (taskId: number) => boolean;
  getEffectiveTask: (task: AdminTaskItem) => AdminTaskItem;
  handleCellChange: (taskId: number, field: keyof AdminTaskItem, value: unknown) => void;
  handleRevertRow: (taskId: number) => void;
  handleSaveRow: (taskId: number) => Promise<void>;
  handleSaveAllPending: () => Promise<void>;
  handleRevertAllPending: () => void;
  handleDeleteTask: (taskId: number, title: string) => Promise<void>;
  loadAllData: () => Promise<void>;
}

export function useAdminTasksDataGridLogic(): UseAdminTasksDataGridLogicReturn {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [tasks, setTasks] = useState<AdminTaskItem[]>([]);
  const [users, setUsers] = useState<SystemUserItem[]>([]);
  const [categories, setCategories] = useState<AdminCategoryOption[]>([]);

  // Filtri
  const [datePreset, setDatePreset] = useState<TasksDatePreset>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | 'all'>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAnomalies, setOnlyAnomalies] = useState(false);

  // Ordinamento
  const [sortField, setSortField] = useState<TasksSortField>('data_scadenza');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modifiche locali
  const [drafts, setDrafts] = useState<Record<number, Partial<AdminTaskItem>>>({});

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [tasksData, usersData, catsData] = await Promise.all([
        fetchAdminTasks(),
        fetchSystemUsers(),
        fetchAdminCategories(),
      ]);
      setTasks(tasksData);
      setUsers(usersData);
      setCategories(catsData);
      setDrafts({});
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: extractErrorMessage(err, 'Errore nel caricamento del registro attività.'),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Calcolo intervallo date da preset
  const dateBounds = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (datePreset === 'today') {
      return { start: todayStr, end: todayStr };
    }
    if (datePreset === '7days') {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      return { start: past.toISOString().split('T')[0], end: todayStr };
    }
    if (datePreset === 'month') {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
      return { start: `${y}-${m}-01`, end: `${y}-${m}-${lastDay}` };
    }
    if (datePreset === 'year') {
      const y = now.getFullYear();
      return { start: `${y}-01-01`, end: `${y}-12-31` };
    }
    if (datePreset === 'custom') {
      return { start: startDate, end: endDate };
    }
    return { start: '', end: '' };
  }, [datePreset, startDate, endDate]);

  // Rilevamento anomalie
  const isAnomaly = useCallback((t: AdminTaskItem): boolean => {
    if (!t.titolo || !t.titolo.trim()) return true;
    if (t.data_scadenza && t.data_scadenza < t.data_start) return true;
    // Task non completato scaduto da oltre 60 giorni
    if (!t.fatto && t.data_scadenza) {
      const diffMs = Date.now() - new Date(t.data_scadenza).getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays > 60) return true;
    }
    return false;
  }, []);

  // Task filtrati
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Filtro data (su data_scadenza se presente, altrimenti data_start)
    if (dateBounds.start || dateBounds.end) {
      result = result.filter((t) => {
        const refDate = (t.data_scadenza || t.data_start).split('T')[0];
        if (dateBounds.start && refDate < dateBounds.start) return false;
        if (dateBounds.end && refDate > dateBounds.end) return false;
        return true;
      });
    }

    // 2. Filtro Utente
    if (selectedUserId !== 'all') {
      result = result.filter((t) => t.user_id === selectedUserId);
    }

    // 3. Filtro Categoria
    if (selectedCategoryId !== 'all') {
      result = result.filter((t) => t.user_category_id === selectedCategoryId);
    }

    // 4. Filtro Priorità
    if (selectedPriority !== 'all') {
      result = result.filter((t) => t.priorita === selectedPriority);
    }

    // 5. Filtro Stato
    if (selectedStatus === 'pending') {
      result = result.filter((t) => !t.fatto);
    } else if (selectedStatus === 'completed') {
      result = result.filter((t) => t.fatto);
    }

    // 6. Solo anomalie
    if (onlyAnomalies) {
      result = result.filter((t) => isAnomaly(t));
    }

    // 7. Ricerca testuale
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => {
        const tit = (t.titolo || '').toLowerCase();
        const desc = (t.descrizione || '').toLowerCase();
        const luogo = (t.luogo || '').toLowerCase();
        const user = (t.username || '').toLowerCase();
        const cat = (t.category_name || '').toLowerCase();
        return tit.includes(q) || desc.includes(q) || luogo.includes(q) || user.includes(q) || cat.includes(q);
      });
    }

    // 8. Ordinamento
    const priorityWeight: Record<TaskPriority, number> = { Alta: 3, Media: 2, Bassa: 1 };
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'data_scadenza') {
        const dateA = a.data_scadenza || a.data_start || '';
        const dateB = b.data_scadenza || b.data_start || '';
        comparison = dateA.localeCompare(dateB);
      } else if (sortField === 'titolo') {
        comparison = (a.titolo || '').localeCompare(b.titolo || '');
      } else if (sortField === 'priorita') {
        comparison = (priorityWeight[a.priorita] || 0) - (priorityWeight[b.priorita] || 0);
      } else if (sortField === 'username') {
        comparison = (a.username || '').localeCompare(b.username || '');
      } else if (sortField === 'fatto') {
        comparison = Number(a.fatto) - Number(b.fatto);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [
    tasks,
    dateBounds,
    selectedUserId,
    selectedCategoryId,
    selectedPriority,
    selectedStatus,
    onlyAnomalies,
    searchQuery,
    sortField,
    sortDirection,
    isAnomaly,
  ]);

  const filteredSummary = useMemo(() => {
    let completed = 0;
    let anomalies = 0;
    for (const t of filteredTasks) {
      if (t.fatto) completed++;
      if (isAnomaly(t)) anomalies++;
    }
    return {
      count: filteredTasks.length,
      completedCount: completed,
      anomaliesCount: anomalies,
    };
  }, [filteredTasks, isAnomaly]);

  const handleSort = (field: TasksSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const hasRowChanges = useCallback(
    (taskId: number): boolean => {
      return Boolean(drafts[taskId] && Object.keys(drafts[taskId]).length > 0);
    },
    [drafts]
  );

  const pendingCount = useMemo(() => {
    return Object.keys(drafts).filter((id) => {
      const d = drafts[Number(id)];
      return d && Object.keys(d).length > 0;
    }).length;
  }, [drafts]);

  const getEffectiveTask = useCallback(
    (task: AdminTaskItem): AdminTaskItem => {
      const draft = drafts[task.id];
      if (!draft) return task;
      return { ...task, ...draft };
    },
    [drafts]
  );

  const handleCellChange = useCallback(
    (taskId: number, field: keyof AdminTaskItem, value: unknown) => {
      setDrafts((prev) => {
        const existing = prev[taskId] || {};
        const original = tasks.find((t) => t.id === taskId);
        if (original && original[field] === value) {
          const updated = { ...existing };
          delete updated[field];
          if (Object.keys(updated).length === 0) {
            const next = { ...prev };
            delete next[taskId];
            return next;
          }
          return { ...prev, [taskId]: updated };
        }
        return {
          ...prev,
          [taskId]: {
            ...existing,
            [field]: value,
          },
        };
      });
    },
    [tasks]
  );

  const handleRevertRow = useCallback((taskId: number) => {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  }, []);

  const handleSaveRow = useCallback(
    async (taskId: number) => {
      const draft = drafts[taskId];
      if (!draft) return;

      setSaving(true);
      setMessage(null);
      try {
        const updated = await updateAdminTask(taskId, draft);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
        setMessage({
          type: 'success',
          text: `Attività #${taskId} salvata con successo.`,
        });
      } catch (err: unknown) {
        setMessage({
          type: 'error',
          text: extractErrorMessage(err, `Errore nel salvataggio dell'attività #${taskId}.`),
        });
      } finally {
        setSaving(false);
      }
    },
    [drafts]
  );

  const handleSaveAllPending = useCallback(async () => {
    const pendingIds = Object.keys(drafts)
      .map(Number)
      .filter((id) => drafts[id] && Object.keys(drafts[id]).length > 0);

    if (pendingIds.length === 0) return;

    setSaving(true);
    setMessage(null);
    let successCount = 0;
    const errors: string[] = [];

    for (const id of pendingIds) {
      const draft = drafts[id];
      try {
        const updated = await updateAdminTask(id, draft);
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        successCount++;
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } catch (err: unknown) {
        errors.push(`Attività #${id}: ${extractErrorMessage(err)}`);
      }
    }

    setSaving(false);

    if (errors.length === 0) {
      setMessage({
        type: 'success',
        text: `Salvate con successo tutte le ${successCount} modifiche in sospeso.`,
      });
    } else {
      setMessage({
        type: 'error',
        text: `Salvate ${successCount} attività. Errori in ${errors.length} righe: ${errors.join(', ')}`,
      });
    }
  }, [drafts]);

  const handleRevertAllPending = useCallback(() => {
    setDrafts({});
  }, []);

  const handleDeleteTask = useCallback(async (taskId: number, title: string) => {
    if (!window.confirm(`Sei sicuro di voler eliminare definitivamente l'attività "${title}" (#${taskId})?`)) {
      return;
    }
    try {
      await deleteAdminTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
      setMessage({
        type: 'success',
        text: `Attività "${title}" eliminata con successo.`,
      });
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: extractErrorMessage(err, "Errore durante l'eliminazione dell'attività."),
      });
    }
  }, []);

  return {
    loading,
    saving,
    message,
    setMessage,
    tasks,
    users,
    categories,
    datePreset,
    setDatePreset,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedUserId,
    setSelectedUserId,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedPriority,
    setSelectedPriority,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    onlyAnomalies,
    setOnlyAnomalies,
    sortField,
    sortDirection,
    handleSort,
    filteredTasks,
    totalTasksCount: tasks.length,
    filteredSummary,
    drafts,
    pendingCount,
    hasRowChanges,
    getEffectiveTask,
    handleCellChange,
    handleRevertRow,
    handleSaveRow,
    handleSaveAllPending,
    handleRevertAllPending,
    handleDeleteTask,
    loadAllData,
  };
}
