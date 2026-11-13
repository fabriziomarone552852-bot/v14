// src/offline/networkManager.ts
import { create } from 'zustand';
import axios from 'axios';
import { getApiBaseUrl } from '@/api/client';
import type { NetworkStatusState, SyncState } from './types';

interface NetworkStore extends NetworkStatusState {
  setOnline: (isOnline: boolean) => void;
  setServerReachable: (isReachable: boolean) => void;
  setSyncState: (state: SyncState, error?: string | null) => void;
  setPendingCount: (count: number) => void;
  setLastSyncedAt: (timestamp: number) => void;
  checkReachability: () => Promise<boolean>;
}

interface WindowWithNetworkCleanup extends Window {
  __vitaNetworkCleanup?: () => void;
}

let inFlightReachabilityPromise: Promise<boolean> | null = null;

export const useNetworkStore = create<NetworkStore>((set, get) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isServerReachable: true,
  lastCheckedAt: null,
  syncState: 'idle',
  pendingCount: 0,
  lastSyncedAt: null,
  lastSyncError: null,

  setOnline: (isOnline) => {
    set({ isOnline });
    if (!isOnline) {
      set({ isServerReachable: false, syncState: 'offline' });
    }
  },

  setServerReachable: (isServerReachable) => {
    set({
      isServerReachable,
      lastCheckedAt: Date.now(),
      syncState: !isServerReachable ? 'offline' : get().syncState === 'offline' ? 'idle' : get().syncState,
    });
  },

  setSyncState: (syncState, error = null) => {
    set({ syncState, lastSyncError: error });
  },

  setPendingCount: (pendingCount) => {
    set({ pendingCount });
  },

  setLastSyncedAt: (lastSyncedAt) => {
    set({ lastSyncedAt, lastSyncError: null });
  },

  checkReachability: async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      get().setServerReachable(false);
      return false;
    }

    const { lastCheckedAt, isServerReachable } = get();
    if (isServerReachable && lastCheckedAt !== null && Date.now() - lastCheckedAt < 5000) {
      return true;
    }

    if (inFlightReachabilityPromise) {
      return inFlightReachabilityPromise;
    }

    inFlightReachabilityPromise = (async () => {
      try {
        const baseUrl = getApiBaseUrl();

        // Probe leggero zero-DB e senza header Authorization (evita query SQL, preflight OPTIONS e 401 a token scaduto)
        await axios.get(`${baseUrl}/system/version`, {
          timeout: 4000,
          validateStatus: (status) => status < 500,
        });

        get().setServerReachable(true);
        return true;
      } catch {
        get().setServerReachable(false);
        return false;
      } finally {
        inFlightReachabilityPromise = null;
      }
    })();

    return inFlightReachabilityPromise;
  },
}));

/**
 * Inizializza i listener di rete del browser e il polling di heartbeat
 */
export function initNetworkManager(onReconnected?: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const win = window as WindowWithNetworkCleanup;
  if (win.__vitaNetworkCleanup) {
    win.__vitaNetworkCleanup();
  }

  const handleOnline = async () => {
    const store = useNetworkStore.getState();
    store.setOnline(true);
    const reachable = await store.checkReachability();
    if (reachable && onReconnected) {
      onReconnected();
    }
  };

  const handleOffline = () => {
    useNetworkStore.getState().setOnline(false);
  };

  const handleVisibilityChange = async () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible' && navigator.onLine) {
      const store = useNetworkStore.getState();
      const wasReachable = store.isServerReachable;
      const nowReachable = await store.checkReachability();
      if (!wasReachable && nowReachable && onReconnected) {
        onReconnected();
      }
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Heartbeat probe ogni 60 secondi quando il tab è visibile o quando siamo in stato offline/pending
  const probeIntervalId = setInterval(async () => {
    if (!navigator.onLine) return;
    const store = useNetworkStore.getState();
    const isTabHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
    if (isTabHidden && store.isServerReachable && store.pendingCount === 0) {
      return;
    }

    const wasReachable = store.isServerReachable;
    const nowReachable = await store.checkReachability();
    if (!wasReachable && nowReachable && onReconnected) {
      onReconnected();
    }
  }, 60000);

  // Esegui un primo check immediato
  void useNetworkStore.getState().checkReachability();

  const cleanup = () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    clearInterval(probeIntervalId);
    if (win.__vitaNetworkCleanup === cleanup) {
      delete win.__vitaNetworkCleanup;
    }
  };

  win.__vitaNetworkCleanup = cleanup;
  return cleanup;
}
