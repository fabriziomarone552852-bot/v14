import React from 'react';
import { EmptyState } from '@/components/shared/utils/EmptyState';

interface Quote {
  quote_text: string;
  series_title: string;
  season_number?: number;
  episode_number?: number;
}

interface DailyQuoteWidgetProps {
  myQuotes: Quote[] | undefined;
  isQuoteExpanded: boolean;
  setIsQuoteExpanded: (expanded: boolean) => void;
}

export const DailyQuoteWidget: React.FC<DailyQuoteWidgetProps> = ({ myQuotes, isQuoteExpanded, setIsQuoteExpanded }) => {

  const todayDateStr = new Date().toISOString().split('T')[0];
  const dateHash = todayDateStr.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const dailyQuote = myQuotes && myQuotes.length > 0 ? myQuotes[dateHash % myQuotes.length] : null;

  return (
    <div className={`relative mt-2 mb-4 mx-2 drop-shadow-sm transition-all duration-500 z-50 cursor-pointer ${isQuoteExpanded ? 'h-[250px]' : 'h-[130px]'}`}>
      <svg className="absolute -top-3 right-4 w-8 h-8 text-gray-200 pointer-events-none z-20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>

      <div 
        onClick={() => setIsQuoteExpanded(!isQuoteExpanded)}
        className={`bg-gray-50 border border-gray-200 rounded-2xl p-4 absolute top-0 left-0 right-0 h-full flex flex-col shadow-sm hover:shadow-xl transition-all duration-500 z-10 overflow-hidden`}
      >
        <style>
          {`
            .custom-quote-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-quote-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-quote-scrollbar::-webkit-scrollbar-thumb {
              background-color: #cbd5e1;
              border-radius: 10px;
            }
            .custom-quote-scrollbar::-webkit-scrollbar-button {
              display: none !important;
              width: 0px !important;
              height: 0px !important;
            }
          `}
        </style>
        <div className="relative flex-1 min-h-0 custom-quote-scrollbar transition-all duration-500 overflow-hidden flex items-center justify-center p-2">
          {dailyQuote ? (
            <div className="flex flex-col items-start text-left w-full h-full">
              <p className={`text-gray-600 italic text-sm font-medium relative w-full custom-quote-scrollbar pr-2 break-words ${isQuoteExpanded ? 'flex-1 overflow-y-auto' : 'line-clamp-2 overflow-hidden'}`}>
                "{dailyQuote.quote_text}"
              </p>
              <div className="mt-auto shrink-0 w-full text-right transform translate-y-1">
                <span className="text-xs text-gray-500">
                  - {dailyQuote.series_title}
                  {dailyQuote.season_number && dailyQuote.episode_number && (
                    ` (S${String(dailyQuote.season_number).padStart(2, '0')}E${String(dailyQuote.episode_number).padStart(2, '0')})`
                  )}
                </span>
              </div>
            </div>
          ) : (
            <EmptyState message="Ancora nessuna citazione salvata" />
          )}
        </div>
        
        <div className={`absolute -bottom-2 left-6 w-4 h-4 bg-gray-50 border-b border-l border-gray-200 transform -rotate-45 z-0 transition-opacity duration-300 ${isQuoteExpanded ? 'opacity-0' : 'opacity-100'}`}></div>
      </div>
    </div>
  );
};
