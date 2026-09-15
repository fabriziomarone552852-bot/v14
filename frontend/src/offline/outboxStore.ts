// src/offline/outboxStore.ts
import { create } from 'zustand';
import { get, set } from 'idb-keyval';
import type { OutboxItem, OutboxHttpMethod } from './types';

export const IDB_OUTBOX_KEY = 'SMART_AGENDA_OUTBOX_QUEUE_V14';

interface OutboxState {
  items: OutboxItem[];
  isInitialized: boolean;
  init: () => Promise<void>;
  enqueue: (item: {
    url: string;
    method: OutboxHttpMethod;
    data?: unknown;
    headers?: Record<string, string>;
    queryKeysToInvalidate?: string[];
    entityName?: string;
    summary?: string;
  }) => Promise<OutboxItem>;
  dequeue: (id: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<OutboxItem>) => Promise<void>;
  clear: () => Promise<void>;
}

const generateOutboxId = (): string => {
  return `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const inferEntitySummary = (method: OutboxHttpMethod, url: string, data?: unknown): { entityName: string; summary: string } => {
  const methodLabel = method === 'POST' ? 'Creazione' : method === 'PATCH' || method === 'PUT' ? 'Modifica' : 'Eliminazione';
  
  if (url.includes('/tasks')) {
    const title = typeof data === 'object' && data !== null && 'titolo' in data ? String((data as { titolo?: unknown }).titolo) : '';
    return {
      entityName: 'Task',
      summary: title ? `${methodLabel} task "${title}"` : `${methodLabel} task`,
    };
  }
  if (url.includes('/events')) {
    const title = typeof data === 'object' && data !== null && 'titolo' in data ? String((data as { titolo?: unknown }).titolo) : '';
    return {
      entityName: 'Evento',
      summary: title ? `${methodLabel} evento "${title}"` : `${methodLabel} evento`,
    };
  }
  if (url.includes('/notes') || url.includes('/daily-entries') || url.includes('/monthly-entries')) {
    return {
      entityName: 'Nota / Diario',
      summary: `${methodLabel} appunto/nota`,
    };
  }
  if (url.includes('/shopping/items')) {
    const name = typeof data === 'object' && data !== null && 'name' in data ? String((data as { name?: unknown }).name) : '';
    return {
      entityName: 'Articolo Spesa',
      summary: name ? `${methodLabel} articolo "${name}"` : `${methodLabel} articolo spesa`,
    };
  }
  if (url.includes('/shopping/lists')) {
    return {
      entityName: 'Lista Spesa',
      summary: `${methodLabel} lista spesa`,
    };
  }
  if (url.includes('/habits')) {
    const name = typeof data === 'object' && data !== null && 'nome' in data ? String((data as { nome?: unknown }).nome) : '';
    return {
      entityName: 'Abitudine',
      summary: name ? `${methodLabel} abitudine "${name}"` : `${methodLabel} abitudine`,
    };
  }
  if (url.includes('/countdowns')) {
    return {
      entityName: 'Countdown',
      summary: `${methodLabel} countdown`,
    };
  }
  if (url.includes('/categories')) {
    return {
      entityName: 'Categoria',
      summary: `${methodLabel} categoria`,
    };
  }

  return {
    entityName: 'Elemento',
    summary: `${methodLabel} su ${url.split('?')[0]}`,
  };
};

export const useOutboxStore = create<OutboxState>((setStore, getStore) => ({
  items: [],
  isInitialized: false,

  init: async () => {
    if (getStore().isInitialized) return;
    try {
      const persisted = await get<OutboxItem[]>(IDB_OUTBOX_KEY);
      if (Array.isArray(persisted)) {
        setStore({ items: persisted, isInitialized: true });
      } else {
        setStore({ items: [], isInitialized: true });
      }
    } catch (err) {
      console.warn('[OutboxStore] Errore caricamento coda da IndexedDB:', err);
      setStore({ items: [], isInitialized: true });
    }
  },

  enqueue: async (itemData) => {
    const inferred = inferEntitySummary(itemData.method, itemData.url, itemData.data);
    const newItem: OutboxItem = {
      id: generateOutboxId(),
      timestamp: Date.now(),
      url: itemData.url,
      method: itemData.method,
      data: itemData.data,
      headers: itemData.headers,
      queryKeysToInvalidate: itemData.queryKeysToInvalidate,
      entityName: itemData.entityName || inferred.entityName,
      summary: itemData.summary || inferred.summary,
      retryCount: 0,
      status: 'pending',
    };

    const updated = [...getStore().items, newItem];
    setStore({ items: updated });

    try {
      await set(IDB_OUTBOX_KEY, updated);
    } catch (err) {
      console.error('[OutboxStore] Errore salvataggio nuovo item in IndexedDB:', err);
    }

    return newItem;
  },

  dequeue: async (id: string) => {
    const updated = getStore().items.filter((item) => item.id !== id);
    setStore({ items: updated });

    try {
      await set(IDB_OUTBOX_KEY, updated);
    } catch (err) {
      console.error('[OutboxStore] Errore aggiornamento coda dopo dequeue:', err);
    }
  },

  updateItem: async (id: string, updates: Partial<OutboxItem>) => {
    const updated = getStore().items.map((item) => (item.id === id ? { ...item, ...updates } : item));
    setStore({ items: updated });

    try {
      await set(IDB_OUTBOX_KEY, updated);
    } catch (err) {
      console.error('[OutboxStore] Errore aggiornamento item in IndexedDB:', err);
    }
  },

  clear: async () => {
    setStore({ items: [] });
    try {
      await set(IDB_OUTBOX_KEY, []);
    } catch (err) {
      console.error('[OutboxStore] Errore pulizia coda in IndexedDB:', err);
    }
  },
}));
