// src/components/archive/reviews/ReviewTableRow.tsx
import React from 'react';
import type { MonthReviewItem, YearReviewItem } from '@/hooks/useReviewArchiveData';

interface ReviewTableRowProps {
  item: MonthReviewItem | YearReviewItem;
  onSelect: (item: MonthReviewItem | YearReviewItem) => void;
}

export const ReviewTableRow: React.FC<ReviewTableRowProps> = ({ item, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(item)}
      className="grid grid-cols-[1fr_105px] sm:grid-cols-[1fr_160px_140px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-slate-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer group min-h-[44px]"
    >
      {/* 1. TITOLO REVISIONE */}
      <div className="flex items-center gap-2 min-w-0 pl-1">
        <span className="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
          {item.title}
        </span>
      </div>

      {/* 2. TAG ASSOCIATI (Nascosti su mobile, visibili da tablet/desktop) */}
      <div className="hidden sm:flex items-center gap-1.5 overflow-hidden">
        {item.tags.length > 0 ? (
          <div className="flex items-center gap-1 flex-wrap">
            {item.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80 truncate max-w-[75px]"
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="text-[10px] font-bold text-slate-400">
                +{item.tags.length - 2}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Nessun tag</span>
        )}
      </div>

      {/* 3. STATO COMPILAZIONE */}
      <div className="flex items-center justify-end pr-1 sm:pr-2">
        {item.isCompleted ? (
          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1 sm:gap-1.5 shadow-2xs whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Completata
          </span>
        ) : item.completedQuestionsCount > 0 ? (
          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center gap-1 sm:gap-1.5 shadow-2xs whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span className="hidden sm:inline">{item.completedQuestionsCount}/6 risposte</span>
            <span className="sm:hidden">{item.completedQuestionsCount}/6</span>
          </span>
        ) : (
          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wide rounded-md bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center gap-1 whitespace-nowrap">
            <span className="hidden sm:inline">Da compilare</span>
            <span className="sm:hidden">Da fare</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default ReviewTableRow;
