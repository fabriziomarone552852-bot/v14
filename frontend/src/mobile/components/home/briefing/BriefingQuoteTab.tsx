// src/mobile/components/home/briefing/BriefingQuoteTab.tsx
import React from 'react';
import type { Quote } from '@/types';

export interface BriefingQuoteTabProps {
  quote: Quote;
  isTodayQuote: boolean;
}

export const BriefingQuoteTab: React.FC<BriefingQuoteTabProps> = ({
  quote,
  isTodayQuote,
}) => {
  return (
    <div className="my-auto w-full py-4 animate-fadeIn">
      <div className="relative rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white border border-blue-100/90 p-6 shadow-xs overflow-hidden">
        <span
          className="absolute -top-2 right-3.5 font-serif text-7xl font-black text-blue-200/55 leading-none select-none pointer-events-none"
          aria-hidden="true"
        >
          “”
        </span>

        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-3 py-1 rounded-full">
            {isTodayQuote ? 'Citazione del Giorno' : 'Ispirazione'}
          </span>

          <p className="text-base text-slate-800 italic font-medium leading-relaxed">
            "{quote.text}"
          </p>

          {quote.author && (
            <div className="pt-2 border-t border-blue-100/80 w-full">
              <span className="text-xs font-extrabold text-slate-700 tracking-wide">
                — {quote.author}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
