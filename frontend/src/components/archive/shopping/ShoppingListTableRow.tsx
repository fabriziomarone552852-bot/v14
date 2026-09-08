// src/components/archive/shopping/ShoppingListTableRow.tsx
import React from 'react';
import {
  ShoppingIcon,
  CheckCircleIcon,
  ArchiveIcon,
  UsersIcon,
  LockIcon,
} from '@/components/shared/utils/Icons';
import type { ShoppingListSummary } from '@/types/shopping';

interface ShoppingListTableRowProps {
  list: ShoppingListSummary;
  onSelectList: (list: ShoppingListSummary) => void;
}

export const ShoppingListTableRow: React.FC<ShoppingListTableRowProps> = ({
  list,
  onSelectList,
}) => {
  const isGroup = Boolean(list.groupId || list.groupName);
  const items = list.items || [];
  const displayedItems = items.slice(0, 3);
  const remainingCount = items.length - displayedItems.length;

  return (
    <div
      onClick={() => onSelectList(list)}
      className="grid grid-cols-[1fr_80px_45px_70px] sm:grid-cols-[1fr_140px_1.4fr_80px_100px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-slate-100 last:border-b-0 bg-white hover:bg-slate-50/90 transition-colors cursor-pointer group text-xs select-none"
    >
      {/* Colonna Nome Lista */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pl-1">
        <div
          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border flex items-center justify-center text-xs shrink-0 ${
            isGroup
              ? 'bg-indigo-50 border-indigo-100 text-indigo-700'
              : 'bg-blue-50 border-blue-100 text-blue-700'
          }`}
        >
          <ShoppingIcon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold sm:font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors text-xs sm:text-sm">
            {list.name}
          </p>
          {list.description && (
            <p className="hidden sm:block text-[11px] text-slate-400 truncate max-w-xs">
              {list.description}
            </p>
          )}
        </div>
      </div>

      {/* Colonna Condivisione (Gruppo o Privata) */}
      <div className="w-[80px] sm:w-[140px]">
        {isGroup ? (
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 max-w-full">
            <UsersIcon className="w-3 h-3 shrink-0" />
            <span className="truncate">{list.groupName || 'Gruppo'}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
            <LockIcon className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Privata</span>
          </span>
        )}
      </div>

      {/* Colonna Prodotti Contenuti (Desktop) */}
      <div className="hidden sm:block min-w-0">
        {items.length === 0 ? (
          <span className="text-[11px] text-slate-400 italic">Nessun articolo</span>
        ) : (
          <div className="flex items-center gap-1 flex-wrap">
            {displayedItems.map((it) => (
              <span
                key={it.id}
                className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80 max-w-[110px] truncate"
              >
                {it.productName}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="inline-flex items-center px-1 py-0.5 rounded-md text-[9px] font-bold bg-slate-200 text-slate-600">
                +{remainingCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Colonna Articoli */}
      <div className="w-[45px] sm:w-[80px] text-center font-bold text-slate-800 text-xs">
        {list.totalItemsCount || items.length}
      </div>

      {/* Colonna Stato */}
      <div className="w-[70px] sm:w-[100px] flex items-center justify-center">
        {list.isCompleted ? (
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <ArchiveIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">Completata</span>
            <span className="sm:hidden">Compl.</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">Attiva</span>
            <span className="sm:hidden">Attiva</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default ShoppingListTableRow;

