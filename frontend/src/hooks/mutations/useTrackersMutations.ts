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
    mutationFn: async ({ id, updates }: { id: number; updates: { status?: string; rating?: number } }) => {
      const data = await api.patch<any>(`/trackers/series/${id}`, updates);
      return data;
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

  return {
    addSeries: addSeriesMutation.mutate,
    isAddingSeries: addSeriesMutation.isPending,
    updateSeries: updateSeriesMutation.mutate,
    isUpdatingSeries: updateSeriesMutation.isPending,
    deleteSeries: deleteSeriesMutation.mutate,
    isDeletingSeries: deleteSeriesMutation.isPending,
  };
};
