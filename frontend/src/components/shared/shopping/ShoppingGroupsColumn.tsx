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
  onEditGroup?: (group: ShoppingGroupSummary) => void;
  onDeleteGroup?: (group: ShoppingGroupSummary) => void;
  onInviteGroup?: (group: ShoppingGroupSummary) => void;
}

const ShoppingGroupsColumn: React.FC<ShoppingGroupsColumnProps> = ({
  groups,
  loading = false,
  selectedGroupId = null,
  onSelectGroup,
  onCreateGroup,
  onOpenMembers,
  onEditGroup,
  onDeleteGroup,
  onInviteGroup,
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
            {/* Voce "Tutti i gruppi" */}
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
              <p className="text-[11px] text-gray-400">
                Visualizza tutte le liste private e condivise
              </p>
            </button>

            {groups.map((group) => {
              const isSelected = selectedGroupId === group.id;

              return (
                <div
                  key={group.id}
                  className={`${shoppingCardClass} w-full overflow-hidden text-left transition hover:border-blue-300 ${
                    isSelected ? 'border-blue-400 ring-1 ring-blue-200 bg-blue-50/20' : ''
                  }`}
                >
                  {/* Header cliccabile per selezionare il gruppo */}
                  <div
                    className="cursor-pointer p-3"
                    onClick={() => onSelectGroup?.(isSelected ? null : group.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {group.name}
                        </p>

                        {group.description ? (
                          <p className="truncate text-xs text-gray-500 mt-0.5">
                            {group.description}
                          </p>
                        ) : null}
                      </div>

                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-400">
                        #{group.id}
                      </span>
                    </div>
                  </div>

                  {/* Barra azioni */}
                  <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/60 px-3 py-2">
                    {/* Azione principale: Collaboratori */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMembers?.(group);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 hover:text-blue-800 transition"
                      title="Gestisci collaboratori"
                    >
                      👥 Collaboratori
                    </button>

                    {/* Azioni secondarie: Invita / Modifica / Elimina */}
                    <div className="flex items-center gap-1">
                      {onInviteGroup ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onInviteGroup(group);
                          }}
                          className="rounded-lg p-1.5 text-[11px] text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition"
                          title="Invita collaboratore"
                        >
                          ✉️
                        </button>
                      ) : null}

                      {onEditGroup ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditGroup(group);
                          }}
                          className="rounded-lg p-1.5 text-[11px] text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                          title="Modifica gruppo"
                        >
                          ✏️
                        </button>
                      ) : null}

                      {onDeleteGroup ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteGroup(group);
                          }}
                          className="rounded-lg p-1.5 text-[11px] text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Elimina gruppo"
                        >
                          🗑️
                        </button>
                      ) : null}
                    </div>
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