// src/components/shared/shopping/ShoppingGroupsColumn.tsx
import React from 'react';
import type { ShoppingGroupSummary } from '@/types/shopping';
import {
  shoppingButtonPrimaryClass,
  shoppingCardClass,
} from './shoppingUi';

interface ShoppingGroupsColumnProps {
  groups: ShoppingGroupSummary[];
  loading?: boolean;
  selectedGroupId?: number | null;
  onSelectGroup?: (groupId: number | null) => void;
  onCreateGroup?: () => void;
  onOpenMembers?: (group: ShoppingGroupSummary) => void;
}

const ShoppingGroupsColumn: React.FC<ShoppingGroupsColumnProps> = ({
  groups,
  loading = false,
  selectedGroupId = null,
  onSelectGroup,
  onCreateGroup,
  onOpenMembers,
}) => {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex shrink-0 items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
          Gruppi spesa
        </h2>

        {onCreateGroup ? (
          <button
            type="button"
            onClick={onCreateGroup}
            className={`${shoppingButtonPrimaryClass} text-xs py-1 px-2.5`}
          >
            + Nuovo
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {loading ? (
          <p className="py-4 text-center text-xs text-gray-400">
            Caricamento gruppi...
          </p>
        ) : (
          <>
            <button
              type="button"
              className={`${shoppingCardClass} w-full p-3 text-left transition hover:border-blue-300 ${
                selectedGroupId === null
                  ? 'border-blue-400 ring-1 ring-blue-200 bg-blue-50/20'
                  : ''
              }`}
              onClick={() => onSelectGroup?.(null)}
            >
              <p className="text-sm font-semibold text-gray-700">Tutti i gruppi</p>
              <p className="text-[11px] text-gray-400">Visualizza tutte le liste prive e condivise</p>
            </button>

            {groups.map((group) => {
              const isSelected = selectedGroupId === group.id;

              return (
                <div
                  key={group.id}
                  className={`${shoppingCardClass} w-full p-3 text-left transition hover:border-blue-300 ${
                    isSelected ? 'border-blue-400 ring-1 ring-blue-200 bg-blue-50/20' : ''
                  }`}
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => onSelectGroup?.(isSelected ? null : group.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {group.name}
                        </p>

                        {group.description ? (
                          <p className="truncate text-xs text-gray-500">
                            {group.description}
                          </p>
                        ) : null}
                      </div>

                      <span className="shrink-0 text-[10px] font-bold text-gray-400">
                        #{group.id}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMembers?.(group);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      👥 Collaboratori
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default ShoppingGroupsColumn;