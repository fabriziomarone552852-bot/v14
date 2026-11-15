// src/components/admin/habits_goals/useAdminHabitsGoalsLogic.ts
import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminHabits,
  updateAdminHabit,
  deleteAdminHabit,
  fetchAdminCountdowns,
  updateAdminCountdown,
  deleteAdminCountdown,
} from '@/api/adminHabitsGoalsApi';
import { fetchSystemUsers, type SystemUserItem } from '@/api/adminApi';
import type {
  HabitsGoalsSubTab,
  EnrichedAdminHabitItem,
  EnrichedAdminCountdownItem,
  HabitsGoalsFeedbackMessage,
} from './types';

export const useAdminHabitsGoalsLogic = () => {
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState<HabitsGoalsSubTab>('habits');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [message, setMessage] = useState<HabitsGoalsFeedbackMessage | null>(null);

  // Mappa bozze
  const [habitDrafts, setHabitDrafts] = useState<
    Record<number, { title?: string; tipo?: 'A' | 'R'; target?: number; rrule?: string }>
  >({});

  const [countdownDrafts, setCountdownDrafts] = useState<
    Record<number, { title?: string; targetDate?: string; status?: 'active' | 'closed' }>
  >({});

  // 1. CARICAMENTO DATI
  const { data: rawHabits = [], isLoading: loadingHabits, refetch: refetchHabits } = useQuery({
    queryKey: ['admin', 'habits'],
    queryFn: fetchAdminHabits,
    staleTime: 60_000,
  });

  const { data: rawCountdowns = [], isLoading: loadingCountdowns, refetch: refetchCountdowns } = useQuery({
    queryKey: ['admin', 'countdowns'],
    queryFn: fetchAdminCountdowns,
    staleTime: 60_000,
  });

  const { data: users = [] } = useQuery<SystemUserItem[]>({
    queryKey: ['admin', 'users'],
    queryFn: fetchSystemUsers,
    staleTime: 120_000,
  });

  const isLoading = loadingHabits || loadingCountdowns;

  // 2. DATI ARRICCHITI CON BOZZE
  const enrichedHabits: EnrichedAdminHabitItem[] = useMemo(() => {
    return rawHabits.map((h) => {
      const draft = habitDrafts[h.id];
      return {
        ...h,
        draftTitle: draft?.title !== undefined ? draft.title : h.titolo,
        draftTipo: draft?.tipo !== undefined ? draft.tipo : h.tipo,
        draftTarget: draft?.target !== undefined ? draft.target : h.target,
        draftRrule: draft?.rrule !== undefined ? draft.rrule : (h.rrule ?? ''),
      };
    });
  }, [rawHabits, habitDrafts]);

  const enrichedCountdowns: EnrichedAdminCountdownItem[] = useMemo(() => {
    return rawCountdowns.map((c) => {
      const draft = countdownDrafts[c.id];
      return {
        ...c,
        draftTitle: draft?.title !== undefined ? draft.title : c.title,
        draftTargetDate: draft?.targetDate !== undefined ? draft.targetDate : c.target_date,
        draftStatus: draft?.status !== undefined ? draft.status : c.status,
      };
    });
  }, [rawCountdowns, countdownDrafts]);

  // 3. FILTRI
  const filteredHabits = useMemo(() => {
    return enrichedHabits.filter((h) => {
      if (h.draftTipo !== 'A') return false;
      if (selectedUserId !== null && h.user_id !== selectedUserId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = (h.draftTitle || h.titolo).toLowerCase().includes(q);
        const matchesUser = (h.username || '').toLowerCase().includes(q);
        const matchesId = String(h.id) === q;
        if (!matchesTitle && !matchesUser && !matchesId) return false;
      }
      return true;
    });
  }, [enrichedHabits, selectedUserId, searchQuery]);

  const filteredRoutines = useMemo(() => {
    return enrichedHabits.filter((h) => {
      if (h.draftTipo !== 'R') return false;
      if (selectedUserId !== null && h.user_id !== selectedUserId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = (h.draftTitle || h.titolo).toLowerCase().includes(q);
        const matchesUser = (h.username || '').toLowerCase().includes(q);
        const matchesId = String(h.id) === q;
        if (!matchesTitle && !matchesUser && !matchesId) return false;
      }
      return true;
    });
  }, [enrichedHabits, selectedUserId, searchQuery]);

  const filteredCountdowns = useMemo(() => {
    return enrichedCountdowns.filter((c) => {
      if (selectedUserId !== null && c.user_id !== selectedUserId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = (c.draftTitle || c.title).toLowerCase().includes(q);
        const matchesUser = (c.username || '').toLowerCase().includes(q);
        const matchesId = String(c.id) === q;
        if (!matchesTitle && !matchesUser && !matchesId) return false;
      }
      return true;
    });
  }, [enrichedCountdowns, selectedUserId, searchQuery]);

  // Conteggi totali
  const counts = useMemo(() => {
    let habitsCount = 0;
    let routinesCount = 0;
    rawHabits.forEach((h) => {
      if (h.tipo === 'A') habitsCount++;
      else if (h.tipo === 'R') routinesCount++;
    });
    return {
      habits: habitsCount,
      routines: routinesCount,
      countdowns: rawCountdowns.length,
    };
  }, [rawHabits, rawCountdowns]);

  // 4. GESTIONE BOZZE HABIT
  const handleHabitDraftChange = useCallback(
    (id: number, field: 'title' | 'tipo' | 'target' | 'rrule', value: unknown) => {
      setHabitDrafts((prev) => {
        const current = prev[id] || {};
        return {
          ...prev,
          [id]: {
            ...current,
            [field]: value,
          },
        };
      });
    },
    []
  );

  const handleCancelHabitDraft = useCallback((id: number) => {
    setHabitDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const isHabitDraftDirty = useCallback(
    (id: number) => Boolean(habitDrafts[id]),
    [habitDrafts]
  );

  // 5. GESTIONE BOZZE COUNTDOWN
  const handleCountdownDraftChange = useCallback(
    (id: number, field: 'title' | 'targetDate' | 'status', value: unknown) => {
      setCountdownDrafts((prev) => {
        const current = prev[id] || {};
        return {
          ...prev,
          [id]: {
            ...current,
            [field]: value,
          },
        };
      });
    },
    []
  );

  const handleCancelCountdownDraft = useCallback((id: number) => {
    setCountdownDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const isCountdownDraftDirty = useCallback(
    (id: number) => Boolean(countdownDrafts[id]),
    [countdownDrafts]
  );

  // 6. MUTAZIONI HABIT
  const updateHabitMutation = useMutation({
    mutationFn: async ({
      id,
      titolo,
      tipo,
      target,
      rrule,
    }: {
      id: number;
      titolo?: string;
      tipo?: 'A' | 'R';
      target?: number;
      rrule?: string | null;
    }) => {
      return await updateAdminHabit(id, { titolo, tipo, target, rrule });
    },
    onSuccess: (updated) => {
      const label = updated.tipo === 'R' ? 'Routine' : 'Abitudine';
      setMessage({
        type: 'success',
        text: `${label} #${updated.id} "${updated.titolo}" aggiornata con successo.`,
      });
      handleCancelHabitDraft(updated.id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'habits'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
    onError: (err: unknown) => {
      const detail = err instanceof Error ? err.message : 'Errore nel salvataggio.';
      setMessage({ type: 'error', text: `Impossibile aggiornare: ${detail}` });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async (id: number) => {
      return await deleteAdminHabit(id);
    },
    onSuccess: (_, id) => {
      setMessage({
        type: 'success',
        text: `Elemento #${id} eliminato con successo.`,
      });
      handleCancelHabitDraft(id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'habits'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
    onError: (err: unknown) => {
      const detail = err instanceof Error ? err.message : 'Errore nell\'eliminazione.';
      setMessage({ type: 'error', text: `Impossibile eliminare: ${detail}` });
    },
  });

  // 7. MUTAZIONI COUNTDOWN
  const updateCountdownMutation = useMutation({
    mutationFn: async ({
      id,
      title,
      targetDate,
      status,
    }: {
      id: number;
      title?: string;
      targetDate?: string;
      status?: 'active' | 'closed';
    }) => {
      return await updateAdminCountdown(id, {
        title,
        target_date: targetDate,
        status,
      });
    },
    onSuccess: (updated) => {
      setMessage({
        type: 'success',
        text: `Conto alla rovescia #${updated.id} "${updated.title}" aggiornato con successo.`,
      });
      handleCancelCountdownDraft(updated.id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'countdowns'] });
      queryClient.invalidateQueries({ queryKey: ['countdowns'] });
    },
    onError: (err: unknown) => {
      const detail = err instanceof Error ? err.message : 'Errore nel salvataggio.';
      setMessage({ type: 'error', text: `Impossibile aggiornare: ${detail}` });
    },
  });

  const deleteCountdownMutation = useMutation({
    mutationFn: async (id: number) => {
      return await deleteAdminCountdown(id);
    },
    onSuccess: (_, id) => {
      setMessage({
        type: 'success',
        text: `Conto alla rovescia #${id} eliminato con successo.`,
      });
      handleCancelCountdownDraft(id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'countdowns'] });
      queryClient.invalidateQueries({ queryKey: ['countdowns'] });
    },
    onError: (err: unknown) => {
      const detail = err instanceof Error ? err.message : 'Errore nell\'eliminazione.';
      setMessage({ type: 'error', text: `Impossibile eliminare: ${detail}` });
    },
  });

  const handleSaveHabit = useCallback(
    (item: EnrichedAdminHabitItem) => {
      updateHabitMutation.mutate({
        id: item.id,
        titolo: item.draftTitle?.trim() || item.titolo,
        tipo: item.draftTipo || item.tipo,
        target: item.draftTarget !== undefined ? item.draftTarget : item.target,
        rrule: item.draftRrule !== undefined ? item.draftRrule : item.rrule,
      });
    },
    [updateHabitMutation]
  );

  const handleDeleteHabit = useCallback(
    (id: number, title: string) => {
      if (window.confirm(`Sei sicuro di voler eliminare definitivamente "${title}"?`)) {
        deleteHabitMutation.mutate(id);
      }
    },
    [deleteHabitMutation]
  );

  const handleSaveCountdown = useCallback(
    (item: EnrichedAdminCountdownItem) => {
      updateCountdownMutation.mutate({
        id: item.id,
        title: item.draftTitle?.trim() || item.title,
        targetDate: item.draftTargetDate || item.target_date,
        status: item.draftStatus || item.status,
      });
    },
    [updateCountdownMutation]
  );

  const handleDeleteCountdown = useCallback(
    (id: number, title: string) => {
      if (window.confirm(`Sei sicuro di voler eliminare definitivamente il countdown "${title}"?`)) {
        deleteCountdownMutation.mutate(id);
      }
    },
    [deleteCountdownMutation]
  );

  const isSaving =
    updateHabitMutation.isPending ||
    deleteHabitMutation.isPending ||
    updateCountdownMutation.isPending ||
    deleteCountdownMutation.isPending;

  return {
    subTab,
    setSubTab,
    selectedUserId,
    setSelectedUserId,
    searchQuery,
    setSearchQuery,
    message,
    setMessage,
    isLoading,
    isSaving,
    users,
    filteredHabits,
    filteredRoutines,
    filteredCountdowns,
    counts,
    // Habit handlers
    handleHabitDraftChange,
    handleCancelHabitDraft,
    isHabitDraftDirty,
    handleSaveHabit,
    handleDeleteHabit,
    // Countdown handlers
    handleCountdownDraftChange,
    handleCancelCountdownDraft,
    isCountdownDraftDirty,
    handleSaveCountdown,
    handleDeleteCountdown,
    refetchAll: () => {
      refetchHabits();
      refetchCountdowns();
    },
  };
};
