// frontend/src/hooks/useDailyQuote.ts
import { useState, useEffect, useRef } from 'react';
import {
  getOrPickDailyQuote,
  fetchQuotesFromCsv,
  toLocalDateKey,
  DEFAULT_QUOTES_POOL,
} from '@/utils/quoteUtils';
import type { Quote } from '@/types';

export interface UseDailyQuoteReturn {
  quote: Quote;
  isTodayQuote: boolean;
}

/**
 * Custom Hook per la gestione dello stato della citazione del giorno.
 * Carica le citazioni dal file `quotes.csv` all'avvio e ad ogni cambio data,
 * estraendole a caso senza ripetizioni (mazzo di carte).
 */
export const useDailyQuote = (): UseDailyQuoteReturn => {
  // Inizializzazione immediata sincrona con fallback per evitare layout shift
  const [quotesPool, setQuotesPool] = useState<Quote[]>(DEFAULT_QUOTES_POOL);
  const [quote, setQuote] = useState<Quote>(() => getOrPickDailyQuote(DEFAULT_QUOTES_POOL));
  const poolRef = useRef<Quote[]>(quotesPool);
  poolRef.current = quotesPool;

  useEffect(() => {
    let isMounted = true;

    // 1. Carica il pool aggiornato dal file quotes.csv
    const loadCsvQuotes = async (): Promise<void> => {
      const pool = await fetchQuotesFromCsv();
      if (!isMounted) return;

      if (pool.length > 0) {
        setQuotesPool(pool);
        const daily = getOrPickDailyQuote(pool);
        setQuote(daily);
      }
    };

    void loadCsvQuotes();

    // 2. Controllo periodico del cambio giorno (ogni 60 secondi)
    let lastCheckedDateKey = toLocalDateKey();

    const timer = setInterval(() => {
      const currentDateKey = toLocalDateKey();
      if (currentDateKey !== lastCheckedDateKey) {
        lastCheckedDateKey = currentDateKey;
        // Al cambio di data a mezzanotte, ricarica il CSV e pesca la nuova citazione
        void fetchQuotesFromCsv().then((freshPool) => {
          if (!isMounted) return;
          const poolToUse = freshPool.length > 0 ? freshPool : poolRef.current;
          setQuotesPool(poolToUse);
          const nextQuote = getOrPickDailyQuote(poolToUse);
          setQuote(nextQuote);
        });
      }
    }, 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  return {
    quote,
    isTodayQuote: true,
  };
};

