// src/components/archive/shopping/ShoppingGroupTableRow.tsx
import React from 'react';
import { UsersIcon, ArchiveIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';
import type { ShoppingGroupSummary, ShoppingListSummary } from '@/types/shopping';
import { getRoleBadgeClass } from '@/components/shared/shopping/shoppingUi';

interface ShoppingGroupTableRowProps {
  group: ShoppingGroupSummary;
  lists: ShoppingListSummary[];
  onSelectGroup: (group: ShoppingGroupSummary) => void;
}

export const ShoppingGroupTableRow: React.FC<ShoppingGroupTableRowProps> = ({
  group,
  lists,
  onSelectGroup,
}) => {
  const activeListsCount = lists.filter((l) => !l.isCompleted).length;
  const archivedListsCount = lists.filter((l) => l.isCompleted).length;
  const isArchived = Boolean(group.isArchived || group.archivedAt);
  const membersCount = group.members?.length || 1;

  return (
    <div
      onClick={() => onSelectGroup(group)}
      className="grid grid-cols-[1fr_60px_60px_70px] sm:grid-cols-[1fr_110px_100px_150px_70px_100px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 border-b border-slate-100 last:border-b-0 bg-white hover:bg-slate-50/90 transition-colors cursor-pointer group text-xs select-none"
    >
      {/* Colonna Gruppo */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pl-1">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-xs shrink-0">
          {group.icon?.trim() || '👥'}
        </div>
        <div className="min-w-0">
          <p className="font-semibold sm:font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors text-xs sm:text-sm">
            {group.name}
          </p>
          {group.description && (
            <p className="hidden sm:block text-[11px] text-slate-400 truncate max-w-xs">
              {group.description}
            </p>
          )}
        </div>
      </div>

      {/* Colonna Ruolo (Desktop) */}
      <div className="hidden sm:flex w-[110px] items-center">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold capitalize border ${getRoleBadgeClass(
            group.userRole || ''
          )}`}
        >
          {group.userRole || 'collaboratore'}
        </span>
      </div>

      {/* Colonna Membri */}
      <div className="w-[60px] sm:w-[100px] flex items-center justify-center sm:justify-start gap-1 text-slate-700 font-semibold text-xs">
        <UsersIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="hidden sm:inline">
          {membersCount} {membersCount === 1 ? 'membro' : 'membri'}
        </span>
        <span className="sm:hidden">{membersCount}</span>
      </div>

      {/* Colonna Liste Attive / Archiviate */}
      <div className="w-[60px] sm:w-[150px] flex items-center justify-center sm:justify-start gap-1 sm:gap-1.5">
        <span className="sm:hidden text-xs font-semibold text-slate-700">
          {activeListsCount}<span className="text-[10px] text-slate-400 font-normal">/{archivedListsCount}</span>
        </span>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
          {activeListsCount} attive
        </span>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
          {archivedListsCount} arch.
        </span>
      </div>

      {/* Colonna Totali (Desktop) */}
      <div className="hidden sm:flex w-[70px] justify-center items-center font-bold text-slate-800 text-xs">
        {lists.length}
      </div>

      {/* Colonna Stato */}
      <div className="w-[70px] sm:w-[100px] flex items-center justify-center">
        {isArchived ? (
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <ArchiveIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">Archiviato</span>
            <span className="sm:hidden">Arch.</span>
          </span>
        ) : activeListsCount === 0 ? (
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="hidden sm:inline">Senza liste</span>
            <span className="sm:hidden">Vuoto</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>Attivo</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default ShoppingGroupTableRow;

