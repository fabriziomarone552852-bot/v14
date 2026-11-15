// src/components/admin/categories/useAdminCategoriesLogic.ts
import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminCategories,
  updateAdminCategory,
  deleteAdminCategory,
  type CategoryGenreCode,
} from '@/api/adminCategoriesApi';
import { fetchSystemUsers, type SystemUserItem } from '@/api/adminApi';
import type {
  AdminCategorySubTab,
  EnrichedAdminCategoryItem,
  AdminCategoryFeedbackMessage,
} from './types';

export const useAdminCategoriesLogic = () => {
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState<AdminCategorySubTab>('all');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [message, setMessage] = useState<AdminCategoryFeedbackMessage | null>(null);

  // Mappa bozze: id -> { name?, color?, genre? }
  const [drafts, setDrafts] = useState<
    Record<number, { name?: string; color?: string; genre?: CategoryGenreCode }>
  >({});

  // 1. CARICAMENTO DATI
  const { data: rawCategories = [], isLoading: loadingCategories, refetch } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchAdminCategories,
    staleTime: 60_000,
  });

  const { data: users = [] } = useQuery<SystemUserItem[]>({
    queryKey: ['admin', 'users'],
    queryFn: fetchSystemUsers,
    staleTime: 120_000,
  });

  // 2. DATI ARRICCHITI CON BOZZE
  const enrichedCategories: EnrichedAdminCategoryItem[] = useMemo(() => {
    return rawCategories.map((c) => {
      const draft = drafts[c.id];
      return {
        ...c,
        draftName: draft?.name !== undefined ? draft.name : c.category_name,
        draftColor: draft?.color !== undefined ? draft.color : (c.colore ?? '#3b82f6'),
        draftGenre: draft?.genre !== undefined ? draft.genre : c.genre,
      };
    });
  }, [rawCategories, drafts]);

  // 3. FILTRI
  const filteredCategories = useMemo(() => {
    return enrichedCategories.filter((c) => {
      // Filtro SubTab
      if (subTab === 'categories') {
        if (![1, 2, 3].includes(c.genre)) return false;
      } else if (subTab === 'tags') {
        if (c.genre !== 5) return false;
      } else if (subTab === 'mood') {
        if (c.genre !== 4) return false;
      }

      // Filtro Utente
      if (selectedUserId !== null && c.user_id !== selectedUserId) {
        return false;
      }

      // Ricerca
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = (c.draftName || c.category_name).toLowerCase().includes(q);
        const matchesUser = (c.username || '').toLowerCase().includes(q);
        const matchesId = String(c.id) === q;
        if (!matchesName && !matchesUser && !matchesId) return false;
      }

      return true;
    });
  }, [enrichedCategories, subTab, selectedUserId, searchQuery]);

  // Conteggi totali per tab
  const counts = useMemo(() => {
    let categoriesCount = 0;
    let tagsCount = 0;
    let moodCount = 0;
    rawCategories.forEach((c) => {
      if ([1, 2, 3].includes(c.genre)) categoriesCount++;
      else if (c.genre === 5) tagsCount++;
      else if (c.genre === 4) moodCount++;
    });
    return {
      all: rawCategories.length,
      categories: categoriesCount,
      tags: tagsCount,
      mood: moodCount,
    };
  }, [rawCategories]);

  // 4. GESTIONE BOZZE
  const handleDraftChange = useCallback(
    (id: number, field: 'name' | 'color' | 'genre', value: unknown) => {
      setDrafts((prev) => {
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

  const handleCancelDraft = useCallback((id: number) => {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const isDraftDirty = useCallback(
    (id: number) => Boolean(drafts[id]),
    [drafts]
  );

  // 5. MUTAZIONI
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      name,
      color,
      genre,
    }: {
      id: number;
      name?: string;
      color?: string;
      genre?: CategoryGenreCode;
    }) => {
      return await updateAdminCategory(id, {
        category_name: name,
        colore: color,
        genre,
      });
    },
    onSuccess: (updated) => {
      setMessage({
        type: 'success',
        text: `Voce #${updated.id} "${updated.category_name}" aggiornata con successo.`,
      });
      handleCancelDraft(updated.id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: unknown) => {
      const detail = err instanceof Error ? err.message : 'Errore nel salvataggio.';
      setMessage({ type: 'error', text: `Impossibile salvare: ${detail}` });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await deleteAdminCategory(id);
    },
    onSuccess: (_, id) => {
      setMessage({
        type: 'success',
        text: `Voce #${id} eliminata con successo e riferimenti scollegati.`,
      });
      handleCancelDraft(id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: unknown) => {
      const detail = err instanceof Error ? err.message : 'Errore nell\'eliminazione.';
      setMessage({ type: 'error', text: `Impossibile eliminare: ${detail}` });
    },
  });

  const handleSave = useCallback(
    (item: EnrichedAdminCategoryItem) => {
      updateMutation.mutate({
        id: item.id,
        name: item.draftName?.trim() || item.category_name,
        color: item.draftColor || item.colore || '#3b82f6',
        genre: item.draftGenre || item.genre,
      });
    },
    [updateMutation]
  );

  const handleDelete = useCallback(
    (id: number, name: string) => {
      if (window.confirm(`Sei sicuro di voler eliminare la categoria/tag "${name}"? Le task ed eventi collegati non verranno eliminati ma solo scollegati.`)) {
        deleteMutation.mutate(id);
      }
    },
    [deleteMutation]
  );

  return {
    subTab,
    setSubTab,
    selectedUserId,
    setSelectedUserId,
    searchQuery,
    setSearchQuery,
    message,
    setMessage,
    isLoading: loadingCategories,
    isSaving: updateMutation.isPending || deleteMutation.isPending,
    users,
    filteredCategories,
    counts,
    handleDraftChange,
    handleCancelDraft,
    isDraftDirty,
    handleSave,
    handleDelete,
    refetch,
  };
};
