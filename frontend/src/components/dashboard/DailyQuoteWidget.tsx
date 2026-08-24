// frontend/src/components/dashboard/DailyQuoteWidget.tsx
import React from 'react';
import { useDailyQuote } from '@/hooks/useDailyQuote';
import { QuoteCard } from './quotes/QuoteCard';
import { FairytaleHillCard } from './quotes/FairytaleHillCard';

/**
 * Widget principale della sezione inferiore della HomePage.
 * Coordina la card della citazione e la card dell'illustrazione naturale
 * all'interno di una griglia a 12 colonne con altezza rigorosamente bloccata.
 */
export const DailyQuoteWidget: React.FC = () => {
  const { quote, isTodayQuote } = useDailyQuote();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[155px] shrink-0 flex-none select-none">
      <QuoteCard quote={quote} isTodayQuote={isTodayQuote} />
      <FairytaleHillCard />
    </div>
  );
};
