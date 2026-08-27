// frontend/src/components/dashboard/quotes/QuoteCard.tsx
import React from 'react';
import type { Quote } from '@/types';

export interface QuoteCardProps {
  quote: Quote;
  isTodayQuote: boolean;
}

/**
 * Componente atomico per la visualizzazione della card citazione sul lato sinistro.
 * Segue il principio di responsabilità singola (SRP): si occupa solo del rendering della citazione.
 */
export const QuoteCard: React.FC<QuoteCardProps> = ({ quote, isTodayQuote }) => {
  return (
    <div className="xl:col-span-5 bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-full flex flex-col justify-between relative overflow-hidden">
      
      {/* Header superiore: Badge "Citazione del Giorno" + virgoletta stilizzata */}
      <div className="flex items-center justify-between shrink-0">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
          {isTodayQuote ? "Citazione del Giorno" : "Ispirazione"}
        </span>
        <span className="font-serif text-3xl font-bold text-blue-200 leading-none select-none">“</span>
      </div>

      {/* Corpo centrale: Testo della citazione */}
      <div className="my-auto py-1">
        <p 
          className="text-sm sm:text-[15px] text-gray-800 italic font-medium leading-relaxed line-clamp-3"
          title={`"${quote.text}" — ${quote.author}`}
        >
          "{quote.text}"
        </p>
      </div>

      {/* Footer inferiore: Autore */}
      <div className="text-right shrink-0">
        <span className="text-xs sm:text-sm text-gray-900 font-bold tracking-wide">
          — {quote.author}
        </span>
      </div>

    </div>
  );
};
