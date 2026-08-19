// src/components/tags/TagTableHeader.tsx
import React from 'react';

export const TagTableHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-[1.5fr_140px_160px_160px] items-center gap-3 px-6 py-3 bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 shrink-0">
      <div>Tag / Etichetta</div>
      <div className="text-center">Utilizzo Totale</div>
      <div className="text-center">Review Mensili</div>
      <div className="text-center">Review Annuali</div>
    </div>
  );
};

export default TagTableHeader;
