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
      className="grid grid-cols-[1fr_140px_140px_180px_100px_130px] items-center gap-3 px-4 py-3 border-b border-slate-100 hover:bg-slate-50/90 transition-colors cursor-pointer group text-xs select-none"
    >
      {/* Colonna Gruppo */}
      <div className="flex items-center gap-3 min-w-0 pl-2">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-sm shrink-0">
          {group.icon?.trim() || '👥'}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
            {group.name}
          </p>
          {group.description && (
            <p className="text-[11px] text-slate-400 truncate max-w-xs">
              {group.description}
            </p>
          )}
        </div>
      </div>

      {/* Colonna Ruolo */}
      <div className="w-[140px]">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold capitalize border ${getRoleBadgeClass(
            group.userRole || ''
          )}`}
        >
          {group.userRole || 'collaboratore'}
        </span>
      </div>

      {/* Colonna Membri */}
      <div className="w-[140px] flex items-center gap-1.5 text-slate-700 font-semibold">
        <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
        <span>
          {membersCount} {membersCount === 1 ? 'membro' : 'membri'}
        </span>
      </div>

      {/* Colonna Liste Attive / Archiviate */}
      <div className="w-[180px] flex items-center gap-1.5">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
          {activeListsCount} attive
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
          {archivedListsCount} arch.
        </span>
      </div>

      {/* Colonna Totali */}
      <div className="w-[100px] text-center font-extrabold text-slate-800">
        {lists.length}
      </div>

      {/* Colonna Stato */}
      <div className="w-[130px] flex items-center justify-center">
        {isArchived ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <ArchiveIcon className="w-3 h-3" />
            <span>Archiviato</span>
          </span>
        ) : activeListsCount === 0 ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <span>Senza liste</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircleIcon className="w-3 h-3" />
            <span>Attivo</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default ShoppingGroupTableRow;
