// src/components/archive/suppliers/SupplierTableRow.tsx
import React from 'react';
import { CheckCircleIcon, ArchiveIcon, ShoppingIcon, ClockIcon } from '@/components/shared/utils/Icons';
import type { EnrichedSupplier } from '@/hooks/useSupplierArchiveData';
import { formatToItalianShortDate } from '@/utils/dateUtils';

interface SupplierTableRowProps {
  supplier: EnrichedSupplier;
  onSelect: (supplier: EnrichedSupplier) => void;
  isSuperuser?: boolean;
}

export const SupplierTableRow: React.FC<SupplierTableRowProps> = ({
  supplier,
  onSelect,
  isSuperuser = false,
}) => {
  const gridClass = isSuperuser
    ? 'grid grid-cols-[1fr_140px_160px_180px]'
    : 'grid grid-cols-[1fr_160px_180px]';

  return (
    <div
      onClick={() => onSelect(supplier)}
      className={`${gridClass} items-center gap-3 px-4 py-3 border-b border-slate-100 hover:bg-slate-50/90 transition-colors cursor-pointer group text-xs select-none`}
    >
      {/* Colonna Negozio / Fornitore */}
      <div className="min-w-0 pl-2">
        <p className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors text-sm capitalize">
          {supplier.nameNormalized || supplier.name}
        </p>
      </div>

      {/* Colonna Stato (Visibile solo per Superuser) */}
      {isSuperuser && (
        <div className="w-[140px] text-center">
          {supplier.isActive ? (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 text-[11px]">
              <CheckCircleIcon className="w-3 h-3" />
              <span>Attivo</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 text-[11px]">
              <ArchiveIcon className="w-3 h-3" />
              <span>Inattivo</span>
            </span>
          )}
        </div>
      )}

      {/* Colonna Acquisti Registrati */}
      <div className="w-[160px] text-center">
        {supplier.purchaseCount > 0 ? (
          <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 text-[11px]">
            <ShoppingIcon className="w-3 h-3 text-blue-500" />
            <span>
              {supplier.purchaseCount}{' '}
              {supplier.purchaseCount === 1 ? 'acquisto' : 'acquisti'}
            </span>
          </span>
        ) : (
          <span className="text-slate-300 font-bold text-xs">—</span>
        )}
      </div>

      {/* Colonna Ultimo Acquisto */}
      <div className="w-[180px] text-center">
        {supplier.lastPurchaseDate ? (
          <div className="inline-flex items-center gap-1 font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200 text-[11px]">
            <ClockIcon className="w-3 h-3 text-slate-400" />
            <span>{formatToItalianShortDate(supplier.lastPurchaseDate)}</span>
          </div>
        ) : (
          <span className="text-slate-300 font-bold text-xs">—</span>
        )}
      </div>
    </div>
  );
};

export default SupplierTableRow;

