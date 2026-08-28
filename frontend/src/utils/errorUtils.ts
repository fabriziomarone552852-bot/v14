// src/utils/errorUtils.ts
//
// Funzione centralizzata per estrarre un messaggio leggibile da qualsiasi tipo di errore.
// Elimina la necessità di `catch (err: any)` in tutto il progetto.
//
// Gestisce tre casi:
// 1. Errori Axios grezzi (da adminApi.ts che usa apiClient direttamente):
//    err.response.data.detail può essere una stringa o un array di oggetti FastAPI.
// 2. Errori JavaScript standard (Error):
//    Già convertiti dal wrapper `api` in apiService.ts.
// 3. Qualsiasi altra cosa (stringa, oggetto sconosciuto):
//    Fallback sicuro.

import axios from 'axios';

interface FastApiValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

interface ApiErrorResponseData {
  detail?: string | FastApiValidationError[];
  message?: string;
}

export function extractErrorMessage(err: unknown, fallback = 'Errore sconosciuto'): string {
  // Caso 1: Errore Axios grezzo (adminApi, shoppingApi senza wrapper)
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorResponseData | undefined;

    if (Array.isArray(data?.detail)) {
      // Errore di validazione FastAPI (422)
      return data.detail
        .map((e) => `${Array.isArray(e?.loc) ? e.loc.join(' → ') : String(e?.loc ?? '')}: ${e.msg}`)
        .join(' | ');
    }
    if (typeof data?.detail === 'string') return data.detail;
    if (typeof data?.message === 'string') return data.message;
    if (err.message) return err.message;
    return fallback;
  }

  // Caso 2: Errore JavaScript standard (già convertito da apiService.ts)
  if (err instanceof Error) return err.message;

  // Caso 3: Stringa grezza o valore sconosciuto
  if (typeof err === 'string') return err;

  return fallback;
}
