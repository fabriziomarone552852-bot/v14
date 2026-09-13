// src/components/shared/shopping/group/ShoppingGroupMembersSection.tsx
import React from 'react';
import type { ShoppingGroupMember, ShoppingGroupSummary } from '@/types/shopping';
import { PlusIcon, TrashIcon } from '@/components/shared/utils/Icons';
import ShoppingRoleSelect from '../ShoppingRoleSelect';

export interface ShoppingGroupMembersSectionProps {
  group: ShoppingGroupSummary;
  members: ShoppingGroupMember[];
  isLoadingMembers: boolean;
  isOwner: boolean;
  canInvite: boolean;
  onOpenInvite?: (group: ShoppingGroupSummary) => void;
  onRoleChange: (userId: number, newRoleCode: string) => Promise<void>;
  onRemoveMember: (userId: number) => Promise<void>;
}

const roleBadgeColor: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-800 border-purple-200',
  admin: 'bg-blue-100 text-blue-800 border-blue-200',
  editor: 'bg-green-100 text-green-800 border-green-200',
  reader: 'bg-gray-100 text-gray-700 border-gray-200',
};

export const ShoppingGroupMembersSection: React.FC<ShoppingGroupMembersSectionProps> = ({
  group,
  members,
  isLoadingMembers,
  isOwner,
  canInvite,
  onOpenInvite,
  onRoleChange,
  onRemoveMember,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
          Membri ({members.length})
        </span>
        {canInvite && (
          <button
            type="button"
            onClick={() => onOpenInvite?.(group)}
            className="py-1 px-2.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1 cursor-pointer"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Aggiungi Membro</span>
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
        {isLoadingMembers ? (
          <p className="py-6 text-center text-xs text-gray-400">Caricamento membri...</p>
        ) : members.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400">Nessun membro trovato.</p>
        ) : (
          members.map((m) => {
            const badgeClass = roleBadgeColor[m.roleCode] || roleBadgeColor.reader;

            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {m.username}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${badgeClass}`}
                    >
                      {m.roleDisplayName || m.roleCode}
                    </span>
                  </div>
                  {m.email && (
                    <p className="truncate text-xs text-gray-400">{m.email}</p>
                  )}
                </div>

                {isOwner && m.roleCode !== 'owner' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-28">
                      <ShoppingRoleSelect
                        value={m.roleCode}
                        onChange={(newRole) => onRoleChange(m.userId, newRole)}
                        compact={true}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveMember(m.userId)}
                      className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition cursor-pointer"
                      title="Rimuovi dal gruppo"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
