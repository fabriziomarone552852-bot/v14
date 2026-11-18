import { useEffect, useRef } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type { MediaCreditMember } from '@/types/people';

interface SyncCreditsResult {
  synced_count: number;
  remaining_count: number;
}

interface TrackerItemWithCredits {
  id?: number;
  credits_summary?: MediaCreditMember[] | null;
}

const MAX_CREDITS_BATCHES_PER_MOUNT = 8;

/**
 * Hook condiviso per il backfill silenzioso in background di `credits_summary`
 * su film o serie tracciate già presenti in libreria.
 */
export function useAutoSyncTrackerCredits<T extends TrackerItemWithCredits>(
  items: T[] | undefined,
  endpoint: '/trackers/movies/sync-credits' | '/trackers/series/sync-credits',
  invalidateQueryKey: QueryKey,
  enabled: boolean
): void {
  const queryClient = useQueryClient();
  const syncInFlightRef = useRef(false);
  const completedAllRef = useRef(false);
  const batchesRunRef = useRef(0);

  const missingCount = items
    ? items.filter((item) => (item.id === undefined || item.id >= 0) && item.credits_summary == null).length
    : 0;

  useEffect(() => {
    if (!enabled) return;
    if (missingCount === 0) {
      completedAllRef.current = true;
      return;
    }
    if (completedAllRef.current) return;
    if (syncInFlightRef.current) return;
    if (batchesRunRef.current >= MAX_CREDITS_BATCHES_PER_MOUNT) return;

    let cancelled = false;
    syncInFlightRef.current = true;
    batchesRunRef.current += 1;

    api
      .post<SyncCreditsResult>(endpoint, {})
      .then((res) => {
        if (cancelled || !res) return;
        const { synced_count, remaining_count } = res;
        if (remaining_count === 0) {
          completedAllRef.current = true;
        }
        if (synced_count > 0) {
          void queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
        }
      })
      .catch(() => {
        // Silenzioso: ritenterà al successivo focus/mount senza disturbare l'utente
      })
      .finally(() => {
        syncInFlightRef.current = false;
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, missingCount, endpoint, invalidateQueryKey, queryClient]);
}
