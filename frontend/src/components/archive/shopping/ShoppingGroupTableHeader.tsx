// src/components/archive/shopping/ShoppingGroupTableHeader.tsx
import React from 'react';

export type ShoppingGroupSortField = 'name' | 'role' | 'members' | 'activeLists' | 'totalLists' | 'status';
export type ShoppingGroupSortDirection = 'asc' | 'desc';

interface ShoppingGroupTableHeaderProps {
  sortField: ShoppingGroupSortField;
  sortDirection: ShoppingGroupSortDirection;
  onSort: (field: ShoppingGroupSortField) => void;
}

const SortIcon: React.FC<{ direction: ShoppingGroupSortDirection }> = ({ direction }) => (
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

export const ShoppingGroupTableHeader: React.FC<ShoppingGroupTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
}) => {
  return (
    <div className="grid grid-cols-[1fr_60px_60px_70px] sm:grid-cols-[1fr_110px_100px_150px_70px_100px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-slate-200/80 bg-slate-50/75 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none shrink-0">
      {/* 1. Gruppo */}
      <div
        onClick={() => onSort('name')}
        className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors pl-1"
      >
        <span>Gruppo</span>
        {sortField === 'name' && <SortIcon direction={sortDirection} />}
      </div>

      {/* 2. Ruolo (desktop only) */}
      <div
        onClick={() => onSort('role')}
        className="hidden sm:flex w-[110px] items-center gap-1 cursor-pointer hover:text-slate-900 transition-colors"
      >
        <span>Ruolo</span>
        {sortField === 'role' && <SortIcon direction={sortDirection} />}
      </div>

      {/* 3. Membri */}
      <div
        onClick={() => onSort('members')}
        className="w-[60px] sm:w-[100px] flex items-center justify-center sm:justify-start gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center sm:text-left"
      >
        <span className="hidden sm:inline">Membri</span>
        <span className="sm:hidden">Memb.</span>
        {sortField === 'members' && <SortIcon direction={sortDirection} />}
      </div>

      {/* 4. Liste */}
      <div
        onClick={() => onSort('activeLists')}
        className="w-[60px] sm:w-[150px] flex items-center justify-center sm:justify-start gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center sm:text-left"
      >
        <span className="hidden sm:inline">Liste (Att./Arch.)</span>
        <span className="sm:hidden">Liste</span>
        {sortField === 'activeLists' && <SortIcon direction={sortDirection} />}
      </div>

      {/* 5. Totali (desktop only) */}
      <div
        onClick={() => onSort('totalLists')}
        className="hidden sm:flex w-[70px] items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center"
      >
        <span>Tot.</span>
        {sortField === 'totalLists' && <SortIcon direction={sortDirection} />}
      </div>

      {/* 6. Stato */}
      <div
        onClick={() => onSort('status')}
        className="w-[70px] sm:w-[100px] flex items-center justify-center gap-1 cursor-pointer hover:text-slate-900 transition-colors text-center"
      >
        <span>Stato</span>
        {sortField === 'status' && <SortIcon direction={sortDirection} />}
      </div>
    </div>
  );
};

export default ShoppingGroupTableHeader;

