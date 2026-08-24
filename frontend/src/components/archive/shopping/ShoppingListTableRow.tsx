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
      className="grid grid-cols-[1fr_160px_1.5fr_100px_130px] items-center gap-3 px-4 py-3 border-b border-slate-100 hover:bg-slate-50/90 transition-colors cursor-pointer group text-xs select-none"
    >
      {/* Colonna Nome Lista */}
      <div className="flex items-center gap-3 min-w-0 pl-2">
        <div
          className={`w-8 h-8 rounded-xl border flex items-center justify-center text-sm shrink-0 ${
            isGroup
              ? 'bg-indigo-50 border-indigo-100 text-indigo-700'
              : 'bg-blue-50 border-blue-100 text-blue-700'
          }`}
        >
          <ShoppingIcon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
            {list.name}
          </p>
          {list.description && (
            <p className="text-[11px] text-slate-400 truncate max-w-xs">
              {list.description}
            </p>
          )}
        </div>
      </div>

      {/* Colonna Condivisione (Gruppo o Privata) */}
      <div className="w-[160px]">
        {isGroup ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
            <UsersIcon className="w-3 h-3" />
            <span className="truncate max-w-[120px]">{list.groupName || 'Gruppo'}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
            <LockIcon className="w-3 h-3 text-slate-400" />
            <span>Privata</span>
          </span>
        )}
      </div>

      {/* Colonna Prodotti Contenuti */}
      <div className="min-w-0">
        {items.length === 0 ? (
          <span className="text-[11px] text-slate-400 italic">Nessun articolo</span>
        ) : (
          <div className="flex items-center gap-1 flex-wrap">
            {displayedItems.map((it) => (
              <span
                key={it.id}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80 max-w-[120px] truncate"
              >
                {it.productName}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-600">
                +{remainingCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Colonna Articoli */}
      <div className="w-[100px] text-center font-extrabold text-slate-800">
        {list.totalItemsCount || items.length}
      </div>

      {/* Colonna Stato */}
      <div className="w-[130px] flex items-center justify-center">
        {list.isCompleted ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <ArchiveIcon className="w-3 h-3" />
            <span>Completata</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircleIcon className="w-3 h-3" />
            <span>Attiva</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default ShoppingListTableRow;
