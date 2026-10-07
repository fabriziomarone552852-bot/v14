// src/hooks/mutations/useTrackersMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';

export const useTrackersMutations = () => {
  const queryClient = useQueryClient();

  const addSeriesMutation = useMutation({
    mutationFn: async (tmdb_id: number) => {
      const data = await api.post<any>('/trackers/series', { tmdb_id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const updateSeriesMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: { status?: string; rating?: number; custom_poster_path?: string; custom_backdrop_path?: string; notes?: string; review_visibility?: string } }) => {
      const data = await api.patch<any>(`/trackers/series/${id}`, updates);
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series', 'detail', id] });
    },
  });


  const addSeriesLogMutation = useMutation({
    mutationFn: async ({ tmdb_id, payload }: { tmdb_id: number; payload: any }) => {
      return await api.post(`/trackers/series/${tmdb_id}/logs`, payload);
    },
    onSuccess: (response: any) => {
      queryClient.setQueryData(['trackers', 'series'], (old: any) => {
        if (!old) return old;
        const seriesData = response.data || response;
        if (!old.find((s: any) => s.tmdb_id === seriesData.tmdb_id)) {
          return [seriesData, ...old];
        }
        return old.map((s: any) => s.tmdb_id === seriesData.tmdb_id ? seriesData : s);
      });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const updateSeriesLogMutation = useMutation({
    mutationFn: async ({ log_id, payload }: { log_id: number; payload: any }) => {
      return await api.patch(`/trackers/series/logs/${log_id}`, payload);
    },
    onSuccess: (response: any) => {
      queryClient.setQueryData(['trackers', 'series'], (old: any) => {
        if (!old) return old;
        const seriesData = response.data || response;
        if (!old.find((s: any) => s.tmdb_id === seriesData.tmdb_id)) {
          return [seriesData, ...old];
        }
        return old.map((s: any) => s.tmdb_id === seriesData.tmdb_id ? seriesData : s);
      });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const deleteSeriesLogMutation = useMutation({
    mutationFn: async (log_id: number) => {
      return await api.delete(`/trackers/series/logs/${log_id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });
  const deleteSeriesMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/trackers/series/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const markAllEpisodesWatchedMutation = useMutation({
    mutationFn: async (tmdb_id: number) => {
      const data = await api.post<any>(`/trackers/series/${tmdb_id}/watched-all`);
      return data;
    },
    onSuccess: (_, tmdb_id) => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series', 'detail', tmdb_id] });
    },
  });

  const addQuoteMutation = useMutation({
    mutationFn: async (payload: { episode_id: number; quote_text: string }) => {
      const data = await api.post<any>('/trackers/quotes', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const updateQuoteMutation = useMutation({
    mutationFn: async ({ quote_id, payload }: { quote_id: number; payload: { quote_text: string } }) => {
      const data = await api.patch<any>("/trackers/quotes/" + quote_id, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const deleteQuoteMutation = useMutation({
    mutationFn: async (quote_id: number) => {
      const data = await api.delete<any>("/trackers/quotes/" + quote_id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  
  const addEpisodeLogMutation = useMutation({
    mutationFn: async ({ episode_id, payload }: { episode_id: number; payload: { rating?: number | null; notes?: string; review_visibility?: string; watched_at?: string } }) => {
      const data = await api.post<any>(`/trackers/episodes/${episode_id}/logs`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const updateEpisodeLogMutation = useMutation({
    mutationFn: async ({ log_id, payload }: { log_id: number; payload: { rating?: number | null; notes?: string; review_visibility?: string; watched_at?: string } }) => {
      const data = await api.patch<any>(`/trackers/episodes/logs/${log_id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const deleteEpisodeLogMutation = useMutation({
    mutationFn: async (log_id: number) => {
      const data = await api.delete<any>(`/trackers/episodes/logs/${log_id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const updateEpisodeNotesMutation = useMutation({
    mutationFn: async ({ episode_id, payload }: { episode_id: number; payload: { rating?: number; notes?: string; review_visibility?: string; watched_at?: string } }) => {
      const data = await api.patch<any>(`/trackers/episodes/${episode_id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const toggleEpisodeWatchedMutation = useMutation({
    mutationFn: async ({ episode_id, watched }: { episode_id: number; watched: boolean }) => {
      if (watched) {
        return await api.post<any>(`/trackers/episodes/${episode_id}/watched`);
      } else {
        return await api.delete<any>(`/trackers/episodes/${episode_id}/watched`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series', 'detail'] });
    },
  });

  const createListMutation = useMutation({
    mutationFn: async (payload: { name: string; description?: string; visibility?: string }) => {
      const data = await api.post<any>('/trackers/lists', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'lists'] });
    },
  });

  const addToListMutation = useMutation({
    mutationFn: async ({ list_id, payload }: { list_id: number; payload: { series_tmdb_id: number } }) => {
      const data = await api.post<any>(`/trackers/lists/${list_id}/items`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'lists'] });
    },
  });

  const removeFromListMutation = useMutation({
    mutationFn: async ({ list_id, item_id }: { list_id: number; item_id: number }) => {
      const data = await api.delete<any>(`/trackers/lists/${list_id}/items/${item_id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'lists'] });
    },
  });

  const renamePlatformMutation = useMutation({
    mutationFn: async ({ platform_id, name }: { platform_id: number; name: string }) => {
      return await api.patch(`/trackers/platforms/${platform_id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'platforms'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
    },
  });

  const deletePlatformMutation = useMutation({
    mutationFn: async (platform_id: number) => {
      return await api.delete(`/trackers/platforms/${platform_id}`);
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
    isCreatingList: createListMutation.isPending,
    addToList: addToListMutation.mutate,
    isAddingToList: addToListMutation.isPending,
    removeFromList: removeFromListMutation.mutate,
    isRemovingFromList: removeFromListMutation.isPending,
    renamePlatform: renamePlatformMutation.mutate,
    deletePlatform: deletePlatformMutation.mutate,
  };
};



