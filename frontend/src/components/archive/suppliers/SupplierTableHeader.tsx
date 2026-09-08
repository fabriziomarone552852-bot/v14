// src/components/archive/suppliers/SupplierTableHeader.tsx
import React, { useMemo } from 'react';
import type { SupplierSortField, SupplierSortDirection } from '@/hooks/useSupplierArchiveData';

interface SupplierTableHeaderProps {
  sortField: SupplierSortField;
  sortDirection: SupplierSortDirection;
  onSort: (field: SupplierSortField) => void;
  isSuperuser?: boolean;
}

interface ColumnDef {
  field: SupplierSortField;
  labelDesktop: string;
  labelMobile: string;
  className: string;
}

export const SupplierTableHeader: React.FC<SupplierTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
  isSuperuser = false,
}) => {
  const columns: ColumnDef[] = useMemo(() => {
    const baseCols: ColumnDef[] = [
      {
        field: 'name',
        labelDesktop: 'Negozio',
        labelMobile: 'Negozio',
        className: 'flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors pl-1',
      },
    ];

    if (isSuperuser) {
      baseCols.push({
        field: 'status',
        labelDesktop: 'Stato',
        labelMobile: 'Stato',
        className: 'w-[50px] sm:w-[140px] flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center',
      });
    }

    baseCols.push(
      {
        field: 'purchases',
        labelDesktop: 'Acquisti Registrati',
        labelMobile: 'Acq.',
        className: `${isSuperuser ? 'w-[50px]' : 'w-[60px]'} sm:w-[160px] flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center`,
      },
      {
        field: 'lastPurchase',
        labelDesktop: 'Ultimo Acquisto',
        labelMobile: 'Ultimo',
        className: `${isSuperuser ? 'w-[70px]' : 'w-[80px]'} sm:w-[180px] flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center`,
      }
    );

    return baseCols;
  }, [isSuperuser]);

  const gridClass = isSuperuser
    ? 'grid grid-cols-[1fr_50px_50px_70px] sm:grid-cols-[1fr_140px_160px_180px]'
    : 'grid grid-cols-[1fr_60px_80px] sm:grid-cols-[1fr_160px_180px]';

  return (
    <div className={`${gridClass} items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-slate-200/80 bg-slate-50/75 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none shrink-0`}>
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

export default SupplierTableHeader;
