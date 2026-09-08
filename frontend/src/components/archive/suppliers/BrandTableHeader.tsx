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
  labelDesktop: string;
  labelMobile: string;
  className: string;
}

const columns: ColumnDef[] = [
  {
    field: 'name',
    labelDesktop: 'Marchio / Brand',
    labelMobile: 'Brand',
    className: 'flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors pl-1',
  },
  {
    field: 'purchases',
    labelDesktop: 'Acquisti Registrati',
    labelMobile: 'Acq.',
    className: 'w-[60px] sm:w-[160px] flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center',
  },
  {
    field: 'lastPurchase',
    labelDesktop: 'Ultimo Acquisto',
    labelMobile: 'Ultimo',
    className: 'w-[80px] sm:w-[180px] flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center',
  },
];

export const BrandTableHeader: React.FC<BrandTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
}) => {
  return (
    <div className="grid grid-cols-[1fr_60px_80px] sm:grid-cols-[1fr_160px_180px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-slate-200/80 bg-slate-50/75 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none shrink-0">
      {columns.map((col) => {
        const isActive = sortField === col.field;
        return (
          <div
            key={col.field}
            onClick={() => onSort(col.field)}
            className={col.className}
          >
            <span className="hidden sm:inline">{col.labelDesktop}</span>
            <span className="sm:hidden">{col.labelMobile}</span>
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
