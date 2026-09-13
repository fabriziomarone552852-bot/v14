// src/components/shared/shopping/group/ShoppingGroupListsSection.tsx
import React from 'react';
import type { ShoppingListSummary } from '@/types/shopping';
import { ShoppingIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';
import { AddButton } from '@/components/shared/utils/AddButton';
import type { ListFilterStatus } from './useShoppingGroupDetailLogic';

export interface ShoppingGroupListsSectionProps {
  groupId: number;
  groupListsCount: number;
  openListsCount: number;
  completedListsCount: number;
  filteredGroupLists: ShoppingListSummary[];
  filterListStatus: ListFilterStatus;
  setFilterListStatus: (status: ListFilterStatus) => void;
  onSelectList?: (listId: number) => void;
  onCreateListInGroup?: (groupId: number) => void;
  onClose: () => void;
}

export const ShoppingGroupListsSection: React.FC<ShoppingGroupListsSectionProps> = ({
  groupId,
  groupListsCount,
  openListsCount,
  completedListsCount,
  filteredGroupLists,
  filterListStatus,
  setFilterListStatus,
  onSelectList,
  onCreateListInGroup,
  onClose,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-200 flex flex-col h-full max-h-[85vh] w-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
          <ShoppingIcon className="w-4 h-4 text-blue-600" />
          <span>Liste del Gruppo</span>
        </h4>

        <AddButton
          iconOnly={true}
          onClick={() => {
            onClose();
            onCreateListInGroup?.(groupId);
          }}
          label="Nuova Lista nel Gruppo"
        />
      </div>

      {/* Switcher Filtro Stato Liste */}
      <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs mb-3">
        <button
          type="button"
          onClick={() => setFilterListStatus('all')}
          className={`flex-1 py-1 rounded-md font-medium transition cursor-pointer ${
            filterListStatus === 'all' ? 'bg-white text-blue-600 shadow-2xs' : 'text-gray-600'
          }`}
        >
          Tutte ({groupListsCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterListStatus('open')}
          className={`flex-1 py-1 rounded-md font-medium transition cursor-pointer ${
            filterListStatus === 'open' ? 'bg-white text-blue-600 shadow-2xs' : 'text-gray-600'
          }`}
        >
          Aperte ({openListsCount})
        </button>
        <button
          type="button"
          onClick={() => setFilterListStatus('completed')}
          className={`flex-1 py-1 rounded-md font-medium transition cursor-pointer ${
            filterListStatus === 'completed' ? 'bg-white text-blue-600 shadow-2xs' : 'text-gray-600'
          }`}
        >
          Completate ({completedListsCount})
        </button>
      </div>

      {/* Elenco Liste con click di selezione */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[220px]">
        {filteredGroupLists.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-400">
            Nessuna lista trovata per questo filtro.
          </p>
        ) : (
          filteredGroupLists.map((l) => (
            <div
              key={l.id}
              onClick={() => {
                onSelectList?.(l.id);
                onClose();
              }}
              className="p-3 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-blue-50/70 hover:border-blue-300 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-2 min-w-0">
                <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-900 truncate min-w-0 flex-1" title={l.name}>
                  {l.name}
                </p>
                {l.isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    <CheckCircleIcon className="w-3 h-3" />
                    Completata
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-100 shrink-0">
                    {l.openItemsCount ?? 0} da comprare
                  </span>
                )}
              </div>
              {l.description && (
                <p className="text-xs text-gray-400 truncate mt-1">{l.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
