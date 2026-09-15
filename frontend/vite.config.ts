import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import type { IncomingMessage } from 'http'

const apiProxyTarget = 'http://127.0.0.1:8000';

const apiProxyConfig = {
  target: apiProxyTarget,
  bypass: (req: IncomingMessage) => {
    // Se la richiesta è una navigazione del browser (richiede HTML),
    // serve index.html per consentire a React Router di gestire la rotta SPA.
    if (req.headers.accept?.includes('text/html')) {
      return '/index.html';
    }
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/auth': apiProxyConfig,
      '/users': apiProxyConfig,
      '/tasks': apiProxyConfig,
      '/events': apiProxyConfig,
      '/categories': apiProxyConfig,
      '/shopping': apiProxyConfig,
      '/analytics': apiProxyConfig,
      '/admin': apiProxyConfig,
      '/planning': apiProxyConfig,
      '/daily-entries': apiProxyConfig,
      '/countdowns': apiProxyConfig,
      '/habits': apiProxyConfig,
      '/habit-log': apiProxyConfig,
      '/sync': apiProxyConfig,
      '/catalogs': apiProxyConfig,
      '/monthly-entries': apiProxyConfig,
      '/yearly-entries': apiProxyConfig,
      '/bingo': apiProxyConfig,
      '/notifications': apiProxyConfig,
      '/google-calendar': apiProxyConfig,
      '/system': apiProxyConfig,
      '/api': apiProxyConfig,
    },
  },
})


