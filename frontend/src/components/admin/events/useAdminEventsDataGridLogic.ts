// src/components/admin/events/useAdminEventsDataGridLogic.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AdminEventItem, AdminCategoryOption } from '@/api/adminEventsApi';
import {
  fetchAdminEvents,
  updateAdminEvent,
  deleteAdminEvent,
  fetchAdminCategories,
} from '@/api/adminEventsApi';
import type { SystemUserItem } from '@/api/adminApi';
import { fetchSystemUsers } from '@/api/adminApi';
import { extractErrorMessage } from '@/utils/errorUtils';

export type EventsDatePreset = 'today' | '7days' | 'month' | 'year' | 'all' | 'custom';
export type EventsSortField = 'data_inizio' | 'titolo' | 'username' | 'category_name';

export interface UseAdminEventsDataGridLogicReturn {
  loading: boolean;
  saving: boolean;
  message: { text: string; type: 'success' | 'error' } | null;
  setMessage: (msg: { text: string; type: 'success' | 'error' } | null) => void;
  events: AdminEventItem[];
  users: SystemUserItem[];
  categories: AdminCategoryOption[];
  // Filtri
  datePreset: EventsDatePreset;
  setDatePreset: (preset: EventsDatePreset) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  selectedUserId: number | 'all';
  setSelectedUserId: (id: number | 'all') => void;
  selectedCategoryId: number | 'all';
  setSelectedCategoryId: (id: number | 'all') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onlyAnomalies: boolean;
  setOnlyAnomalies: (val: boolean) => void;
  timeFilter: 'all' | 'all-day' | 'timed';
  setTimeFilter: (val: 'all' | 'all-day' | 'timed') => void;
  // Ordinamento
  sortField: EventsSortField;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: EventsSortField) => void;
  // Dati & Drafts
  filteredEvents: AdminEventItem[];
  totalEventsCount: number;
  filteredSummary: { count: number; anomaliesCount: number };
  drafts: Record<number, Partial<AdminEventItem>>;
  pendingCount: number;
  hasRowChanges: (eventId: number) => boolean;
  getEffectiveEvent: (ev: AdminEventItem) => AdminEventItem;
  handleCellChange: (eventId: number, field: keyof AdminEventItem, value: unknown) => void;
  handleRevertRow: (eventId: number) => void;
  handleSaveRow: (eventId: number) => Promise<void>;
  handleSaveAllPending: () => Promise<void>;
  handleRevertAllPending: () => void;
  handleDeleteEvent: (eventId: number, title: string) => Promise<void>;
  loadAllData: () => Promise<void>;
}

export function useAdminEventsDataGridLogic(): UseAdminEventsDataGridLogicReturn {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [events, setEvents] = useState<AdminEventItem[]>([]);
  const [users, setUsers] = useState<SystemUserItem[]>([]);
  const [categories, setCategories] = useState<AdminCategoryOption[]>([]);

  // Filtri
  const [datePreset, setDatePreset] = useState<EventsDatePreset>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | 'all'>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAnomalies, setOnlyAnomalies] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'all' | 'all-day' | 'timed'>('all');

  // Ordinamento
  const [sortField, setSortField] = useState<EventsSortField>('data_inizio');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modifiche locali
  const [drafts, setDrafts] = useState<Record<number, Partial<AdminEventItem>>>({});

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [eventsData, usersData, catsData] = await Promise.all([
        fetchAdminEvents(),
        fetchSystemUsers(),
        fetchAdminCategories(),
      ]);
      setEvents(eventsData);
      setUsers(usersData);
      setCategories(catsData);
      setDrafts({});
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: extractErrorMessage(err, 'Errore nel caricamento del registro eventi.'),
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
  const isAnomaly = useCallback((ev: AdminEventItem): boolean => {
    if (!ev.titolo || !ev.titolo.trim()) return true;
    if (ev.data_fine && ev.data_fine < ev.data_inizio) return true;
    return false;
  }, []);

  // Lotti filtrati
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // 1. Filtro data (su data_inizio stringa ISO)
    if (dateBounds.start) {
      result = result.filter((e) => e.data_inizio.split('T')[0] >= dateBounds.start);
    }
    if (dateBounds.end) {
      result = result.filter((e) => e.data_inizio.split('T')[0] <= dateBounds.end);
    }

    // 2. Filtro Utente
    if (selectedUserId !== 'all') {
      result = result.filter((e) => e.user_id === selectedUserId);
    }

    // 3. Filtro Categoria
    if (selectedCategoryId !== 'all') {
      result = result.filter((e) => e.user_category_id === selectedCategoryId);
    }

    // 4. Filtro Tutto il giorno
    if (timeFilter === 'all-day') {
      result = result.filter((e) => e.tutto_il_giorno);
    } else if (timeFilter === 'timed') {
      result = result.filter((e) => !e.tutto_il_giorno);
    }

    // 5. Solo anomalie
    if (onlyAnomalies) {
      result = result.filter((e) => isAnomaly(e));
    }

    // 6. Ricerca testuale
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((e) => {
        const tit = (e.titolo || '').toLowerCase();
        const desc = (e.descrizione || '').toLowerCase();
        const luogo = (e.luogo || '').toLowerCase();
        const user = (e.username || '').toLowerCase();
        const cat = (e.category_name || '').toLowerCase();
        return tit.includes(q) || desc.includes(q) || luogo.includes(q) || user.includes(q) || cat.includes(q);
      });
    }

    // 7. Ordinamento
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'data_inizio') {
        comparison = a.data_inizio.localeCompare(b.data_inizio);
      } else if (sortField === 'titolo') {
        comparison = (a.titolo || '').localeCompare(b.titolo || '');
      } else if (sortField === 'username') {
        comparison = (a.username || '').localeCompare(b.username || '');
      } else if (sortField === 'category_name') {
        comparison = (a.category_name || '').localeCompare(b.category_name || '');
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [
    events,
    dateBounds,
    selectedUserId,
    selectedCategoryId,
    timeFilter,
    onlyAnomalies,
    searchQuery,
    sortField,
    sortDirection,
    isAnomaly,
  ]);

  const filteredSummary = useMemo(() => {
    let anomalies = 0;
    for (const e of filteredEvents) {
      if (isAnomaly(e)) anomalies++;
    }
    return {
      count: filteredEvents.length,
      anomaliesCount: anomalies,
    };
  }, [filteredEvents, isAnomaly]);

  const handleSort = (field: EventsSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const hasRowChanges = useCallback(
    (eventId: number): boolean => {
      return Boolean(drafts[eventId] && Object.keys(drafts[eventId]).length > 0);
    },
    [drafts]
  );

  const pendingCount = useMemo(() => {
    return Object.keys(drafts).filter((id) => {
      const d = drafts[Number(id)];
      return d && Object.keys(d).length > 0;
    }).length;
  }, [drafts]);

  const getEffectiveEvent = useCallback(
    (ev: AdminEventItem): AdminEventItem => {
      const draft = drafts[ev.id];
      if (!draft) return ev;
      return { ...ev, ...draft };
    },
    [drafts]
  );

  const handleCellChange = useCallback(
    (eventId: number, field: keyof AdminEventItem, value: unknown) => {
      setDrafts((prev) => {
        const existing = prev[eventId] || {};
        const original = events.find((e) => e.id === eventId);
        if (original && original[field] === value) {
          const updated = { ...existing };
          delete updated[field];
          if (Object.keys(updated).length === 0) {
            const next = { ...prev };
            delete next[eventId];
            return next;
          }
          return { ...prev, [eventId]: updated };
        }
        return {
          ...prev,
          [eventId]: {
            ...existing,
            [field]: value,
          },
        };
      });
    },
    [events]
  );

  const handleRevertRow = useCallback((eventId: number) => {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[eventId];
      return next;
    });
  }, []);

  const handleSaveRow = useCallback(
    async (eventId: number) => {
      const draft = drafts[eventId];
      if (!draft) return;

      setSaving(true);
      setMessage(null);
      try {
        const updated = await updateAdminEvent(eventId, draft);
        setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[eventId];
          return next;
        });
        setMessage({
          type: 'success',
          text: `Evento #${eventId} aggiornato con successo.`,
        });
      } catch (err: unknown) {
        setMessage({
          type: 'error',
          text: extractErrorMessage(err, `Errore nel salvataggio dell'evento #${eventId}.`),
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
        const updated = await updateAdminEvent(id, draft);
        setEvents((prev) => prev.map((e) => (e.id === id ? updated : e)));
        successCount++;
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } catch (err: unknown) {
        errors.push(`Evento #${id}: ${extractErrorMessage(err)}`);
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
        text: `Salvate ${successCount} modifiche. Errori in ${errors.length} righe: ${errors.join(', ')}`,
      });
    }
  }, [drafts]);

  const handleRevertAllPending = useCallback(() => {
    setDrafts({});
  }, []);

  const handleDeleteEvent = useCallback(async (eventId: number, title: string) => {
    if (!window.confirm(`Sei sicuro di voler eliminare definitivamente l'evento "${title}" (#${eventId})?`)) {
      return;
    }
    try {
      await deleteAdminEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[eventId];
        return next;
      });
      setMessage({
        type: 'success',
        text: `Evento "${title}" eliminato con successo.`,
      });
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: extractErrorMessage(err, "Errore durante l'eliminazione dell'evento."),
      });
    }
  }, []);

  return {
    loading,
    saving,
    message,
    setMessage,
    events,
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
    searchQuery,
    setSearchQuery,
    onlyAnomalies,
    setOnlyAnomalies,
    timeFilter,
    setTimeFilter,
    sortField,
    sortDirection,
    handleSort,
    filteredEvents,
    totalEventsCount: events.length,
    filteredSummary,
    drafts,
    pendingCount,
    hasRowChanges,
    getEffectiveEvent,
    handleCellChange,
    handleRevertRow,
    handleSaveRow,
    handleSaveAllPending,
    handleRevertAllPending,
    handleDeleteEvent,
    loadAllData,
  };
}
