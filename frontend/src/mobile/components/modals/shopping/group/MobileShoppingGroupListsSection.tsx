// src/mobile/components/modals/shopping/group/MobileShoppingGroupListsSection.tsx
import React from 'react';
import { ShoppingIcon } from '@/components/shared/utils/Icons';
import type { ShoppingGroupSummary, ShoppingListSummary } from '@/types/shopping';

export interface MobileShoppingGroupListsSectionProps {
  group: ShoppingGroupSummary;
  groupLists: ShoppingListSummary[];
  filterListStatus: 'all' | 'open' | 'completed';
  setFilterListStatus: (status: 'all' | 'open' | 'completed') => void;
  canInvite: boolean;
  onCreateListInGroup?: (groupId: number) => void;
  onSelectList?: (listId: number) => void;
  onClose: () => void;
}

export const MobileShoppingGroupListsSection: React.FC<MobileShoppingGroupListsSectionProps> = ({
  group,
  groupLists,
  filterListStatus,
  setFilterListStatus,
  canInvite,
  onCreateListInGroup,
  onSelectList,
  onClose,
}) => {
  const openListsCount = groupLists.filter((l) => !l.isCompleted).length;
  const completedListsCount = groupLists.filter((l) => l.isCompleted).length;

  const filteredGroupLists = groupLists.filter((l) => {
    if (filterListStatus === 'open') return !l.isCompleted;
    if (filterListStatus === 'completed') return l.isCompleted;
    return true;
  });

  return (
    <div className="flex-1 min-h-[160px] flex flex-col bg-white border border-gray-200 rounded-2xl p-3.5 shadow-2xs overflow-hidden">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingIcon className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            {groupLists.length === 1 ? '1 Lista nel gruppo' : `${groupLists.length} Liste nel gruppo`}
          </h4>
        </div>

        {canInvite && onCreateListInGroup && (
          <button
            type="button"
            onClick={() => onCreateListInGroup(group.id)}
            className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            + Nuova Lista
          </button>
        )}
      </div>

      {/* Filtro Stato Liste */}
      {groupLists.length > 0 && (
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl my-2 shrink-0">
          <button
            type="button"
            onClick={() => setFilterListStatus('all')}
            className={`flex-1 py-1 px-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              filterListStatus === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Tutte</span>
            <span
              className={`min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-extrabold ${
                filterListStatus === 'all'
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-gray-200/70 text-gray-600'
              }`}
            >
              {groupLists.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterListStatus('open')}
            className={`flex-1 py-1 px-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              filterListStatus === 'open'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Aperte</span>
            <span
              className={`min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-extrabold ${
                filterListStatus === 'open'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-200/70 text-gray-600'
              }`}
            >
              {openListsCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterListStatus('completed')}
            className={`flex-1 py-1 px-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              filterListStatus === 'completed'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Completate</span>
            <span
              className={`min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-extrabold ${
                filterListStatus === 'completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-200/70 text-gray-600'
              }`}
            >
              {completedListsCount}
            </span>
          </button>
        </div>
      )}

      {/* Elenco Liste */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-1.5 pr-0.5">
        {filteredGroupLists.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-4 text-center">
            Nessuna lista trovata per questo filtro.
          </p>
        ) : (
          filteredGroupLists.map((list) => {
            const isListEmpty =
              (list.openItemsCount ?? 0) === 0 && (list.purchasedItemsCount ?? 0) === 0;

            return (
              <div
                key={list.id}
                onClick={() => {
                  onSelectList?.(list.id);
                  onClose();
                }}
                className="p-3 bg-gray-50 hover:bg-blue-50/50 border border-gray-200/80 hover:border-blue-300 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer select-none active:scale-[0.99]"
              >
                <div className="min-w-0 flex-1 flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-900 truncate">{list.name}</span>
                  {list.isCompleted && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold shrink-0">
                      ✓
                    </span>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-[11px] text-gray-500 font-medium">
                    {isListEmpty
                      ? 'Vuota'
                      : `${list.openItemsCount} da comprare • ${list.purchasedItemsCount} presi`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
