// src/utils/queryCacheUtils.ts
//
// Modulo unico per le utility di cache e invalidazione React Query.
// Unifica i vecchi file cacheUtils.ts e queryUtils.ts, che definivano
// lo stesso array SYNC_*_KEYS con nomi diversi.

import type { QueryClient } from '@tanstack/react-query';

/** Query key prefixes per tutte le viste sync (giorno, settimana, mese, anno) */
const SYNC_VIEW_KEYS = ['daySync', 'weekSync', 'monthSync', 'yearSync'] as const;
type SyncViewKey = typeof SYNC_VIEW_KEYS[number];

// ---------------------------------------------------------------------------
// Cache update (aggiornamento ottimistico su più cache contemporaneamente)
// ---------------------------------------------------------------------------

/**
 * Applica un updater su tutte le cache delle viste sync.
 * Usato dagli hook di mutazione per aggiornamenti ottimistici
 * che devono toccare più cache in contemporanea.
 */
export const updateAllSyncCaches = <T>(
  queryClient: QueryClient,
  updater: (old: T | undefined) => T | undefined,
  additionalKeys: string[] = []
): void => {
  const allKeys = [...SYNC_VIEW_KEYS, ...additionalKeys];
  for (const key of allKeys) {
    queryClient.setQueriesData<T>({ queryKey: [key] }, updater);
  }
};

// ---------------------------------------------------------------------------
// Invalidazione
// ---------------------------------------------------------------------------

/**
 * Invalida tutte le cache delle viste sync (day, week, month, year)
 * e la cache dei task.
 */
export const invalidateAllViews = (queryClient: QueryClient): void => {
  queryClient.invalidateQueries({
    predicate: (query) =>
      SYNC_VIEW_KEYS.includes(query.queryKey[0] as SyncViewKey),
  });
  queryClient.invalidateQueries({ queryKey: ['tasks'] });
};

/**
 * Invalida tutte le cache delle viste sync più la cache degli eventi.
 * Usato dagli hook di mutazione degli eventi.
 */
export const invalidateAllViewsAndEvents = (queryClient: QueryClient): void => {
  queryClient.invalidateQueries({
    predicate: (query) =>
      [...SYNC_VIEW_KEYS, 'events'].includes(query.queryKey[0] as string),
  });
};
