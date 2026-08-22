// src/components/shared/shopping/ShoppingPersonalListsSection.tsx
import React from 'react';
import type { ShoppingListSummary } from '@/types/shopping';
import {
  LockIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
} from '@/components/shared/utils/Icons';
import { ShoppingListAccordionItem } from './ShoppingListAccordionItem';

export interface ShoppingPersonalListsSectionProps {
  lists: ShoppingListSummary[];
  isExpanded: boolean;
  onToggleExpanded: (e: React.MouseEvent) => void;
  activeListId: number | null;
  onSelectList: (id: number) => void;
  onOpenCreateModal: () => void;
}

export const ShoppingPersonalListsSection: React.FC<ShoppingPersonalListsSectionProps> = ({
  lists,
  isExpanded,
  onToggleExpanded,
  activeListId,
  onSelectList,
  onOpenCreateModal,
}) => {
  const openCount = lists.filter((l) => !l.isCompleted).length;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden shadow-2xs transition-all">
      {/* Header Personale */}
      <div
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between p-3 min-h-[62px] cursor-pointer bg-white hover:bg-gray-50 border-b border-gray-200/80 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border border-gray-200 bg-blue-50 text-blue-600 text-lg font-bold shadow-2xs">
            <LockIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-800">Private</p>
            <p className="truncate text-xs text-gray-400">Solo per te</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 border border-gray-200">
            {openCount} {openCount === 1 ? 'lista aperta' : 'liste aperte'}
          </span>
          
          <button
            type="button"
            onClick={onToggleExpanded}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            title={isExpanded ? 'Comprimi liste' : 'Espandi liste'}
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Accordion Liste Personali */}
      {isExpanded && (
        <div className="p-3 space-y-2 bg-gray-50/40">
          {lists.length === 0 ? (
            <p className="py-2 text-center text-xs text-gray-400 italic">
              Nessuna lista personale.
            </p>
          ) : (
            lists.map((list) => (
              <ShoppingListAccordionItem
                key={list.id}
                list={list}
                isActive={activeListId === list.id}
                onSelect={onSelectList}
              />
            ))
          )}

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="w-full py-2 px-3 text-xs font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50/60 rounded-xl border border-dashed border-gray-300 hover:border-blue-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Nuova Lista Personale</span>
          </button>
        </div>
      )}
    </div>
  );
};
