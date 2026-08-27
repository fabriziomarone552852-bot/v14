// src/components/archive/suppliers/BrandTableHeader.tsx
import React from 'react';
import type { SupplierSortDirection } from '@/hooks/useSupplierArchiveData';
import type { BrandSortField } from '@/hooks/useBrandArchiveData';

interface BrandTableHeaderProps {
  sortField: BrandSortField;
  sortDirection: SupplierSortDirection;
  onSort: (field: BrandSortField) => void;
}

interface ColumnDef {
  field: BrandSortField;
  label: string;
  className: string;
}

const columns: ColumnDef[] = [
  {
    field: 'name',
    label: 'Marchio / Brand',
    className: 'flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors pl-2',
  },
  {
    field: 'purchases',
    label: 'Acquisti Registrati',
    className: 'w-[160px] flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors text-center',
  },
  {
    field: 'lastPurchase',
    label: 'Ultimo Acquisto',
    className: 'w-[180px] flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors text-center',
  },
];

export const BrandTableHeader: React.FC<BrandTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
}) => {
  return (
    <div className="grid grid-cols-[1fr_160px_180px] items-center gap-3 px-4 py-2.5 border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none shrink-0">
      {columns.map((col) => {
        const isActive = sortField === col.field;
        return (
          <div
            key={col.field}
            onClick={() => onSort(col.field)}
            className={col.className}
          >
            <span>{col.label}</span>
            {isActive && (
              <svg
                className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-150 shrink-0 ${
                  sortDirection === 'desc' ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BrandTableHeader;
