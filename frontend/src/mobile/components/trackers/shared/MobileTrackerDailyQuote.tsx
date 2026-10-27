// src/mobile/components/trackers/shared/MobileTrackerDailyQuote.tsx
import React, { useState } from 'react';

export interface MobileTrackerDailyQuoteProps {
  quoteText?: string | null;
  sourceTitle?: string | null;
  sourceDetail?: string | null;
  placeholderText?: string;
}

export const MobileTrackerDailyQuote: React.FC<MobileTrackerDailyQuoteProps> = ({
  quoteText,
  sourceTitle,
  sourceDetail,
  placeholderText = 'Aggiungi citazioni per vederle comparire qui',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      onClick={() => setIsExpanded((prev) => !prev)}
      className="w-full px-2 py-0.5 select-none shrink-0 text-center cursor-pointer transition-all active:opacity-80"
      title="Tocca per leggere la citazione completa"
    >
      {quoteText ? (
        <>
          <p
            className={`text-[12px] text-gray-600 italic font-medium leading-snug transition-all ${
              isExpanded ? '' : 'line-clamp-2'
            }`}
          >
            "{quoteText}"
          </p>
          <p className="text-[10px] text-gray-400 font-semibold tracking-wide mt-0.5">
            — {sourceTitle || 'Citazione'}
            {sourceDetail && ` ${sourceDetail}`}
          </p>
        </>
      ) : (
        <p className="text-[11px] text-gray-400 italic">
          "{placeholderText}"
        </p>
      )}
    </div>
  );
};

export default MobileTrackerDailyQuote;
