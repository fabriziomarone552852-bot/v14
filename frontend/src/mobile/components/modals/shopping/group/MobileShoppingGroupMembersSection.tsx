// src/mobile/components/modals/shopping/group/MobileShoppingGroupMembersSection.tsx
import React from 'react';
import { UsersIcon, PlusIcon, TrashIcon } from '@/components/shared/utils/Icons';
import ShoppingRoleSelect from '@/components/shared/shopping/ShoppingRoleSelect';
import { getRoleBadgeClass } from '@/components/shared/shopping/shoppingUi';
import type { ShoppingGroupSummary, ShoppingGroupMember } from '@/types/shopping';

export interface MobileShoppingGroupMembersSectionProps {
  group: ShoppingGroupSummary;
  members: ShoppingGroupMember[];
  isLoadingMembers: boolean;
  memberError: string | null;
  canInvite: boolean;
  isOwner: boolean;
  onOpenInvite?: (group: ShoppingGroupSummary) => void;
  onRoleChange: (userId: number, newRole: string) => void;
  onRemoveMember: (userId: number) => void;
}

export const MobileShoppingGroupMembersSection: React.FC<MobileShoppingGroupMembersSectionProps> = ({
  group,
  members,
  isLoadingMembers,
  memberError,
  canInvite,
  isOwner,
  onOpenInvite,
  onRoleChange,
  onRemoveMember,
}) => {
  return (
    <div className="flex-1 min-h-[160px] flex flex-col bg-white border border-gray-200 rounded-2xl p-3.5 shadow-2xs overflow-hidden">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <UsersIcon className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            {members.length === 1 ? '1 Collaboratore' : `${members.length} Collaboratori`}
          </h4>
        </div>

        {canInvite && onOpenInvite && (
          <button
            type="button"
            onClick={() => onOpenInvite(group)}
            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Aggiungi</span>
          </button>
        )}
      </div>

      {memberError && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 mb-2 shrink-0">
          {memberError}
        </div>
      )}

      {/* Elenco Membri */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-2 pr-0.5 pt-1">
        {isLoadingMembers ? (
          <p className="text-xs text-gray-400 italic py-4 text-center">Caricamento membri...</p>
        ) : members.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-4 text-center">Nessun membro nel gruppo.</p>
        ) : (
          members.map((member) => {
            const memberIsOwner = member.roleCode === 'owner';
            return (
              <div
                key={member.id}
                className="p-2.5 bg-gray-50 border border-gray-200/80 rounded-xl flex items-center justify-between gap-2 relative"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {member.username}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase ${getRoleBadgeClass(
                        member.roleCode
                      )}`}
                    >
                      {member.roleDisplayName || member.roleCode}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 block truncate mt-0.5">
                    {member.email}
                  </span>
                </div>

                {/* Azioni Membro (solo se Owner e non è se stesso) */}
                {isOwner && !memberIsOwner && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <ShoppingRoleSelect
                      value={member.roleCode}
                      onChange={(newRole) => onRoleChange(member.userId, newRole)}
                      compact
                    />
                    <button
                      type="button"
                      onClick={() => onRemoveMember(member.userId)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Rimuovi membro"
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
