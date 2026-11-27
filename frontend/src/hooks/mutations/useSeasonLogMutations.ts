// src/hooks/mutations/useSeasonLogMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { showTrackerToast } from '@/components/trackers/shared/TrackerToast';
import type {
  TVSeries,
  TMDBSeries,
  UserSeasonLog,
  SeasonLogMutationPayload,
} from '@/types/trackers';

type SeriesCacheSnapshot = {
  previousSeriesQueries: [readonly unknown[], TVSeries[] | undefined][];
  previousDetailQueries: [readonly unknown[], TMDBSeries | undefined][];
};

const extractSeriesPayload = (
  response: { data?: TVSeries } | TVSeries | null | undefined
): TVSeries | null => {
  if (!response) return null;
  if ('data' in response && response.data) return response.data;
  if ('tmdb_id' in response) return response as TVSeries;
  return null;
};

export const useSeasonLogMutations = () => {
  const queryClient = useQueryClient();

  const snapshotSeriesCaches = async (): Promise<SeriesCacheSnapshot> => {
    await queryClient.cancelQueries({ queryKey: ['trackers', 'series'] });
    const previousSeriesQueries = queryClient.getQueriesData<TVSeries[]>({
      queryKey: ['trackers', 'series'],
    });
    const previousDetailQueries = queryClient.getQueriesData<TMDBSeries>({
      queryKey: ['trackers', 'series', 'detail'],
    });
    return { previousSeriesQueries, previousDetailQueries };
  };

  const restoreSeriesCaches = (context?: SeriesCacheSnapshot) => {
    if (!context) return;
    context.previousSeriesQueries.forEach(([key, data]) => queryClient.setQueryData(key, data));
    context.previousDetailQueries.forEach(([key, data]) => queryClient.setQueryData(key, data));
  };

  const patchSeasonLogsInCaches = (
    updater: (logs: UserSeasonLog[], tmdbId?: number) => UserSeasonLog[],
    targetTmdbId?: number
  ) => {
    queryClient.setQueriesData<TMDBSeries>({ queryKey: ['trackers', 'series', 'detail'] }, (old) => {
      if (!old) return old;
      if (targetTmdbId !== undefined && old.tmdb_id !== targetTmdbId) return old;
      return {
        ...old,
        season_logs: updater(old.season_logs || [], old.tmdb_id),
      };
    });

    queryClient.setQueriesData<TVSeries[]>({ queryKey: ['trackers', 'series'] }, (old) => {
      if (!Array.isArray(old)) return old;
      return old.map((s) => {
        if (targetTmdbId !== undefined && s.tmdb_id !== targetTmdbId) return s;
        return {
          ...s,
          season_logs: updater(s.season_logs || [], s.tmdb_id),
        };
      });
    });
  };

  const applyServerSeriesResponse = (response: { data?: TVSeries } | TVSeries | null | undefined) => {
    const seriesData = extractSeriesPayload(response);
    if (!seriesData) return;

    queryClient.setQueryData<TMDBSeries | null>(
      ['trackers', 'series', 'detail', seriesData.tmdb_id],
      (old) => (old ? { ...old, ...seriesData } : seriesData)
    );
    queryClient.setQueriesData<TVSeries[]>({ queryKey: ['trackers', 'series'] }, (old) => {
      if (!Array.isArray(old)) return old;
      if (!old.find((s) => s.tmdb_id === seriesData.tmdb_id)) {
        return [seriesData, ...old];
      }
      return old.map((s) => (s.tmdb_id === seriesData.tmdb_id ? seriesData : s));
    });
  };

  const addSeasonLogMutation = useMutation({
    mutationFn: async ({
      tmdb_id,
      season_number,
      payload,
    }: {
      tmdb_id: number;
      season_number: number;
      payload: SeasonLogMutationPayload;
    }) => {
      return await api.post<{ data?: TVSeries } | TVSeries>(
        `/trackers/series/${tmdb_id}/seasons/${season_number}/logs`,
        payload
      );
    },
    onMutate: async ({ tmdb_id, season_number, payload }) => {
      const snapshot = await snapshotSeriesCaches();
      const nowIso = new Date().toISOString();
      const optimisticLog: UserSeasonLog = {
        id: -Date.now(),
        user_id: 0,
        series_tmdb_id: tmdb_id,
        season_number,
        rating: payload.rating ?? null,
        notes: payload.notes ?? null,
        review_visibility: payload.review_visibility || 'friends_only',
        watched_at: payload.watched_at ?? null,
        created_at: nowIso,
        updated_at: nowIso,
        comments: [],
      };
      patchSeasonLogsInCaches((logs) => [optimisticLog, ...logs], tmdb_id);
      return snapshot;
    },
    onError: (_err, _vars, context) => {
      restoreSeriesCaches(context);
      showTrackerToast('Impossibile salvare la recensione della stagione. Riprova.', 'warning');
    },
    onSuccess: (response) => {
      applyServerSeriesResponse(response);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series', 'detail'] });
    },
  });

  const updateSeasonLogMutation = useMutation({
    mutationFn: async ({
      log_id,
      payload,
    }: {
      log_id: number;
      payload: SeasonLogMutationPayload;
    }) => {
      return await api.patch<{ data?: TVSeries } | TVSeries>(
        `/trackers/series/season-logs/${log_id}`,
        payload
      );
    },
    onMutate: async ({ log_id, payload }) => {
      const snapshot = await snapshotSeriesCaches();
      const nowIso = new Date().toISOString();
      patchSeasonLogsInCaches((logs) =>
        logs.map((l) =>
          l.id === log_id
            ? {
                ...l,
                rating: payload.rating !== undefined ? payload.rating : l.rating,
                notes: payload.notes !== undefined ? payload.notes : l.notes,
                review_visibility: payload.review_visibility ?? l.review_visibility,
                watched_at: payload.watched_at !== undefined ? payload.watched_at : l.watched_at,
                updated_at: nowIso,
              }
            : l
        )
      );
      return snapshot;
    },
    onError: (_err, _vars, context) => {
      restoreSeriesCaches(context);
      showTrackerToast('Impossibile aggiornare la recensione della stagione. Riprova.', 'warning');
    },
    onSuccess: (response) => {
      applyServerSeriesResponse(response);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series', 'detail'] });
    },
  });

  const deleteSeasonLogMutation = useMutation({
    mutationFn: async (log_id: number) => {
      return await api.delete<{ data?: TVSeries } | TVSeries>(
        `/trackers/series/season-logs/${log_id}`
      );
    },
    onMutate: async (log_id) => {
      const snapshot = await snapshotSeriesCaches();
      patchSeasonLogsInCaches((logs) => logs.filter((l) => l.id !== log_id));
      return snapshot;
    },
    onError: (_err, _vars, context) => {
      restoreSeriesCaches(context);
      showTrackerToast('Impossibile eliminare la recensione della stagione. Riprova.', 'warning');
    },
    onSuccess: (response) => {
      applyServerSeriesResponse(response);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
      queryClient.invalidateQueries({ queryKey: ['trackers', 'series', 'detail'] });
    },
  });

  return {
    addSeasonLog: addSeasonLogMutation.mutate,
    isAddingSeasonLog: addSeasonLogMutation.isPending,
    updateSeasonLog: updateSeasonLogMutation.mutate,
    isUpdatingSeasonLog: updateSeasonLogMutation.isPending,
    deleteSeasonLog: deleteSeasonLogMutation.mutate,
    isDeletingSeasonLog: deleteSeasonLogMutation.isPending,
  };
};
