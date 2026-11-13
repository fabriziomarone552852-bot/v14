// src/hooks/trackers/useAutoSyncSeriesProviders.ts
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type { TVSeries } from '@/types/trackers';

interface SyncSeriesProvidersResponse {
  synced_count: number;
  remaining_count: number;
}

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_BATCHES_PER_MOUNT = 8;

export const useAutoSyncSeriesProviders = (series: TVSeries[] | undefined): void => {
  const queryClient = useQueryClient();
  const syncInFlightRef = useRef(false);
  const syncBatchesCountRef = useRef(0);

  useEffect(() => {
    if (!series || series.length === 0) return;
    if (syncInFlightRef.current || syncBatchesCountRef.current >= MAX_BATCHES_PER_MOUNT) return;

    const nowMs = Date.now();
    const needsSync = series.some((s) => {
      if (s.id < 0) return false;
      if (s.watch_providers === null || s.watch_providers === undefined) return true;
      if (!s.providers_synced_at) return true;
      const syncedTime = new Date(s.providers_synced_at).getTime();
      return isNaN(syncedTime) || nowMs - syncedTime > FOURTEEN_DAYS_MS;
    });

    if (!needsSync) return;

    syncInFlightRef.current = true;
    syncBatchesCountRef.current += 1;

    api
      .post<SyncSeriesProvidersResponse>('/trackers/series/sync-providers', {})
      .then((res) => {
        if (res && res.synced_count > 0) {
          void queryClient.invalidateQueries({ queryKey: ['trackers', 'series'] });
        }
      })
      .catch(() => {
        // Silenzioso in background: riproverà alla prossima sessione in caso di assenza rete
      })
      .finally(() => {
        syncInFlightRef.current = false;
      });
  }, [series, queryClient]);
};
