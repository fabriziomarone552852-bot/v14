// src/components/archive/reviews/ReviewTableHeader.tsx
import React from 'react';

export const ReviewTableHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-[1fr_105px] sm:grid-cols-[1fr_160px_140px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-slate-200/80 bg-slate-50/75 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none shrink-0">
      {/* 1. TITOLO REVISIONE */}
      <div className="flex items-center gap-1.5 pl-1">
        <span className="hidden sm:inline">Revisione Periodica</span>
        <span className="sm:hidden">Periodo</span>
      </div>

      {/* 2. TAG */}
      <div className="hidden sm:block">
        <span>Tag Associati</span>
      </div>

      {/* 3. STATO COMPILAZIONE */}
      <div className="text-right pr-1 sm:pr-2">
        <span className="hidden sm:inline">Stato Review</span>
        <span className="sm:hidden">Stato</span>
      </div>
    </div>
  );
};

export default ReviewTableHeader;
