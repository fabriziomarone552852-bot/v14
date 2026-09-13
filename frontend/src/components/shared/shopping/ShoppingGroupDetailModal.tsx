// src/components/shared/shopping/ShoppingGroupDetailModal.tsx
import React from 'react';
import type { ShoppingGroupSummary, ShoppingListSummary } from '@/types/shopping';
import BaseModal from '@/components/shared/dialog/BaseModal';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import {
  UsersIcon,
  EditIcon,
  TrashIcon,
  ArchiveIcon,
} from '@/components/shared/utils/Icons';
import {
  useShoppingGroupDetailLogic,
  ShoppingGroupListsSection,
  ShoppingGroupMembersSection,
} from './group';

export interface ShoppingGroupDetailModalProps {
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

export const ShoppingGroupDetailModal: React.FC<ShoppingGroupDetailModalProps> = ({
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
    groupLists,
    filteredGroupLists,
    handleRoleChange,
    handleRemoveMember,
    handleDeleteConfirm,
  } = useShoppingGroupDetailLogic({
    isOpen,
    group,
    lists,
    onDeleteClick,
    onClose,
  });

  if (!isOpen || !group) return null;

  const canInvite = currentUserRole === 'owner' || currentUserRole === 'admin';
  const isOwner = currentUserRole === 'owner';
  const isArchived = Boolean(group.isArchived || group.archivedAt);
  const groupIcon = group.icon?.trim() || '👥';

  const headerActions = (
    <div className="flex items-center gap-1">
      {isOwner && (
        <>
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
            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title={isArchived ? 'Ripristina Gruppo' : 'Archivia Gruppo'}
          >
            <ArchiveIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEditClick?.(group);
            }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Modifica Gruppo"
          >
            <EditIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Elimina Gruppo"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );

  const sidePanel = (
    <ShoppingGroupListsSection
      groupId={group.id}
      groupListsCount={groupLists.length}
      openListsCount={groupLists.filter((l) => !l.isCompleted).length}
      completedListsCount={groupLists.filter((l) => l.isCompleted).length}
      filteredGroupLists={filteredGroupLists}
      filterListStatus={filterListStatus}
      setFilterListStatus={setFilterListStatus}
      onSelectList={onSelectList}
      onCreateListInGroup={onCreateListInGroup}
      onClose={onClose}
    />
  );

  return (
    <>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Elimina Gruppo Spesa"
        message={`Sei sicuro di voler eliminare il gruppo "${group.name}"? Tutte le liste collegate resteranno o verranno dissociate.`}
        confirmText="Elimina"
        isDestructive={true}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <span className="flex items-center gap-2 text-base font-bold text-gray-800">
            <UsersIcon className="w-5 h-5 text-blue-600" />
            <span>Dettaglio Gruppo</span>
          </span>
        }
        headerActions={headerActions}
        sidePanel={sidePanel}
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-4">
          {/* Info Principali Gruppo */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 min-w-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-blue-200 bg-blue-100 text-blue-700 text-xl font-extrabold shrink-0 shadow-2xs">
              {groupIcon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-gray-900 truncate" title={group.name}>{group.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {group.description || 'Nessuna descrizione per questo gruppo.'}
              </p>
            </div>
          </div>

          {memberError && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 font-medium">
              {memberError}
            </div>
          )}

          {/* Sezione Membri e Collaboratori */}
          <ShoppingGroupMembersSection
            group={group}
            members={members}
            isLoadingMembers={isLoadingMembers}
            isOwner={isOwner}
            canInvite={canInvite}
            onOpenInvite={onOpenInvite}
            onRoleChange={handleRoleChange}
            onRemoveMember={handleRemoveMember}
          />
        </div>
      </BaseModal>
    </>
  );
};

export default ShoppingGroupDetailModal;
