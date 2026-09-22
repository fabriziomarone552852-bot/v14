// src/offline/syncEngine.ts
import type { QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getApiBaseUrl } from '@/api/client';
import { useOutboxStore } from './outboxStore';
import { useNetworkStore } from './networkManager';
import { invalidateAllViews } from '@/utils/queryCacheUtils';

let isSyncing = false;
let queryClientRef: QueryClient | null = null;

export function registerQueryClientForSync(qc: QueryClient) {
  queryClientRef = qc;
}

/**
 * Esegue lo svuotamento sequenziale (FIFO) della coda delle mutazioni accumulate offline
 */
export async function processOutboxQueue(customQueryClient?: QueryClient): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  if (isSyncing) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  const outboxStore = useOutboxStore.getState();
  const networkStore = useNetworkStore.getState();
  const qc = customQueryClient || queryClientRef;

  // Assicura inizializzazione dello store
  if (!outboxStore.isInitialized) {
    await outboxStore.init();
  }

  const pendingItems = outboxStore.items.filter((item) => item.status === 'pending' || item.status === 'failed');

  networkStore.setPendingCount(pendingItems.length);

  if (pendingItems.length === 0) {
    networkStore.setSyncState('idle');
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  // Verifica connettività effettiva prima di procedere
  const isReachable = await networkStore.checkReachability();
  if (!isReachable) {
    networkStore.setSyncState('offline');
    return { processed: 0, succeeded: 0, failed: 0 };
  }

  isSyncing = true;
  networkStore.setSyncState('syncing');

  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  const baseUrl = getApiBaseUrl();
  const token = localStorage.getItem('token');

  for (const item of pendingItems) {
    await outboxStore.updateItem(item.id, { status: 'syncing' });

    try {
      const fullUrl = item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(item.headers || {}),
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      await axios({
        url: fullUrl,
        method: item.method,
        data: item.data,
        headers,
        timeout: 15000,
      });

      // Rimuovi dalla coda dopo esito positivo
      await outboxStore.dequeue(item.id);
      succeeded++;
      processed++;

      // Invalida le cache interessate
      if (qc) {
        if (item.queryKeysToInvalidate && item.queryKeysToInvalidate.length > 0) {
          for (const key of item.queryKeysToInvalidate) {
            void qc.invalidateQueries({ queryKey: [key] });
          }
        } else {
          invalidateAllViews(qc);
        }
      }
    } catch (err: unknown) {
      processed++;
      const isAxiosError = axios.isAxiosError(err);
      const isNetworkIssue = !err || isAxiosError && (!err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED');

      if (isNetworkIssue) {
        // Errore di connessione: blocca la sincronizzazione e attendi riconnessione
        await outboxStore.updateItem(item.id, {
          status: 'pending',
          retryCount: item.retryCount + 1,
          errorMessage: 'Connessione interrotta durante la sincronizzazione',
        });
        networkStore.setServerReachable(false);
        networkStore.setSyncState('offline');
        break;
      } else {
        // Errore applicativo
        failed++;
        const errMsg = isAxiosError && err.response?.data && typeof err.response.data === 'object' && 'detail' in err.response.data
          ? String((err.response.data as { detail: unknown }).detail)
          : 'Errore durante la richiesta';

        // Se l'errore è di tipo 4xx (Client Error come 400, 404, 422), la richiesta non avrà mai successo.
        // Rimuoviamola dalla coda per evitare un loop infinito di retry inutili.
        const status = isAxiosError && err.response ? err.response.status : 0;
        if (status >= 400 && status < 500) {
           console.warn(`[SyncEngine] Richiesta fallita con ${status} (${errMsg}). Rimuovo dalla coda per evitare loop.`);
           await outboxStore.dequeue(item.id);
        } else {
           await outboxStore.updateItem(item.id, {
             status: 'failed',
             retryCount: item.retryCount + 1,
             errorMessage: errMsg,
           });
        }
      }
    }
  }

  isSyncing = false;
  const remainingPending = useOutboxStore.getState().items.filter((i) => i.status === 'pending' || i.status === 'failed');
  networkStore.setPendingCount(remainingPending.length);

  if (succeeded > 0) {
    networkStore.setLastSyncedAt(Date.now());
    if (qc) {
      invalidateAllViews(qc);
    }
    // Emetti evento per notifiche UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('offline-sync-completed', {
          detail: { succeeded, failed, total: processed },
        })
      );
    }
  }

  if (remainingPending.length > 0) {
    const hasOnlyFailed = remainingPending.every((i) => i.status === 'failed');
    networkStore.setSyncState(hasOnlyFailed ? 'error' : 'idle', hasOnlyFailed ? 'Alcune modifiche non sono state sincronizzate' : null);
  } else {
    networkStore.setSyncState('idle');
  }

  return { processed, succeeded, failed };
}
