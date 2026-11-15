// src/components/admin/media/useAdminMediaLogic.ts
import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminMediaPlatforms,
  updateAdminMediaPlatform,
  deleteAdminMediaPlatform,
  fetchAdminMediaLists,
  updateAdminMediaList,
  deleteAdminMediaList,
  fetchAdminMediaQuotes,
  updateAdminMediaQuote,
  deleteAdminMediaQuote,
} from '@/api/adminMediaApi';
import { fetchSystemUsers, type SystemUserItem } from '@/api/adminApi';
import type {
  MediaAdminSubTab,
  EnrichedAdminViewingPlatformItem,
  EnrichedAdminMediaListItem,
  EnrichedAdminMediaQuoteItem,
  MediaFeedbackMessage,
} from './types';

export const useAdminMediaLogic = () => {
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState<MediaAdminSubTab>('platforms');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [message, setMessage] = useState<MediaFeedbackMessage | null>(null);

  // Mappe bozze in linea
  const [platformDrafts, setPlatformDrafts] = useState<Record<number, { name?: string }>>({});
  const [listDrafts, setListDrafts] = useState<
    Record<number, { name?: string; description?: string; visibility?: string }>
  >({});
  const [quoteDrafts, setQuoteDrafts] = useState<
    Record<string, { quoteText?: string }>
  >({});

  // 1. CARICAMENTO DATI
  const {
    data: rawPlatforms = [],
    isLoading: loadingPlatforms,
    refetch: refetchPlatforms,
  } = useQuery({
    queryKey: ['admin', 'media-platforms'],
    queryFn: fetchAdminMediaPlatforms,
    staleTime: 60_000,
  });

  const {
    data: rawLists = [],
    isLoading: loadingLists,
    refetch: refetchLists,
  } = useQuery({
    queryKey: ['admin', 'media-lists'],
    queryFn: fetchAdminMediaLists,
    staleTime: 60_000,
  });

  const {
    data: rawQuotes = [],
    isLoading: loadingQuotes,
    refetch: refetchQuotes,
  } = useQuery({
    queryKey: ['admin', 'media-quotes'],
    queryFn: fetchAdminMediaQuotes,
    staleTime: 60_000,
  });

  const { data: users = [] } = useQuery<SystemUserItem[]>({
    queryKey: ['admin', 'users'],
    queryFn: fetchSystemUsers,
    staleTime: 120_000,
  });

  const isLoading = loadingPlatforms || loadingLists || loadingQuotes;

  // 2. DATI ARRICCHITI CON BOZZE
  const enrichedPlatforms: EnrichedAdminViewingPlatformItem[] = useMemo(() => {
    return rawPlatforms.map((p) => {
      const draft = platformDrafts[p.id];
      return {
        ...p,
        draftName: draft?.name !== undefined ? draft.name : p.name,
      };
    });
  }, [rawPlatforms, platformDrafts]);

  const enrichedLists: EnrichedAdminMediaListItem[] = useMemo(() => {
    return rawLists.map((l) => {
      const draft = listDrafts[l.id];
      return {
        ...l,
        draftName: draft?.name !== undefined ? draft.name : l.name,
        draftDescription: draft?.description !== undefined ? draft.description : (l.description ?? ''),
        draftVisibility: draft?.visibility !== undefined ? draft.visibility : l.visibility,
      };
    });
  }, [rawLists, listDrafts]);

  const enrichedQuotes: EnrichedAdminMediaQuoteItem[] = useMemo(() => {
    return rawQuotes.map((q) => {
      const draftKey = `${q.media_type}_${q.id}`;
      const draft = quoteDrafts[draftKey];
      return {
        ...q,
        draftQuoteText: draft?.quoteText !== undefined ? draft.quoteText : q.quote_text,
      };
    });
  }, [rawQuotes, quoteDrafts]);

  // 3. FILTRI IN MEMORIA RAM
  const filteredPlatforms = useMemo(() => {
    return enrichedPlatforms.filter((p) => {
      if (selectedUserId !== null && p.user_id !== selectedUserId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = (p.draftName || p.name).toLowerCase().includes(q);
        const matchesUser = (p.username || '').toLowerCase().includes(q);
        const matchesId = String(p.id) === q;
        if (!matchesName && !matchesUser && !matchesId) return false;
      }
      return true;
    });
  }, [enrichedPlatforms, selectedUserId, searchQuery]);

  const filteredLists = useMemo(() => {
    return enrichedLists.filter((l) => {
      if (selectedUserId !== null && l.user_id !== selectedUserId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = (l.draftName || l.name).toLowerCase().includes(q);
        const matchesDesc = (l.draftDescription || l.description || '').toLowerCase().includes(q);
        const matchesUser = (l.username || '').toLowerCase().includes(q);
        const matchesId = String(l.id) === q;
        if (!matchesName && !matchesDesc && !matchesUser && !matchesId) return false;
      }
      return true;
    });
  }, [enrichedLists, selectedUserId, searchQuery]);

  const filteredQuotes = useMemo(() => {
    return enrichedQuotes.filter((quote) => {
      if (selectedUserId !== null && quote.user_id !== selectedUserId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesText = (quote.draftQuoteText || quote.quote_text).toLowerCase().includes(q);
        const matchesTitle = quote.media_title.toLowerCase().includes(q);
        const matchesUser = (quote.username || '').toLowerCase().includes(q);
        const matchesId = String(quote.id) === q;
        if (!matchesText && !matchesTitle && !matchesUser && !matchesId) return false;
      }
      return true;
    });
  }, [enrichedQuotes, selectedUserId, searchQuery]);

  // Helper feedback
  const showFeedback = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  // 4. DRAFT CHANGE HANDLERS
  const handleDraftPlatformChange = useCallback((id: number, name: string) => {
    setPlatformDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], name },
    }));
  }, []);

  const handleCancelPlatformDraft = useCallback((id: number) => {
    setPlatformDrafts((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  const isPlatformDirty = useCallback(
    (id: number) => {
      const draft = platformDrafts[id];
      if (!draft) return false;
      const original = rawPlatforms.find((p) => p.id === id);
      if (!original) return false;
      return draft.name !== undefined && draft.name.trim() !== original.name;
    },
    [platformDrafts, rawPlatforms]
  );

  const handleDraftListChange = useCallback(
    (id: number, field: 'name' | 'description' | 'visibility', value: string) => {
      setListDrafts((prev) => ({
        ...prev,
        [id]: { ...prev[id], [field]: value },
      }));
    },
    []
  );

  const handleCancelListDraft = useCallback((id: number) => {
    setListDrafts((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  }, []);

  const isListDirty = useCallback(
    (id: number) => {
      const draft = listDrafts[id];
      if (!draft) return false;
      const original = rawLists.find((l) => l.id === id);
      if (!original) return false;
      return (
        (draft.name !== undefined && draft.name.trim() !== original.name) ||
        (draft.description !== undefined && draft.description !== (original.description ?? '')) ||
        (draft.visibility !== undefined && draft.visibility !== original.visibility)
      );
    },
    [listDrafts, rawLists]
  );

  const handleDraftQuoteChange = useCallback((mediaType: 'tv' | 'movie', id: number, textVal: string) => {
    const key = `${mediaType}_${id}`;
    setQuoteDrafts((prev) => ({
      ...prev,
      [key]: { quoteText: textVal },
    }));
  }, []);

  const handleCancelQuoteDraft = useCallback((mediaType: 'tv' | 'movie', id: number) => {
    const key = `${mediaType}_${id}`;
    setQuoteDrafts((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  }, []);

  const isQuoteDirty = useCallback(
    (mediaType: 'tv' | 'movie', id: number) => {
      const key = `${mediaType}_${id}`;
      const draft = quoteDrafts[key];
      if (!draft) return false;
      const original = rawQuotes.find((q) => q.id === id && q.media_type === mediaType);
      if (!original) return false;
      return draft.quoteText !== undefined && draft.quoteText.trim() !== original.quote_text;
    },
    [quoteDrafts, rawQuotes]
  );

  // 5. MUTATIONS
  const updatePlatformMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      updateAdminMediaPlatform(id, { name }),
    onSuccess: (updated) => {
      showFeedback('success', `Piattaforma #${updated.id} "${updated.name}" aggiornata.`);
      handleCancelPlatformDraft(updated.id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'media-platforms'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'platforms'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Errore nel salvataggio.';
      showFeedback('error', `Errore aggiornamento: ${msg}`);
    },
  });

  const deletePlatformMutation = useMutation({
    mutationFn: (id: number) => deleteAdminMediaPlatform(id),
    onSuccess: (_, id) => {
      showFeedback('success', `Piattaforma #${id} eliminata con successo.`);
      handleCancelPlatformDraft(id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'media-platforms'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'platforms'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Errore nell\'eliminazione.';
      showFeedback('error', `Errore eliminazione: ${msg}`);
    },
  });

  const updateListMutation = useMutation({
    mutationFn: ({
      id,
      name,
      description,
      visibility,
    }: {
      id: number;
      name?: string;
      description?: string | null;
      visibility?: string;
    }) => updateAdminMediaList(id, { name, description, visibility }),
    onSuccess: (updated) => {
      showFeedback('success', `Lista #${updated.id} "${updated.name}" salvata.`);
      handleCancelListDraft(updated.id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'media-lists'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'media-lists'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Errore nel salvataggio.';
      showFeedback('error', `Errore aggiornamento: ${msg}`);
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: (id: number) => deleteAdminMediaList(id),
    onSuccess: (_, id) => {
      showFeedback('success', `Lista #${id} eliminata con successo.`);
      handleCancelListDraft(id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'media-lists'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'media-lists'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Errore nell\'eliminazione.';
      showFeedback('error', `Errore eliminazione: ${msg}`);
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: ({
      mediaType,
      id,
      quoteText,
    }: {
      mediaType: 'tv' | 'movie';
      id: number;
      quoteText: string;
    }) => updateAdminMediaQuote(mediaType, id, { quote_text: quoteText }),
    onSuccess: (updated) => {
      showFeedback('success', `Citazione #${updated.id} (${updated.media_type.toUpperCase()}) aggiornata.`);
      handleCancelQuoteDraft(updated.media_type, updated.id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'media-quotes'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Errore nel salvataggio.';
      showFeedback('error', `Errore aggiornamento: ${msg}`);
    },
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: ({ mediaType, id }: { mediaType: 'tv' | 'movie'; id: number }) =>
      deleteAdminMediaQuote(mediaType, id),
    onSuccess: (_, { mediaType, id }) => {
      showFeedback('success', `Citazione #${id} (${mediaType.toUpperCase()}) eliminata.`);
      handleCancelQuoteDraft(mediaType, id);
      queryClient.invalidateQueries({ queryKey: ['admin', 'media-quotes'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Errore nell\'eliminazione.';
      showFeedback('error', `Errore eliminazione: ${msg}`);
    },
  });

  // Action handlers
  const handleSavePlatform = useCallback(
    (item: EnrichedAdminViewingPlatformItem) => {
      updatePlatformMutation.mutate({
        id: item.id,
        name: (item.draftName || item.name).trim(),
      });
    },
    [updatePlatformMutation]
  );

  const handleDeletePlatform = useCallback(
    (id: number, name: string) => {
      if (window.confirm(`Sei sicuro di voler eliminare la piattaforma "${name}"? I log associati verranno disassociati.`)) {
        deletePlatformMutation.mutate(id);
      }
    },
    [deletePlatformMutation]
  );

  const handleSaveList = useCallback(
    (item: EnrichedAdminMediaListItem) => {
      updateListMutation.mutate({
        id: item.id,
        name: (item.draftName || item.name).trim(),
        description:
          item.draftDescription !== undefined
            ? (item.draftDescription ? item.draftDescription.trim() || null : null)
            : item.description,
        visibility: item.draftVisibility || item.visibility,
      });
    },
    [updateListMutation]
  );

  const handleDeleteList = useCallback(
    (id: number, name: string) => {
      if (window.confirm(`Sei sicuro di voler eliminare la lista "${name}" e tutti gli elementi al suo interno?`)) {
        deleteListMutation.mutate(id);
      }
    },
    [deleteListMutation]
  );

  const handleSaveQuote = useCallback(
    (item: EnrichedAdminMediaQuoteItem) => {
      updateQuoteMutation.mutate({
        mediaType: item.media_type,
        id: item.id,
        quoteText: (item.draftQuoteText || item.quote_text).trim(),
      });
    },
    [updateQuoteMutation]
  );

  const handleDeleteQuote = useCallback(
    (mediaType: 'tv' | 'movie', id: number) => {
      if (window.confirm(`Sei sicuro di voler eliminare la citazione #${id} (${mediaType.toUpperCase()})?`)) {
        deleteQuoteMutation.mutate({ mediaType, id });
      }
    },
    [deleteQuoteMutation]
  );

  const isSaving =
    updatePlatformMutation.isPending ||
    deletePlatformMutation.isPending ||
    updateListMutation.isPending ||
    deleteListMutation.isPending ||
    updateQuoteMutation.isPending ||
    deleteQuoteMutation.isPending;

  const refetchAll = useCallback(() => {
    refetchPlatforms();
    refetchLists();
    refetchQuotes();
  }, [refetchPlatforms, refetchLists, refetchQuotes]);

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
    // Platforms
    filteredPlatforms,
    totalPlatformsCount: rawPlatforms.length,
    handleDraftPlatformChange,
    handleCancelPlatformDraft,
    isPlatformDirty,
    handleSavePlatform,
    handleDeletePlatform,
    // Lists
    filteredLists,
    totalListsCount: rawLists.length,
    handleDraftListChange,
    handleCancelListDraft,
    isListDirty,
    handleSaveList,
    handleDeleteList,
    // Quotes
    filteredQuotes,
    totalQuotesCount: rawQuotes.length,
    handleDraftQuoteChange,
    handleCancelQuoteDraft,
    isQuoteDirty,
    handleSaveQuote,
    handleDeleteQuote,
    // Action
    refetchAll,
  };
};
