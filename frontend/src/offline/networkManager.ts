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

    try {
      const baseUrl = getApiBaseUrl();
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      // Probe leggero con timeout di 4 secondi
      await axios.get(`${baseUrl}/users/me`, {
        headers,
        timeout: 4000,
        validateStatus: (status) => status < 500, // 200, 401, 403, 404 indicano comunque che il server risponde
      });

      get().setServerReachable(true);
      return true;
    } catch {
      get().setServerReachable(false);
      return false;
    }
  },
}));

let isInitialized = false;
let probeIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Inizializza i listener di rete del browser e il polling di heartbeat
 */
export function initNetworkManager(onReconnected?: () => void): () => void {
  if (typeof window === 'undefined' || isInitialized) {
    return () => {};
  }

  isInitialized = true;
  const store = useNetworkStore.getState();

  const handleOnline = async () => {
    store.setOnline(true);
    const reachable = await store.checkReachability();
    if (reachable && onReconnected) {
      onReconnected();
    }
  };

  const handleOffline = () => {
    store.setOnline(false);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Heartbeat probe ogni 30 secondi per rilevare tunnel Tailscale o cadute connessione
  probeIntervalId = setInterval(async () => {
    if (navigator.onLine) {
      const wasReachable = store.isServerReachable;
      const nowReachable = await store.checkReachability();
      if (!wasReachable && nowReachable && onReconnected) {
        onReconnected();
      }
    }
  }, 30000);

  // Esegui un primo check immediato
  void store.checkReachability();

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    if (probeIntervalId) clearInterval(probeIntervalId);
    isInitialized = false;
  };
}
