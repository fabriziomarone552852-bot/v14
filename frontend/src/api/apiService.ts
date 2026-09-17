// src/api/apiService.ts
import { apiClient } from './client'; 
import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';

// Interfaccia per gli errori di FastAPI o risposte standard di errore
export interface ApiErrorData {
  detail?: string | { loc: (string | number)[]; msg: string; type: string }[];
  message?: string;
}

// Funzione centralizzata per la gestione degli errori (Pura e Type-Safe)
const handleAxiosError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorData>;
    
    if (axiosError.response) {
      const errorData = axiosError.response.data;
      let errorMessage = `Errore API: ${axiosError.response.status}`;

      // Gestione errore 422 di FastAPI
      if (Array.isArray(errorData?.detail)) {
        errorMessage = errorData.detail
          .map((err) => `${err.loc.join(' -> ')}: ${err.msg}`)
          .join(' | ');
      } 
      else if (typeof errorData?.detail === 'string') {
        errorMessage = errorData.detail;
      } 
      else if (errorData?.message) {
        errorMessage = errorData.message;
      }

      throw new Error(errorMessage);
    }
  }
  
  const message = error instanceof Error 
    ? error.message 
    : typeof error === 'string' 
      ? error 
      : 'Errore di rete o server non raggiungibile';
  throw new Error(message);
};

/**
 * Funzione privata generica che esegue una richiesta HTTP e gestisce
 * uniformemente il try/catch e la risposta 204 No Content.
 * Elimina la duplicazione del pattern try/catch in ogni metodo HTTP.
 */
const executeRequest = async <T>(fn: () => Promise<AxiosResponse<T>>): Promise<T | null> => {
  try {
    const response = await fn();
    return response.status === 204 ? null : response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

// L'oggetto 'api' è un modulo utility TypeScript puro (Singleton)
export const api = {
  /**
   * Esegue una richiesta GET.
   * Se il server restituisce 204 No Content, ritorna null.
   */
  get: <T = unknown>(endpoint: string, options?: AxiosRequestConfig): Promise<T | null> =>
    executeRequest(() => apiClient.get<T>(endpoint, options)),

  /**
   * Esegue una richiesta POST.
   */
  post: <T = unknown, D = unknown>(endpoint: string, body?: D, options?: AxiosRequestConfig): Promise<T | null> =>
    executeRequest(() => apiClient.post<T>(endpoint, body, options)),

  /**
   * Esegue una richiesta PATCH.
   */
  patch: <T = unknown, D = unknown>(endpoint: string, body: D, options?: AxiosRequestConfig): Promise<T | null> =>
    executeRequest(() => apiClient.patch<T>(endpoint, body, options)),

  /**
   * Esegue una richiesta PUT.
   */
  put: <T = unknown, D = unknown>(endpoint: string, body?: D, options?: AxiosRequestConfig): Promise<T | null> =>
    executeRequest(() => apiClient.put<T>(endpoint, body, options)),

  /**
   * Esegue una richiesta DELETE.
   */
  delete: <T = unknown>(endpoint: string, options?: AxiosRequestConfig): Promise<T | null> =>
    executeRequest(() => apiClient.delete<T>(endpoint, options)),
};