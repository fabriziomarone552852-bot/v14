// src/utils/authErrorUtils.ts
import axios from 'axios';
import { extractErrorMessage } from './errorUtils';

/**
 * Converte qualsiasi errore HTTP o di runtime generato durante il login,
 * la registrazione o il cambio password in un messaggio chiaro, professionale e in italiano.
 */
export function formatAuthErrorMessage(err: unknown, defaultFallback = 'Si è verificato un errore durante l\'operazione.'): string {
  if (axios.isAxiosError(err)) {
    // 1. Errore di Rete / Server irraggiungibile (NAS spento, Tailscale offline, timeout)
    const isNetworkError =
      !err.response ||
      err.code === 'ERR_NETWORK' ||
      err.code === 'ECONNABORTED' ||
      err.message?.toLowerCase().includes('network error') ||
      err.message?.toLowerCase().includes('timeout');

    if (isNetworkError) {
      return 'Impossibile contattare il server. Verifica la tua connessione a Internet e assicurati che Tailscale sia attivo.';
    }

    const status = err.response?.status;
    const rawDetail = extractErrorMessage(err, '');

    // 2. Errore 401: Credenziali non valide
    if (status === 401) {
      if (rawDetail && rawDetail.toLowerCase().includes('errati')) {
        return 'Username o password errati. Ricontrolla i dati inseriti e riprova.';
      }
      return 'Credenziali non valide. Verifica username e password.';
    }

    // 3. Errore 400: Account disattivato o utente già esistente
    if (status === 400) {
      const lower = rawDetail.toLowerCase();
      if (lower.includes('disattivato') || lower.includes('bloccato')) {
        return 'Questo account è stato disattivato. Contatta un amministratore di sistema per richiederne la riattivazione.';
      }
      if (lower.includes('già registrati') || lower.includes('esistente') || lower.includes('already exists')) {
        return 'Username o email già in uso. Prova con credenziali differenti.';
      }
      if (rawDetail) return rawDetail;
    }

    // 4. Errore 422: Validazione input FastAPI
    if (status === 422) {
      return rawDetail || 'I dati inseriti non sono validi. Controlla che tutti i campi siano compilati correttamente.';
    }

    // 5. Errore 500+: Errore interno server
    if (status && status >= 500) {
      return 'Il server ha riscontrato un problema temporaneo (500). Riprova tra qualche istante.';
    }

    if (rawDetail) {
      return rawDetail;
    }
  }

  if (err instanceof Error) {
    return err.message;
  }

  if (typeof err === 'string' && err.trim().length > 0) {
    return err;
  }

  return defaultFallback;
}
