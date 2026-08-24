// frontend/src/utils/quoteUtils.ts
import { QUOTES_DATABASE } from '@/data/quotesData';
import type { Quote } from '@/types';

/**
 * Calcola il giorno progressivo dell'anno per una data specificata (1-366).
 */
export const getDayOfYear = (date: Date = new Date()): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDayMs = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDayMs);
};

/**
 * Seleziona la citazione del giorno in modo deterministico e univoco basato sulla data.
 * Garantisce che per l'intera giornata venga mostrata la stessa citazione, 
 * ruotando automaticamente ogni giorno alle ore 00:00.
 */
export const getQuoteOfTheDay = (date: Date = new Date()): Quote => {
  if (QUOTES_DATABASE.length === 0) {
    return {
      id: 0,
      text: "Ogni giorno è una nuova opportunità.",
      author: "Anonimo",
      category: "Motivazione"
    };
  }

  const dayOfYear = getDayOfYear(date);
  const index = Math.abs((dayOfYear + date.getFullYear()) % QUOTES_DATABASE.length);
  return QUOTES_DATABASE[index];
};

/**
 * Restituisce una citazione casuale pescando dal mazzo, escludendo l'ID attuale.
 */
export const getRandomQuote = (excludeId?: number): Quote => {
  const candidates: Quote[] = excludeId !== undefined 
    ? QUOTES_DATABASE.filter((q: Quote) => q.id !== excludeId)
    : QUOTES_DATABASE;
  
  if (candidates.length === 0) {
    return getQuoteOfTheDay();
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
};
