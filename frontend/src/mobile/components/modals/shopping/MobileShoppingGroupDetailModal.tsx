// src/mobile/components/modals/shopping/MobileShoppingGroupDetailModal.tsx
import React from 'react';
import type { ShoppingGroupSummary, ShoppingListSummary } from '@/types/shopping';
import MobileBaseModal from '../MobileBaseModal';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import { EditIcon, TrashIcon, ArchiveIcon } from '@/components/shared/utils/Icons';
import { getRoleBadgeClass } from '@/components/shared/shopping/shoppingUi';
import {
  useMobileShoppingGroupDetailLogic,
  MobileShoppingGroupListsSection,
  MobileShoppingGroupMembersSection,
} from './group';

export interface MobileShoppingGroupDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: ShoppingGroupSummary | null;
  lists?: ShoppingListSummary[];
  onEditClick?: (group: ShoppingGroupSummary) => void;
  onDeleteClick?: (group: ShoppingGroupSummary) => void;
  onArchiveClick?: (group: ShoppingGroupSummary) => void;
  onUnarchiveClick?: (group: ShoppingGroupSummary) => void;
  onOpenInvite?: (group: ShoppingGroupSummary) => void;
  onSelectList?: (listId: number) => void;
  onCreateListInGroup?: (groupId: number) => void;
  currentUserRole?: string;
  refreshKey?: number;
}

export const MobileShoppingGroupDetailModal: React.FC<MobileShoppingGroupDetailModalProps> = ({
  isOpen,
  onClose,
  group,
  lists = [],
  onEditClick,
  onDeleteClick,
  onArchiveClick,
  onUnarchiveClick,
  onOpenInvite,
  onSelectList,
  onCreateListInGroup,
  currentUserRole = 'owner',
}) => {
  const {
    members,
    isLoadingMembers,
    memberError,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    filterListStatus,
    setFilterListStatus,
    handleRoleChange,
    handleRemoveMember,
    handleDeleteConfirm,
  } = useMobileShoppingGroupDetailLogic({
    isOpen,
    group,
    onDeleteClick,
    onClose,
  });

  if (!isOpen || !group) return null;

  const canInvite = currentUserRole === 'owner' || currentUserRole === 'admin';
  const isOwner = currentUserRole === 'owner';
  const isArchived = Boolean(group.isArchived || group.archivedAt);
  const groupLists = lists.filter((l) => l.groupId === group.id);

  const headerActions = isOwner ? (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => {
          if (isArchived) {
            onUnarchiveClick?.(group);
          } else {
            onArchiveClick?.(group);
          }
          onClose();
        }}
        className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
        title={isArchived ? 'Ripristina Gruppo' : 'Archivia Gruppo'}
      >
        <ArchiveIcon className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => onEditClick?.(group)}
        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
        title="Modifica Gruppo"
      >
        <EditIcon className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => setIsDeleteDialogOpen(true)}
        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        title="Elimina Gruppo"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  ) : null;

  return (
    <>
      <MobileBaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2">
            <span className="text-xl">{group.icon || '👥'}</span>
            <span className="truncate">{group.name}</span>
          </div>
        }
        headerActions={headerActions}
      >
        <div className="h-full flex flex-col gap-3 max-w-lg mx-auto overflow-hidden">
          <div className="shrink-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getRoleBadgeClass(
                  currentUserRole
                )}`}
              >
                Tuo Ruolo: {currentUserRole.toUpperCase()}
              </span>
              {isArchived && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Archiviato
                </span>
              )}
            </div>

            {group.description && (
              <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-xs text-gray-600">
                {group.description}
              </div>
            )}
          </div>

          <MobileShoppingGroupListsSection
            group={group}
            groupLists={groupLists}
            filterListStatus={filterListStatus}
            setFilterListStatus={setFilterListStatus}
            canInvite={canInvite}
            onCreateListInGroup={onCreateListInGroup}
            onSelectList={onSelectList}
            onClose={onClose}
          />

          <MobileShoppingGroupMembersSection
            group={group}
            members={members}
            isLoadingMembers={isLoadingMembers}
            memberError={memberError}
            canInvite={canInvite}
            isOwner={isOwner}
            onOpenInvite={onOpenInvite}
            onRoleChange={handleRoleChange}
            onRemoveMember={handleRemoveMember}
          />
        </div>
      </MobileBaseModal>

      {isDeleteDialogOpen && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          title="Elimina Gruppo Spesa"
          message={`Sei sicuro di voler eliminare definitivamente il gruppo "${group.name}" e tutte le sue liste? L'operazione non può essere annullata.`}
          confirmText="Elimina Definitivamente"
          cancelText="Annulla"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </>
  );
};

export default MobileShoppingGroupDetailModal;
