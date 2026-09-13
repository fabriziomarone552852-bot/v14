// src/mobile/components/shopping/omni/OmniSearchListsSection.tsx
import React from 'react';
import { ShoppingIcon } from '@/components/shared/utils/Icons';
import type { ShoppingListSummary } from '@/types/shopping';

export interface OmniSearchListsSectionProps {
  lists: ShoppingListSummary[];
  activeListId: number | null;
  onSelectList: (listId: number) => void;
  onClose: () => void;
}

export const OmniSearchListsSection: React.FC<OmniSearchListsSectionProps> = ({
  lists,
  activeListId,
  onSelectList,
  onClose,
}) => {
  if (lists.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 mb-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
        <ShoppingIcon className="w-3.5 h-3.5" />
        <span>Liste Spesa ({lists.length})</span>
      </div>
      <div className="space-y-1.5">
        {lists.map((list) => {
          const isCurrent = list.id === activeListId;
          return (
            <button
              key={list.id}
              type="button"
              onClick={() => {
                onSelectList(list.id);
                onClose();
              }}
              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                  : 'bg-white border-gray-200 hover:border-emerald-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs shrink-0">
                  📋
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-gray-800 truncate">{list.name}</h4>
                    {list.groupName && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 shrink-0">
                        {list.groupName}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {list.openItemsCount} da comprare • {list.purchasedItemsCount} presi
                  </span>
                </div>
              </div>
              {isCurrent && (
                <span className="text-xs font-bold text-emerald-600 px-2 py-0.5 bg-emerald-100 rounded-md shrink-0 ml-2">
                  Attiva
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
