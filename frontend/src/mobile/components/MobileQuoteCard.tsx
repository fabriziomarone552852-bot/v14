// src/mobile/components/MobileQuoteCard.tsx
import React, { useState } from 'react';
import { useDailyQuote } from '@/hooks/useDailyQuote';

export const MobileQuoteCard: React.FC = () => {
  const { quote } = useDailyQuote();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      onClick={() => setIsExpanded((prev) => !prev)}
      className="w-full px-2 py-0.5 select-none shrink-0 text-center cursor-pointer transition-all active:opacity-80"
      title="Tocca per leggere la citazione completa"
    >
      <p
        className={`text-[12px] text-gray-600 italic font-medium leading-snug transition-all ${
          isExpanded ? '' : 'line-clamp-2'
        }`}
      >
        "{quote.text}"
      </p>
      {quote.author && (
        <p className="text-[10px] text-gray-400 font-semibold tracking-wide mt-0.5">
          — {quote.author}
        </p>
      )}
    </div>
  );
};

export default MobileQuoteCard;
