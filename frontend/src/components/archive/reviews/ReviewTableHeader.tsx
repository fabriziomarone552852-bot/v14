// src/components/reviews/ReviewTableHeader.tsx
import React from 'react';

export const ReviewTableHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-[1fr_200px_160px] items-center gap-3 px-4 py-2.5 border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none shrink-0">
      {/* 1. TITOLO REVISIONE */}
      <div className="flex items-center gap-1.5">
        <span>Revisione Periodica</span>
      </div>

      {/* 2. TAG */}
      <div>
        <span>Tag Associati</span>
      </div>

      {/* 3. STATO COMPILAZIONE */}
      <div className="text-right pr-2">
        <span>Stato Review</span>
      </div>
    </div>
  );
};

export default ReviewTableHeader;
