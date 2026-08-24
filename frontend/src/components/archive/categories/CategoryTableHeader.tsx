// src/components/categories/CategoryTableHeader.tsx
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
  label: string;
  className?: string;
}

const columns: ColumnDef[] = [
  {
    field: 'name',
    label: 'Categoria',
    className: 'flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors',
  },
  {
    field: 'color',
    label: 'Colore',
    className: 'flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors',
  },
  {
    field: 'genre',
    label: 'Tipo',
    className: 'flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors',
  },
];

export const CategoryTableHeader: React.FC<CategoryTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
}) => {
  return (
    <div className="grid grid-cols-[1fr_100px_140px] items-center gap-3 px-4 py-2.5 border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none shrink-0">
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
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 shrink-0 ${
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
