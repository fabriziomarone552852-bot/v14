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

// === VARIABILI PER LA GESTIONE DELLA RACE CONDITION & JWT EXPIRY ===

interface JwtPayload {
  exp?: number;
}

/**
 * Verifica se il token JWT è già scaduto (o in scadenza entro bufferSeconds)
 * decodificando il payload locale senza inviare richieste destinate a fallire con 401.
 */
const isJwtExpired = (token: string, bufferSeconds = 10): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded)) as JwtPayload;
    if (typeof payload.exp !== 'number') return false;
    return Date.now() >= (payload.exp - bufferSeconds) * 1000;
  } catch {
    return false;
  }
};

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

// Interfaccia per la risposta attesa dal refresh
interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
}

const isTransientRefreshError = (err: unknown): boolean => {
  if (!axios.isAxiosError(err)) return false;
  const status = err.response?.status;
  return !err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || (typeof status === 'number' && status >= 500);
};

/**
 * Rinnova l'access token serializzando le richieste concorrenti nella coda failedQueue.
 * Riprova 1 volta in caso di errore transitorio (es. spin-up DB / 5xx) e forza il logout
 * solo se il refresh token è effettivamente rifiutato con 401/403.
 */
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    window.dispatchEvent(new Event('force-logout'));
    throw new Error('Refresh token mancante');
  }

  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  try {
    let response;
    try {
      response = await axios.post<RefreshResponse>(
        apiUrl('/auth/refresh'),
        { refresh_token: refreshToken },
        { timeout: 10000 }
      );
    } catch (firstErr: unknown) {
      if (isTransientRefreshError(firstErr)) {
        await new Promise((r) => setTimeout(r, 600));
        response = await axios.post<RefreshResponse>(
          apiUrl('/auth/refresh'),
          { refresh_token: refreshToken },
          { timeout: 10000 }
        );
      } else {
        throw firstErr;
      }
    }

    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    if (response.data.refresh_token) {
      localStorage.setItem('refreshToken', response.data.refresh_token);
    }

    processQueue(null, access_token);
    return access_token;
  } catch (refreshError: unknown) {
    processQueue(refreshError, null);
    const status = axios.isAxiosError(refreshError) ? refreshError.response?.status : undefined;
    if (status === 401 || status === 403) {
      window.dispatchEvent(new Event('force-logout'));
    }
    throw refreshError;
  } finally {
    isRefreshing = false;
  }
};
// =======================================================

// 3. IL VIGILE IN USCITA (Attacca il token e lo rinnova preventivamente se scaduto)
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = localStorage.getItem('token');
    const isAuthEndpoint = config.url?.includes('/auth/');

    if (token && !isAuthEndpoint && isJwtExpired(token) && localStorage.getItem('refreshToken')) {
      try {
        token = await refreshAccessToken();
      } catch {
        // Se il refresh fallisce per rete/5xx, lasciamo proseguire con il token attuale
        // (la gestione offline/401 dell'interceptor di risposta subentrerà se necessario)
        token = localStorage.getItem('token');
      }
    }

    if (token && config.headers) {
      // Prevent malformed headers if token somehow contains newlines/spaces
      config.headers.Authorization = `Bearer ${token.trim().replace(/[\r\n]/g, '')}`;
    }
    return config;
  }, 
  (error: unknown) => Promise.reject(error)
);

// Estendiamo la configurazione nativa di Axios per includere i nostri flag custom
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _skipOutbox?: boolean;
}

// 4. IL VIGILE IN ENTRATA (Rinnova il token se scade o salva in Outbox se offline)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    // A. GESTIONE AUTENTICAZIONE 401 & TOKEN REFRESH
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        return Promise.reject(refreshError);
      }
    }

    // B. GESTIONE OFFLINE / MUTAZIONI OUTBOX QUEUE
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
    const method = (originalRequest?.method?.toUpperCase() || '') as OutboxHttpMethod;
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const isExcluded =
      originalRequest?.url?.includes('/auth/') ||
      originalRequest?.url?.includes('/feedback/reports') ||
      originalRequest?.url?.includes('/media/');

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