// src/components/shared/shopping/ShoppingGroupAccordionSection.tsx
import React from 'react';
import type { ShoppingGroupSummary, ShoppingListSummary } from '@/types/shopping';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
} from '@/components/shared/utils/Icons';
import { ShoppingListAccordionItem } from './ShoppingListAccordionItem';

export interface ShoppingGroupAccordionSectionProps {
  group: ShoppingGroupSummary;
  lists: ShoppingListSummary[];
  isExpanded: boolean;
  onToggleExpanded: (e: React.MouseEvent) => void;
  onOpenGroupDetail?: (group: ShoppingGroupSummary) => void;
  activeListId: number | null;
  onSelectList: (id: number) => void;
  onOpenCreateModal: (groupId: number) => void;
  avatarClass: string;
}

export const ShoppingGroupAccordionSection: React.FC<ShoppingGroupAccordionSectionProps> = ({
  group,
  lists,
  isExpanded,
  onToggleExpanded,
  onOpenGroupDetail,
  activeListId,
  onSelectList,
  onOpenCreateModal,
  avatarClass,
}) => {
  const openListsCount = lists.filter((l) => !l.isCompleted).length;
  const groupIcon = group.icon?.trim() || '👥';

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50 overflow-hidden shadow-2xs transition-all">
      {/* Header Gruppo */}
      <div
        onClick={() => onOpenGroupDetail?.(group)}
        className="w-full flex items-center justify-between p-3 min-h-[62px] cursor-pointer bg-white hover:bg-gray-50 border-b border-gray-200/80 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border text-base font-bold shadow-2xs ${avatarClass}`}
          >
            {groupIcon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-800">
              {group.name}
            </p>
            <p className="truncate text-xs text-gray-400">
              {group.description || 'Gruppo condiviso'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 border border-gray-200">
            {openListsCount} {openListsCount === 1 ? 'lista aperta' : 'liste aperte'}
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

      {/* Accordion Liste del Gruppo */}
      {isExpanded && (
        <div className="p-3 space-y-2 bg-gray-50/40">
          {lists.length === 0 ? (
            <p className="py-2 text-center text-xs text-gray-400 italic">
              Nessuna lista in questo gruppo.
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
            onClick={() => onOpenCreateModal(group.id)}
            className="w-full py-2 px-3 text-xs font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50/60 rounded-xl border border-dashed border-gray-300 hover:border-blue-400 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Nuova Lista nel Gruppo</span>
          </button>
        </div>
      )}
    </div>
  );
};
