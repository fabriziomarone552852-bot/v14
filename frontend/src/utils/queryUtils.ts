// src/utils/queryUtils.ts
import type { QueryClient } from '@tanstack/react-query';

/** Query key prefixes for all sync views */
const SYNC_VIEW_KEYS = ['daySync', 'weekSync', 'monthSync'] as const;

/**
 * Invalidates all sync view caches (day, week, month) and the tasks cache.
 * Extracts the repeated invalidation pattern used across mutation hooks.
 */
export const invalidateAllViews = (queryClient: QueryClient): void => {
  queryClient.invalidateQueries({
    predicate: (query) =>
      SYNC_VIEW_KEYS.includes(query.queryKey[0] as typeof SYNC_VIEW_KEYS[number]),
  });
  queryClient.invalidateQueries({ queryKey: ['tasks'] });
};

/**
 * Invalidates all sync view caches plus the events cache.
 * Used by event mutation hooks.
 */
export const invalidateAllViewsAndEvents = (queryClient: QueryClient): void => {
  queryClient.invalidateQueries({
    predicate: (query) =>
      [...SYNC_VIEW_KEYS, 'events'].includes(query.queryKey[0] as string),
  });
};
