// src/offline/indexedDbPersister.ts
import { get, set, del } from 'idb-keyval';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

export const IDB_QUERY_CACHE_KEY = 'SMART_AGENDA_QUERY_CACHE_V14';

/**
 * Crea un persister asincrono basato su IndexedDB (idb-keyval)
 * per salvare e ripristinare lo stato di TanStack Query anche offline o al riavvio dell'app.
 */
export function createIndexedDBPersister(idbKey = IDB_QUERY_CACHE_KEY): Persister {
  return {
    persistClient: async (persistedClient: PersistedClient) => {
      try {
        await set(idbKey, persistedClient);
      } catch (err) {
        console.warn('[OfflinePersister] Impossibile salvare la cache su IndexedDB:', err);
      }
    },
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      try {
        const data = await get<PersistedClient>(idbKey);
        return data;
      } catch (err) {
        console.warn('[OfflinePersister] Impossibile ripristinare la cache da IndexedDB:', err);
        return undefined;
      }
    },
    removeClient: async () => {
      try {
        await del(idbKey);
      } catch (err) {
        console.warn('[OfflinePersister] Impossibile eliminare la cache da IndexedDB:', err);
      }
    },
  };
}
