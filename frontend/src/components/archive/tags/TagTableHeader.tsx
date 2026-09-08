// src/components/archive/tags/TagTableHeader.tsx
import React from 'react';
import type { TagSortField, TagSortDirection } from '@/hooks/useTagArchiveData';

interface TagTableHeaderProps {
  sortField?: TagSortField;
  sortDirection?: TagSortDirection;
  onSort?: (field: TagSortField) => void;
}

interface ColumnDef {
  field: TagSortField;
  labelDesktop: string;
  labelMobile: string;
  className: string;
}

const columns: ColumnDef[] = [
  {
    field: 'name',
    labelDesktop: 'Tag / Etichetta',
    labelMobile: 'Tag',
    className: 'flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors pl-1',
  },
  {
    field: 'totalUsage',
    labelDesktop: 'Totale',
    labelMobile: 'Tot.',
    className: 'w-12 sm:w-[110px] flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center',
  },
  {
    field: 'monthlyCount',
    labelDesktop: 'Review Mensili',
    labelMobile: 'Mens.',
    className: 'w-14 sm:w-[130px] flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center',
  },
  {
    field: 'yearlyCount',
    labelDesktop: 'Review Annuali',
    labelMobile: 'Ann.',
    className: 'w-14 sm:w-[130px] flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center',
  },
];

export const TagTableHeader: React.FC<TagTableHeaderProps> = ({
  sortField = 'name',
  sortDirection = 'asc',
  onSort,
}) => {
  return (
    <div className="grid grid-cols-[1fr_48px_56px_56px] sm:grid-cols-[1fr_110px_130px_130px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-slate-200/80 bg-slate-50/75 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none shrink-0">
      {columns.map((col) => {
        const isActive = sortField === col.field;
        return (
          <div
            key={col.field}
            onClick={() => onSort?.(col.field)}
            className={col.className}
          >
            <span className="hidden sm:inline">{col.labelDesktop}</span>
            <span className="sm:hidden">{col.labelMobile}</span>
            {isActive && onSort && (
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

export default TagTableHeader;
