// src/components/archive/shopping/ShoppingListTableHeader.tsx
import React from 'react';

export type ShoppingListSortField = 'name' | 'destination' | 'itemsCount' | 'status';
export type ShoppingListSortDirection = 'asc' | 'desc';

interface ShoppingListTableHeaderProps {
  sortField: ShoppingListSortField;
  sortDirection: ShoppingListSortDirection;
  onSort: (field: ShoppingListSortField) => void;
}

interface ColumnDef {
  field: ShoppingListSortField;
  label: string;
  className: string;
}

const columns: ColumnDef[] = [
  {
    field: 'name',
    label: 'Nome Lista & Dettagli',
    className: 'flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors pl-2',
  },
  {
    field: 'destination',
    label: 'Condivisione',
    className: 'w-[160px] flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors',
  },
];

export const ShoppingListTableHeader: React.FC<ShoppingListTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
}) => {
  return (
    <div className="grid grid-cols-[1fr_160px_1.5fr_100px_130px] items-center gap-3 px-4 py-2.5 border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none shrink-0">
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

      <div className="font-bold">Prodotti Contenuti</div>

      <div
        onClick={() => onSort('itemsCount')}
        className={`w-[100px] flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors text-center ${
          sortField === 'itemsCount' ? 'text-slate-900 font-extrabold' : ''
        }`}
      >
        <span>Articoli</span>
        {sortField === 'itemsCount' && (
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

      <div
        onClick={() => onSort('status')}
        className={`w-[130px] flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors text-center ${
          sortField === 'status' ? 'text-slate-900 font-extrabold' : ''
        }`}
      >
        <span>Stato</span>
        {sortField === 'status' && (
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
    </div>
  );
};

export default ShoppingListTableHeader;
