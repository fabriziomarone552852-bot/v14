// src/components/archive/shopping/ShoppingListTableHeader.tsx
import React from 'react';

export type ShoppingListSortField = 'name' | 'destination' | 'itemsCount' | 'status';
export type ShoppingListSortDirection = 'asc' | 'desc';

interface ShoppingListTableHeaderProps {
  sortField: ShoppingListSortField;
  sortDirection: ShoppingListSortDirection;
  onSort: (field: ShoppingListSortField) => void;
}

const SortIcon: React.FC<{ direction: ShoppingListSortDirection }> = ({ direction }) => (
  <svg
    className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-150 shrink-0 ${
      direction === 'desc' ? 'rotate-180' : ''
    }`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);

export const ShoppingListTableHeader: React.FC<ShoppingListTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
}) => {
  return (
    <div className="grid grid-cols-[1fr_80px_45px_70px] sm:grid-cols-[1fr_140px_1.4fr_80px_100px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-slate-200/80 bg-slate-50/75 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none shrink-0">
      {/* 1. Nome Lista */}
      <div
        onClick={() => onSort('name')}
        className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors pl-1"
      >
        <span>Lista</span>
        {sortField === 'name' && <SortIcon direction={sortDirection} />}
      </div>

      {/* 2. Condivisione */}
      <div
        onClick={() => onSort('destination')}
        className="w-[80px] sm:w-[140px] flex items-center gap-1 cursor-pointer hover:text-slate-900 transition-colors"
      >
        <span className="hidden sm:inline">Condivisione</span>
        <span className="sm:hidden">Cond.</span>
        {sortField === 'destination' && <SortIcon direction={sortDirection} />}
      </div>

      {/* 3. Prodotti Contenuti (desktop only) */}
      <div className="hidden sm:block font-bold">
        Prodotti Contenuti
      </div>

      {/* 4. Articoli */}
      <div
        onClick={() => onSort('itemsCount')}
        className={`w-[45px] sm:w-[80px] flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center ${
          sortField === 'itemsCount' ? 'text-slate-900 font-extrabold' : ''
        }`}
      >
        <span className="hidden sm:inline">Articoli</span>
        <span className="sm:hidden">Art.</span>
        {sortField === 'itemsCount' && <SortIcon direction={sortDirection} />}
      </div>

      {/* 5. Stato */}
      <div
        onClick={() => onSort('status')}
        className={`w-[70px] sm:w-[100px] flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center ${
          sortField === 'status' ? 'text-slate-900 font-extrabold' : ''
        }`}
      >
        <span>Stato</span>
        {sortField === 'status' && <SortIcon direction={sortDirection} />}
      </div>
    </div>
  );
};

export default ShoppingListTableHeader;

