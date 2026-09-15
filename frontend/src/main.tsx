// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import './index.css';

import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createIndexedDBPersister } from '@/offline/indexedDbPersister';
import { initNetworkManager } from '@/offline/networkManager';
import { processOutboxQueue, registerQueryClientForSync } from '@/offline/syncEngine';
import { useOutboxStore } from '@/offline/outboxStore';

// 1. Creiamo il persister IndexedDB per TanStack Query
const persister = createIndexedDBPersister();

// 2. Creiamo l'istanza di React Query con supporto esteso alla cache offline (7 giorni di gcTime)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 1000 * 60 * 5, // 5 minuti
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 giorni di conservazione per consultazione offline
      retry: 1,
    },
  },
});

registerQueryClientForSync(queryClient);

// 3. Inizializzazione Outbox Store & Listener Connettività Ibrida
void useOutboxStore.getState().init().then(() => {
  initNetworkManager(() => {
    void processOutboxQueue(queryClient);
  });
  // Avvia sincronizzazione di eventuali code residue
  void processOutboxQueue(queryClient);
});

// 4. Bootstrap React con Persistenza della Cache
const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found in document');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 giorni
        buster: 'v14.2.0',
      }}
    >
      <App />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </PersistQueryClientProvider>
  </React.StrictMode>
);