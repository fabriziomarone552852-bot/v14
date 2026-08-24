// frontend/src/hooks/useDailyQuote.ts
import { useMemo } from 'react';
import { getQuoteOfTheDay } from '@/utils/quoteUtils';
import type { Quote } from '@/types';

export interface UseDailyQuoteReturn {
  quote: Quote;
  isTodayQuote: boolean;
}

/**
 * Custom Hook per la gestione dello stato della citazione del giorno.
 * Fornisce un'unica fonte di verità (Source of Truth) per il widget delle citazioni.
 */
export const useDailyQuote = (): UseDailyQuoteReturn => {
  const quote = useMemo<Quote>(() => getQuoteOfTheDay(), []);

  return {
    quote,
    isTodayQuote: true,
  };
};
