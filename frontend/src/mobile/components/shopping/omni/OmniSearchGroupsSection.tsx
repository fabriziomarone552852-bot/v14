// src/mobile/components/shopping/omni/OmniSearchGroupsSection.tsx
import React from 'react';
import { UsersIcon } from '@/components/shared/utils/Icons';
import type { ShoppingGroupSummary, ShoppingListSummary } from '@/types/shopping';

export interface OmniSearchGroupsSectionProps {
  groups: ShoppingGroupSummary[];
  lists: ShoppingListSummary[];
  onOpenGroupDetail?: (group: ShoppingGroupSummary) => void;
  onClose: () => void;
}

export const OmniSearchGroupsSection: React.FC<OmniSearchGroupsSectionProps> = ({
  groups,
  lists,
  onOpenGroupDetail,
  onClose,
}) => {
  if (groups.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-1.5 px-1 mb-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
        <UsersIcon className="w-3.5 h-3.5" />
        <span>Gruppi Spesa ({groups.length})</span>
      </div>
      <div className="space-y-1.5">
        {groups.map((group) => {
          const groupLists = lists.filter((l) => l.groupId === group.id);
          return (
            <div
              key={group.id}
              onClick={() => {
                onOpenGroupDetail?.(group);
                onClose();
              }}
              className="p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all shadow-2xs cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className="text-xl shrink-0">{group.icon || '👥'}</span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-gray-800 truncate" title={group.name}>{group.name}</h4>
                  <span className="text-xs text-gray-400 truncate block">
                    {groupLists.length} {groupLists.length === 1 ? 'lista' : 'liste'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
