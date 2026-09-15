// src/offline/types.ts

export type OutboxHttpMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type OutboxItemStatus = 'pending' | 'syncing' | 'failed';

export interface OutboxItem {
  id: string;
  timestamp: number;
  url: string;
  method: OutboxHttpMethod;
  data?: unknown;
  headers?: Record<string, string>;
  queryKeysToInvalidate?: string[];
  entityName?: string;
  summary?: string;
  retryCount: number;
  status: OutboxItemStatus;
  errorMessage?: string;
}

export type SyncState = 'idle' | 'syncing' | 'offline' | 'error';

export interface NetworkStatusState {
  isOnline: boolean;
  isServerReachable: boolean;
  lastCheckedAt: number | null;
  syncState: SyncState;
  pendingCount: number;
  lastSyncedAt: number | null;
  lastSyncError: string | null;
}
