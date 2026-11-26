// src/components/archive/shopping/products/ShoppingCatalogProductTableHeader.tsx
import React from 'react';
import type {
  ShoppingCatalogSortDirection,
  ShoppingCatalogSortField,
} from './useShoppingArchiveProductsLogic';

interface ShoppingCatalogProductTableHeaderProps {
  sortField: ShoppingCatalogSortField;
  sortDirection: ShoppingCatalogSortDirection;
  onSort: (field: ShoppingCatalogSortField) => void;
}

const SortIcon: React.FC<{ direction: ShoppingCatalogSortDirection }> = ({ direction }) => (
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

export const ShoppingCatalogProductTableHeader: React.FC<
  ShoppingCatalogProductTableHeaderProps
> = ({ sortField, sortDirection, onSort }) => {
  return (
    <div className="grid grid-cols-[1fr_92px_54px] sm:grid-cols-[1fr_230px_170px_100px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-slate-200/80 bg-slate-50/75 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none shrink-0">
      <div
        onClick={() => onSort('name')}
        className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors pl-1"
      >
        <span>Prodotto</span>
        {sortField === 'name' && <SortIcon direction={sortDirection} />}
      </div>

      <div
        onClick={() => onSort('brands')}
        className="hidden sm:flex w-[230px] items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors"
      >
        <span>Marche Collegate</span>
        {sortField === 'brands' && <SortIcon direction={sortDirection} />}
      </div>

      <div
        onClick={() => onSort('latestPrice')}
        className="w-[92px] sm:w-[170px] flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center"
      >
        <span className="hidden sm:inline">Ultimo Acquisto</span>
        <span className="sm:hidden">Ultimo</span>
        {sortField === 'latestPrice' && <SortIcon direction={sortDirection} />}
      </div>

      <div
        onClick={() => onSort('purchases')}
        className="w-[54px] sm:w-[100px] flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center"
      >
        <span className="hidden sm:inline">Acquisti</span>
        <span className="sm:hidden">Acq.</span>
        {sortField === 'purchases' && <SortIcon direction={sortDirection} />}
      </div>
    </div>
  );
};

export default ShoppingCatalogProductTableHeader;
