// src/utils/cacheUtils.ts
import type { QueryClient } from '@tanstack/react-query';

/** Keys for all sync view caches */
const SYNC_CACHE_KEYS = ['daySync', 'weekSync', 'monthSync'] as const;

/**
 * Applies an updater function across all sync view caches.
 * Used by mutation hooks for optimistic updates that need to touch multiple caches.
 */
export const updateAllSyncCaches = <T>(
  queryClient: QueryClient,
  updater: (old: T | undefined) => T | undefined,
  additionalKeys: string[] = []
): void => {
  const allKeys = [...SYNC_CACHE_KEYS, ...additionalKeys];
  for (const key of allKeys) {
    queryClient.setQueriesData<T>({ queryKey: [key] }, updater);
  }
};
