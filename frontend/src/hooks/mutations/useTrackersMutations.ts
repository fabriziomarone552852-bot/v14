// src/hooks/mutations/useTrackersMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type {
  TVSeries,
  TMDBSeries,
  SeriesQuote,
  UserEpisodeLog,
  MediaList,
  MediaListItem,
  GenericSuccessResponse,
  ToggleEpisodeWatchedResponse,
  MarkAllWatchedResponse,
  SeriesLogMutationPayload,
} from '@/types/trackers';

export const useTrackersMutations = () => {
  const queryClient = useQueryClient();

  const addSeriesMutation = useMutation({
    mutationFn: async (tmdb_id: number) => {
      const data = await api.post<TVSeries>('/trackers/series', { tmdb_id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const updateSeriesMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number;
      updates: {
        status?: string;
        is_rewatching?: boolean;
        rating?: number;
        custom_poster_path?: string;
        custom_backdrop_path?: string;
        notes?: string;
        review_visibility?: string;
      };
    }) => {
      const data = await api.patch<TVSeries>(`/trackers/series/${id}`, updates);
      return data;
    },
    onSuccess: (data, { id, updates }) => {
      queryClient.setQueryData(['trackers', 'series'], (old: TVSeries[] | undefined) => {
        if (!old) return old;
        return old.map((s) => (s.tmdb_id === id ? { ...s, ...updates, ...(data || {}) } : s));
      });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series', 'detail', id] });
    },
  });

  const addSeriesLogMutation = useMutation({
    mutationFn: async ({
      tmdb_id,
      payload,
    }: {
      tmdb_id: number;
      payload: SeriesLogMutationPayload;
    }) => {
      return await api.post<{ data?: TVSeries } | TVSeries>(`/trackers/series/${tmdb_id}/logs`, payload);
    },
    onSuccess: (response: { data?: TVSeries } | TVSeries | null) => {
      queryClient.setQueryData(['trackers', 'series'], (old: TVSeries[] | undefined) => {
        if (!old || !response) return old;
        const seriesData = 'data' in response && response.data ? response.data : (response as TVSeries);
        if (!old.find((s) => s.tmdb_id === seriesData.tmdb_id)) {
          return [seriesData, ...old];
        }
        return old.map((s) => (s.tmdb_id === seriesData.tmdb_id ? seriesData : s));
      });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const updateSeriesLogMutation = useMutation({
    mutationFn: async ({
      log_id,
      payload,
    }: {
      log_id: number;
      payload: SeriesLogMutationPayload;
    }) => {
      return await api.patch<{ data?: TVSeries } | TVSeries>(`/trackers/series/logs/${log_id}`, payload);
    },
    onSuccess: (response: { data?: TVSeries } | TVSeries | null) => {
      queryClient.setQueryData(['trackers', 'series'], (old: TVSeries[] | undefined) => {
        if (!old || !response) return old;
        const seriesData = 'data' in response && response.data ? response.data : (response as TVSeries);
        if (!old.find((s) => s.tmdb_id === seriesData.tmdb_id)) {
          return [seriesData, ...old];
        }
        return old.map((s) => (s.tmdb_id === seriesData.tmdb_id ? seriesData : s));
      });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const deleteSeriesLogMutation = useMutation({
    mutationFn: async (log_id: number) => {
      return await api.delete<GenericSuccessResponse | void>(`/trackers/series/logs/${log_id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const deleteSeriesMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete<GenericSuccessResponse | void>(`/trackers/series/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const markAllEpisodesWatchedMutation = useMutation({
    mutationFn: async (tmdb_id: number) => {
      const data = await api.post<MarkAllWatchedResponse>(`/trackers/series/${tmdb_id}/watched-all`);
      return data;
    },
    onSuccess: (_, tmdb_id) => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series', 'detail', tmdb_id] });
    },
  });

  const addQuoteMutation = useMutation({
    mutationFn: async (payload: { episode_id: number; quote_text: string }) => {
      const data = await api.post<SeriesQuote>('/trackers/quotes', payload);
      return data;
    },
    onMutate: async ({ episode_id, quote_text }) => {
      await queryClient.cancelQueries({ queryKey: ['trackers', 'series', 'detail'] });
      await queryClient.cancelQueries({ queryKey: ['trackers', 'quotes'] });

      const previousDetailQueries = queryClient.getQueriesData<TMDBSeries>({ queryKey: ['trackers', 'series', 'detail'] });
      const previousQuotes = queryClient.getQueryData<SeriesQuote[]>(['trackers', 'quotes']);

      const tempId = Date.now();
      const optimisticQuote: SeriesQuote = {
        id: tempId,
        episode_id,
        quote_text,
        created_at: new Date().toISOString(),
        series_title: '',
        season_number: 0,
        episode_number: 0,
      };

      queryClient.setQueriesData<TMDBSeries>({ queryKey: ['trackers', 'series', 'detail'] }, (old) => {
        if (!old || !old.episodes) return old;
        const updatedEpisodes = old.episodes.map((ep) => {
          if (ep.id !== episode_id) return ep;
          return {
            ...ep,
            quotes: [optimisticQuote, ...(ep.quotes || [])],
          };
        });
        return { ...old, episodes: updatedEpisodes };
      });

      queryClient.setQueryData<SeriesQuote[]>(['trackers', 'quotes'], (old = []) => [optimisticQuote, ...old]);

      return { previousDetailQueries, previousQuotes };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDetailQueries) {
        context.previousDetailQueries.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
      if (context?.previousQuotes) {
        queryClient.setQueryData(['trackers', 'quotes'], context.previousQuotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series', 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'quotes'] });
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: async ({ quote_id, payload }: { quote_id: number; payload: { quote_text: string } }) => {
      const data = await api.patch<SeriesQuote>('/trackers/quotes/' + quote_id, payload);
      return data;
    },
    onMutate: async ({ quote_id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['trackers', 'series', 'detail'] });
      await queryClient.cancelQueries({ queryKey: ['trackers', 'quotes'] });

      const previousDetailQueries = queryClient.getQueriesData<TMDBSeries>({ queryKey: ['trackers', 'series', 'detail'] });
      const previousQuotes = queryClient.getQueryData<SeriesQuote[]>(['trackers', 'quotes']);

      queryClient.setQueriesData<TMDBSeries>({ queryKey: ['trackers', 'series', 'detail'] }, (old) => {
        if (!old || !old.episodes) return old;
        const updatedEpisodes = old.episodes.map((ep) => {
          if (!ep.quotes || !ep.quotes.some((q) => q.id === quote_id)) return ep;
          return {
            ...ep,
            quotes: ep.quotes.map((q) => (q.id === quote_id ? { ...q, quote_text: payload.quote_text } : q)),
          };
        });
        return { ...old, episodes: updatedEpisodes };
      });

      queryClient.setQueryData<SeriesQuote[]>(['trackers', 'quotes'], (old = []) =>
        old.map((q) => (q.id === quote_id ? { ...q, quote_text: payload.quote_text } : q))
      );

      return { previousDetailQueries, previousQuotes };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDetailQueries) {
        context.previousDetailQueries.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
      if (context?.previousQuotes) {
        queryClient.setQueryData(['trackers', 'quotes'], context.previousQuotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series', 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'quotes'] });
    },
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: async (quote_id: number) => {
      const data = await api.delete<GenericSuccessResponse | void>('/trackers/quotes/' + quote_id);
      return data;
    },
    onMutate: async (quote_id) => {
      await queryClient.cancelQueries({ queryKey: ['trackers', 'series', 'detail'] });
      await queryClient.cancelQueries({ queryKey: ['trackers', 'quotes'] });

      const previousDetailQueries = queryClient.getQueriesData<TMDBSeries>({ queryKey: ['trackers', 'series', 'detail'] });
      const previousQuotes = queryClient.getQueryData<SeriesQuote[]>(['trackers', 'quotes']);

      queryClient.setQueriesData<TMDBSeries>({ queryKey: ['trackers', 'series', 'detail'] }, (old) => {
        if (!old || !old.episodes) return old;
        const updatedEpisodes = old.episodes.map((ep) => {
          if (!ep.quotes || !ep.quotes.some((q) => q.id === quote_id)) return ep;
          return {
            ...ep,
            quotes: ep.quotes.filter((q) => q.id !== quote_id),
          };
        });
        return { ...old, episodes: updatedEpisodes };
      });

      queryClient.setQueryData<SeriesQuote[]>(['trackers', 'quotes'], (old = []) =>
        old.filter((q) => q.id !== quote_id)
      );

      return { previousDetailQueries, previousQuotes };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDetailQueries) {
        context.previousDetailQueries.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
      if (context?.previousQuotes) {
        queryClient.setQueryData(['trackers', 'quotes'], context.previousQuotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series', 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'quotes'] });
    },
  });

  const addEpisodeLogMutation = useMutation({
    mutationFn: async ({
      episode_id,
      payload,
    }: {
      episode_id: number;
      payload: { rating?: number | null; notes?: string; review_visibility?: string; watched_at?: string; viewing_platform_name?: string | null };
    }) => {
      const data = await api.post<UserEpisodeLog>(`/trackers/episodes/${episode_id}/logs`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const updateEpisodeLogMutation = useMutation({
    mutationFn: async ({
      log_id,
      payload,
    }: {
      log_id: number;
      payload: { rating?: number | null; notes?: string; review_visibility?: string; watched_at?: string; viewing_platform_name?: string | null };
    }) => {
      const data = await api.patch<UserEpisodeLog>(`/trackers/episodes/logs/${log_id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const deleteEpisodeLogMutation = useMutation({
    mutationFn: async (log_id: number) => {
      const data = await api.delete<GenericSuccessResponse | void>(`/trackers/episodes/logs/${log_id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const updateEpisodeNotesMutation = useMutation({
    mutationFn: async ({
      episode_id,
      payload,
    }: {
      episode_id: number;
      payload: { rating?: number; notes?: string; review_visibility?: string; watched_at?: string };
    }) => {
      const data = await api.patch<UserEpisodeLog>(`/trackers/episodes/${episode_id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const toggleEpisodeWatchedMutation = useMutation({
    mutationFn: async ({ episode_id, watched }: { episode_id: number; watched: boolean }) => {
      if (watched) {
        return await api.post<ToggleEpisodeWatchedResponse | void>(`/trackers/episodes/${episode_id}/watched`);
      } else {
        return await api.delete<ToggleEpisodeWatchedResponse | void>(`/trackers/episodes/${episode_id}/watched`);
      }
    },
    onMutate: async ({ episode_id, watched }) => {
      await queryClient.cancelQueries({ queryKey: ['trackers', 'series'] });
      await queryClient.cancelQueries({ queryKey: ['trackers', 'upcoming'] });

      const previousSeriesQueries = queryClient.getQueriesData<TVSeries[]>({ queryKey: ['trackers', 'series'] });
      const previousDetailQueries = queryClient.getQueriesData<TMDBSeries>({ queryKey: ['trackers', 'series', 'detail'] });

      // 1. Aggiornamento ottimistico dettaglio serie (episodes)
      queryClient.setQueriesData<TMDBSeries>({ queryKey: ['trackers', 'series', 'detail'] }, (old) => {
        if (!old || !old.episodes) return old;
        const targetEp = old.episodes.find((ep) => ep.id === episode_id);
        if (!targetEp) return old;

        const currentCount = targetEp.watch_count || 0;
        const nextCount = watched ? currentCount + 1 : Math.max(0, currentCount - 1);

        const updatedEpisodes = old.episodes.map((ep) =>
          ep.id === episode_id ? { ...ep, watch_count: nextCount } : ep
        );

        return {
          ...old,
          episodes: updatedEpisodes,
        };
      });

      // 2. Aggiornamento ottimistico catalogo serie (TVSeries[])
      queryClient.setQueriesData<TVSeries[]>({ queryKey: ['trackers', 'series'] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((s) => {
          if (!s.episodes || !s.episodes.some((ep) => ep.id === episode_id)) return s;
          const updatedEpisodes = s.episodes.map((ep) => {
            if (ep.id !== episode_id) return ep;
            const currentCount = ep.watch_count || 0;
            const nextCount = watched ? currentCount + 1 : Math.max(0, currentCount - 1);
            return { ...ep, watch_count: nextCount };
          });
          return {
            ...s,
            episodes: updatedEpisodes,
          };
        });
      });

      return { previousSeriesQueries, previousDetailQueries };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDetailQueries) {
        context.previousDetailQueries.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
      if (context?.previousSeriesQueries) {
        context.previousSeriesQueries.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series', 'detail'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'upcoming'] });
    },
  });

  const createListMutation = useMutation({
    mutationFn: async (payload: { name: string; description?: string; visibility?: string }) => {
      const data = await api.post<MediaList>('/trackers/lists', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'lists'] });
    },
  });

  const addToListMutation = useMutation({
    mutationFn: async ({ list_id, payload }: { list_id: number; payload: { series_tmdb_id: number } }) => {
      const data = await api.post<MediaListItem>(`/trackers/lists/${list_id}/items`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'lists'] });
    },
  });

  const removeFromListMutation = useMutation({
    mutationFn: async ({ list_id, item_id }: { list_id: number; item_id: number }) => {
      const data = await api.delete<GenericSuccessResponse | void>(`/trackers/lists/${list_id}/items/${item_id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'lists'] });
    },
  });

  const updateListMutation = useMutation({
    mutationFn: async ({
      list_id,
      payload,
    }: {
      list_id: number;
      payload: { name?: string; description?: string; visibility?: string };
    }) => {
      const data = await api.patch<MediaList>(`/trackers/lists/${list_id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'lists'] });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: async (list_id: number) => {
      await api.delete<GenericSuccessResponse | void>(`/trackers/lists/${list_id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'lists'] });
    },
  });

  const renamePlatformMutation = useMutation({
    mutationFn: async ({ platform_id, name }: { platform_id: number; name: string }) => {
      return await api.patch<GenericSuccessResponse | void>(`/trackers/platforms/${platform_id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'platforms'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const deletePlatformMutation = useMutation({
    mutationFn: async (platform_id: number) => {
      return await api.delete<GenericSuccessResponse | void>(`/trackers/platforms/${platform_id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'platforms'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  return {
    addSeries: addSeriesMutation.mutate,
    isAddingSeries: addSeriesMutation.isPending,
    updateSeries: updateSeriesMutation.mutate,
    isUpdatingSeries: updateSeriesMutation.isPending,
    addSeriesLog: addSeriesLogMutation.mutate,
    updateSeriesLog: updateSeriesLogMutation.mutate,
    deleteSeriesLog: deleteSeriesLogMutation.mutate,
    deleteSeries: deleteSeriesMutation.mutate,
    isDeletingSeries: deleteSeriesMutation.isPending,
    markAllEpisodesWatched: markAllEpisodesWatchedMutation.mutate,
    isMarkingAllWatched: markAllEpisodesWatchedMutation.isPending,
    toggleEpisodeWatched: toggleEpisodeWatchedMutation.mutate,
    isTogglingEpisodeWatched: toggleEpisodeWatchedMutation.isPending,

    addEpisodeLog: addEpisodeLogMutation.mutate,
    isAddingEpisodeLog: addEpisodeLogMutation.isPending,
    updateEpisodeLog: updateEpisodeLogMutation.mutate,
    isUpdatingEpisodeLog: updateEpisodeLogMutation.isPending,
    deleteEpisodeLog: deleteEpisodeLogMutation.mutate,
    isDeletingEpisodeLog: deleteEpisodeLogMutation.isPending,
    updateEpisodeNotes: updateEpisodeNotesMutation.mutate,
    isUpdatingEpisodeNotes: updateEpisodeNotesMutation.isPending,
    addQuote: addQuoteMutation.mutate,
    isAddingQuote: addQuoteMutation.isPending,
    updateQuote: updateQuoteMutation.mutate,
    isUpdatingQuote: updateQuoteMutation.isPending,
    deleteQuote: deleteQuoteMutation.mutate,
    isDeletingQuote: deleteQuoteMutation.isPending,
    createList: createListMutation.mutate,
    createListAsync: createListMutation.mutateAsync,
    isCreatingList: createListMutation.isPending,
    updateList: updateListMutation.mutate,
    updateListAsync: updateListMutation.mutateAsync,
    isUpdatingList: updateListMutation.isPending,
    deleteList: deleteListMutation.mutate,
    deleteListAsync: deleteListMutation.mutateAsync,
    isDeletingList: deleteListMutation.isPending,
    addToList: addToListMutation.mutate,
    addToListAsync: addToListMutation.mutateAsync,
    isAddingToList: addToListMutation.isPending,
    removeFromList: removeFromListMutation.mutate,
    removeFromListAsync: removeFromListMutation.mutateAsync,
    isRemovingFromList: removeFromListMutation.isPending,
    renamePlatform: renamePlatformMutation.mutate,
    deletePlatform: deletePlatformMutation.mutate,
  };
};
