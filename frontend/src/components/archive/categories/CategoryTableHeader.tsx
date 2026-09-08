// src/components/archive/categories/CategoryTableHeader.tsx
import React from 'react';

export type CategorySortField = 'name' | 'color' | 'genre' | 'created';
export type CategorySortDirection = 'asc' | 'desc';

interface CategoryTableHeaderProps {
  sortField: CategorySortField;
  sortDirection: CategorySortDirection;
  onSort: (field: CategorySortField) => void;
}

interface ColumnDef {
  field: CategorySortField;
  labelDesktop: string;
  labelMobile: string;
  className?: string;
}

const columns: ColumnDef[] = [
  {
    field: 'name',
    labelDesktop: 'Categoria',
    labelMobile: 'Categoria',
    className: 'flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors pl-1',
  },
  {
    field: 'color',
    labelDesktop: 'Colore',
    labelMobile: 'Col.',
    className: 'w-7 sm:w-[100px] flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors',
  },
  {
    field: 'genre',
    labelDesktop: 'Tipo',
    labelMobile: 'Tipo',
    className: 'w-[85px] sm:w-[140px] flex items-center gap-1 cursor-pointer hover:text-slate-900 transition-colors',
  },
];

export const CategoryTableHeader: React.FC<CategoryTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
}) => {
  return (
    <div className="grid grid-cols-[1fr_28px_85px] sm:grid-cols-[1fr_100px_140px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-slate-200/80 bg-slate-50/75 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none shrink-0">
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

export default CategoryTableHeader;
