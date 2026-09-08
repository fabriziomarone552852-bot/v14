// src/components/archive/shopping/ShoppingPriceTableHeader.tsx
import React from 'react';

export type ShoppingProductSortField = 'product' | 'lowest' | 'avg' | 'latest';
export type ShoppingProductSortDirection = 'asc' | 'desc';

interface ShoppingPriceTableHeaderProps {
  sortField: ShoppingProductSortField;
  sortDirection: ShoppingProductSortDirection;
  onSort: (field: ShoppingProductSortField) => void;
}

const SortIcon: React.FC<{ direction: ShoppingProductSortDirection }> = ({ direction }) => (
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

export const ShoppingPriceTableHeader: React.FC<ShoppingPriceTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
}) => {
  return (
    <div className="grid grid-cols-[1fr_70px_65px_70px] sm:grid-cols-[1fr_160px_150px_170px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-slate-200/80 bg-slate-50/75 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none shrink-0">
      {/* 1. Prodotto */}
      <div
        onClick={() => onSort('product')}
        className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors pl-1"
      >
        <span>Prodotto</span>
        {sortField === 'product' && <SortIcon direction={sortDirection} />}
      </div>

      {/* 2. Prezzo Più Basso */}
      <div
        onClick={() => onSort('lowest')}
        className="w-[70px] sm:w-[160px] flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center"
      >
        <span className="hidden sm:inline">Prezzo Più Basso</span>
        <span className="sm:hidden">Min.</span>
        {sortField === 'lowest' && <SortIcon direction={sortDirection} />}
      </div>

      {/* 3. Prezzo Medio */}
      <div
        onClick={() => onSort('avg')}
        className="w-[65px] sm:w-[150px] flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center"
      >
        <span className="hidden sm:inline">Prezzo Medio</span>
        <span className="sm:hidden">Medio</span>
        {sortField === 'avg' && <SortIcon direction={sortDirection} />}
      </div>

      {/* 4. Prezzo Più Recente */}
      <div
        onClick={() => onSort('latest')}
        className="w-[70px] sm:w-[170px] flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center"
      >
        <span className="hidden sm:inline">Prezzo Più Recente</span>
        <span className="sm:hidden">Ultimo</span>
        {sortField === 'latest' && <SortIcon direction={sortDirection} />}
      </div>
    </div>
  );
};

export default ShoppingPriceTableHeader;

