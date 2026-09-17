// src/api/client.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { recordTelemetryError } from '@/utils/telemetry';
import { useOutboxStore } from '@/offline/outboxStore';
import { useNetworkStore } from '@/offline/networkManager';
import type { OutboxHttpMethod } from '@/offline/types';

// 1. URL BASE API (Supporta sia Web che Mobile con Proxy Tailscale Locale)
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
    return import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8088';
  }
  return import.meta.env.VITE_API_BASE_URL || '';
};

const API_BASE_URL = getApiBaseUrl();

export function apiUrl(path: string) {
  return `${getApiBaseUrl()}${path}`;
}

// 2. CREIAMO AXIOS USANDO L'URL DINAMICO
export const apiClient = axios.create({
  baseURL: API_BASE_URL 
});

// 3. IL VIGILE IN USCITA (Attacca il token)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, 
  (error: unknown) => Promise.reject(error)
);


// === VARIABILI PER LA GESTIONE DELLA RACE CONDITION ===

// Creiamo un'interfaccia dedicata per pulire la definizione della coda
interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error?: unknown) => void; 
}

// isRefreshing fa da "Semaforo Rosso"
let isRefreshing = false;
// failedQueue è la "Sala d'attesa" tipizzata
let failedQueue: QueuedRequest[] = [];

// Funzione per svuotare la sala d'attesa (Senza any!)
const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
// =======================================================


// Estendiamo la configurazione nativa di Axios per includere i nostri flag custom
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _skipOutbox?: boolean;
}

// Interfaccia per la risposta attesa dal refresh
interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
}

// 4. IL VIGILE IN ENTRATA (Rinnova il token se scade o salva in Outbox se offline)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    // A. GESTIONE AUTENTICAZIONE 401 & TOKEN REFRESH
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        window.dispatchEvent(new Event('force-logout'));
        return Promise.reject(error);
      }

      // 🚦 SE IL SEMAFORO È ROSSO
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
             originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest); 
        }).catch((err: unknown) => {
          return Promise.reject(err);
        });
      }

      // 🟢 SE IL SEMAFORO È VERDE
      isRefreshing = true;

      try {
        const response = await axios.post<RefreshResponse>(apiUrl('/auth/refresh'), {
          refresh_token: refreshToken
        });

        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        if (response.data.refresh_token) {
          localStorage.setItem('refreshToken', response.data.refresh_token);
        }

        processQueue(null, access_token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return apiClient(originalRequest);
        
      } catch (refreshError: unknown) {
        processQueue(refreshError, null);
        window.dispatchEvent(new Event('force-logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // B. GESTIONE OFFLINE / MUTAZIONI OUTBOX QUEUE
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
    const method = (originalRequest?.method?.toUpperCase() || '') as OutboxHttpMethod;
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const isExcluded =
      originalRequest?.url?.includes('/auth/') ||
      originalRequest?.url?.includes('/feedback/reports');

    if (isNetworkError && isMutating && !isExcluded && !originalRequest?._skipOutbox && originalRequest) {
      useNetworkStore.getState().setServerReachable(false);

      let parsedData: unknown = originalRequest.data;
      if (typeof originalRequest.data === 'string') {
        try {
          parsedData = JSON.parse(originalRequest.data);
        } catch {
          parsedData = originalRequest.data;
        }
      }

      await useOutboxStore.getState().enqueue({
        url: originalRequest.url || '',
        method,
        data: parsedData,
      });

      const pendingCount = useOutboxStore.getState().items.length;
      useNetworkStore.getState().setPendingCount(pendingCount);

      // Risposta sintetica positiva per abilitare l'aggiornamento ottimistico senza blocchi
      const fallbackId = typeof parsedData === 'object' && parsedData !== null && 'id' in parsedData
        ? (parsedData as { id: unknown }).id
        : Date.now();

      return {
        data: parsedData && typeof parsedData === 'object'
          ? { ...(parsedData as object), id: fallbackId, _offlineQueued: true }
          : { success: true, id: fallbackId, _offlineQueued: true },
        status: 200,
        statusText: 'OK (Offline Queued)',
        headers: {},
        config: originalRequest,
      };
    }
    
    // C. REGISTRAZIONE DIAGNOSTICA TELEMETRIA
    const errDetail =
      (error.response?.data && typeof error.response.data === 'object' && 'detail' in error.response.data)
        ? String((error.response.data as { detail: unknown }).detail)
        : error.message;

    recordTelemetryError({
      type: 'api_error',
      message: errDetail || 'Errore API sconosciuto',
      endpoint: originalRequest?.url,
      statusCode: error.response?.status,
    });

    return Promise.reject(error);
  }
);