// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import './index.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Creiamo l'istanza di React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Niente più bootstrap() asincrono! Renderizziamo subito l'app!
const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found in document');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  </React.StrictMode>
);