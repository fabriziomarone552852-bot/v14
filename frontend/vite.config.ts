import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

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
      '/auth': 'http://127.0.0.1:8000',
      '/users': 'http://127.0.0.1:8000',
      '/tasks': 'http://127.0.0.1:8000',
      '/events': 'http://127.0.0.1:8000',
      '/categories': 'http://127.0.0.1:8000',
      '/shopping': 'http://127.0.0.1:8000',
      '/analytics': 'http://127.0.0.1:8000',
      '/admin': 'http://127.0.0.1:8000',
      '/planning': 'http://127.0.0.1:8000',
      '/daily-entries': 'http://127.0.0.1:8000',
      '/countdowns': 'http://127.0.0.1:8000',
      '/habits': 'http://127.0.0.1:8000',
      '/habit-log': 'http://127.0.0.1:8000',
      '/sync': 'http://127.0.0.1:8000',
      '/catalogs': 'http://127.0.0.1:8000',
      '/monthly-entries': 'http://127.0.0.1:8000',
      '/yearly-entries': 'http://127.0.0.1:8000',
      '/bingo': 'http://127.0.0.1:8000',
      '/notifications': 'http://127.0.0.1:8000',
      '/google-calendar': 'http://127.0.0.1:8000',
      '/system': 'http://127.0.0.1:8000',
      '/api': 'http://127.0.0.1:8000',
    },
  },
})

