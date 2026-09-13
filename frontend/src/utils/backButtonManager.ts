// src/utils/backButtonManager.ts
import { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export type BackHandlerCallback = () => boolean | void;

interface RegisteredHandler {
  id: number;
  callback: BackHandlerCallback;
  priority: number;
  createdAt: number;
}

let nextId = 1;
const handlers: RegisteredHandler[] = [];

/**
 * Registra un gestore del tasto Indietro.
 * I gestori vengono eseguiti dal più recente / con priorità più alta (LIFO / priority).
 * Ritorna una funzione di cleanup per de-registrare il gestore.
 */
export function registerBackHandler(callback: BackHandlerCallback, priority = 10): () => void {
  const id = nextId++;
  const entry: RegisteredHandler = {
    id,
    callback,
    priority,
    createdAt: Date.now(),
  };

  handlers.push(entry);

  // Ordina: priorità decrescente, poi data creazione decrescente
  handlers.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return b.createdAt - a.createdAt;
  });

  return () => {
    const idx = handlers.findIndex((h) => h.id === id);
    if (idx !== -1) {
      handlers.splice(idx, 1);
    }
  };
}

/**
 * Esegue il gestore in cima allo stack.
 * Ritorna `true` se un overlay/modale ha gestito l'evento, `false` se lo stack era vuoto.
 */
export function executeBackHandler(): boolean {
  if (handlers.length === 0) return false;

  // Prendi il primo gestore (più recente / priorità più alta)
  const top = handlers[0];
  try {
    const result = top.callback();
    // Se esplicitamente ritorna false, non è stato gestito
    if (result === false) {
      return false;
    }
    return true;
  } catch (err) {
    console.error("Errore durante l'esecuzione del backHandler:", err);
    return false;
  }
}

/**
 * Hook React per registrare un gestore di chiusura quando `isOpen` è true.
 */
export function useBackHandler(
  isOpen: boolean,
  onBack: BackHandlerCallback,
  priority = 10
): void {
  useEffect(() => {
    if (!isOpen) return;
    const unregister = registerBackHandler(onBack, priority);
    return () => {
      unregister();
    };
  }, [isOpen, onBack, priority]);
}

/**
 * Inizializza il listener nativo del tasto Back di Capacitor (Android).
 * Se nessun modale o overlay è aperto, richiama `onFallbackNavigation`.
 */
export function initCapacitorBackButton(
  onFallbackNavigation: () => void
): () => void {
  if (!Capacitor.isNativePlatform()) {
    return () => {};
  }

  let cleanupListener: (() => void) | null = null;

  CapApp.addListener('backButton', () => {
    const handled = executeBackHandler();
    if (!handled) {
      onFallbackNavigation();
    }
  }).then((handle) => {
    cleanupListener = () => {
      handle.remove();
    };
  }).catch((err) => {
    console.error('Impossibile registrare backButton listener di Capacitor:', err);
  });

  return () => {
    if (cleanupListener) {
      cleanupListener();
    }
  };
}
