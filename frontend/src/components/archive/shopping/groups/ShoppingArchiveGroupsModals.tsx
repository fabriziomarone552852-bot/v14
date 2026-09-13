// src/components/archive/shopping/groups/ShoppingArchiveGroupsModals.tsx
import React from 'react';
import type {
  ShoppingGroupSummary,
  ShoppingListSummary,
  PendingGroupInvite,
  ShoppingGroupCreatePayload,
} from '@/types/shopping';
import type { ShoppingGroupFilterState } from '../ShoppingGroupFilterModal';
import { ShoppingGroupFilterModal } from '../ShoppingGroupFilterModal';
import ShoppingGroupDetailModal from '@/components/shared/shopping/ShoppingGroupDetailModal';
import ShoppingGroupCreateModal from '@/components/shared/shopping/ShoppingGroupCreateModal';
import ShoppingGroupInviteModal from '@/components/shared/shopping/ShoppingGroupInviteModal';
import MobileShoppingGroupDetailModal from '@/mobile/components/modals/shopping/MobileShoppingGroupDetailModal';
import MobileShoppingGroupCreateModal from '@/mobile/components/modals/shopping/MobileShoppingGroupCreateModal';
import MobileShoppingGroupInviteModal from '@/mobile/components/modals/shopping/MobileShoppingGroupInviteModal';

interface ShoppingArchiveGroupsModalsProps {
  isMobile: boolean;
  lists: ShoppingListSummary[];
  isFilterModalOpen: boolean;
  onCloseFilterModal: () => void;
  filterState: ShoppingGroupFilterState;
  onFilterChange: (filters: ShoppingGroupFilterState) => void;
  onResetFilters: () => void;
  onPageReset: () => void;
  allKnownMembers: string[];
  hasActiveFilters: boolean;
  selectedGroupForDetail: ShoppingGroupSummary | null;
  onCloseDetail: () => void;
  onDeleteGroup: (group: ShoppingGroupSummary) => void;
  onToggleArchive: (group: ShoppingGroupSummary) => void;
  onEditClickFromDetail: (group: ShoppingGroupSummary) => void;
  onOpenInvite: (group: ShoppingGroupSummary) => void;
  onSelectList: (listId: number) => void;
  onCreateListInGroup: (groupId: number) => void;
  selectedGroupForEdit: ShoppingGroupSummary | null;
  onCloseEdit: () => void;
  onUpdateGroup: (groupId: number, data: ShoppingGroupCreatePayload) => Promise<void>;
  selectedGroupForInvite: ShoppingGroupSummary | null;
  onCloseInvite: () => void;
  onInviteMembers: (groupId: number, invites: PendingGroupInvite[]) => Promise<void>;
}

export const ShoppingArchiveGroupsModals: React.FC<ShoppingArchiveGroupsModalsProps> = ({
  isMobile,
  lists,
  isFilterModalOpen,
  onCloseFilterModal,
  filterState,
  onFilterChange,
  onResetFilters,
  onPageReset,
  allKnownMembers,
  hasActiveFilters,
  selectedGroupForDetail,
  onCloseDetail,
  onDeleteGroup,
  onToggleArchive,
  onEditClickFromDetail,
  onOpenInvite,
  onSelectList,
  onCreateListInGroup,
  selectedGroupForEdit,
  onCloseEdit,
  onUpdateGroup,
  selectedGroupForInvite,
  onCloseInvite,
  onInviteMembers,
}) => {
  return (
    <>
      {/* 1. Modale Filtri Gruppi */}
      <ShoppingGroupFilterModal
        isOpen={isFilterModalOpen}
        onClose={onCloseFilterModal}
        filters={filterState}
        onFilterChange={(newF) => {
          onFilterChange(newF);
          onPageReset();
        }}
        onReset={() => {
          onResetFilters();
          onPageReset();
        }}
        allKnownMembers={allKnownMembers}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 2. Modale Dettagli Gruppo */}
      {selectedGroupForDetail && (
        isMobile ? (
          <MobileShoppingGroupDetailModal
            group={selectedGroupForDetail}
            lists={lists}
            isOpen={true}
            onClose={onCloseDetail}
            onDeleteClick={(g) => {
              onCloseDetail();
              onDeleteGroup(g);
            }}
            onArchiveClick={(g) => {
              onCloseDetail();
              onToggleArchive(g);
            }}
            onUnarchiveClick={(g) => {
              onCloseDetail();
              onToggleArchive(g);
            }}
            onEditClick={(g) => {
              onCloseDetail();
              onEditClickFromDetail(g);
            }}
            onOpenInvite={(g) => {
              onOpenInvite(g);
            }}
            onSelectList={(listId) => {
              onCloseDetail();
              onSelectList(listId);
            }}
            onCreateListInGroup={(groupId) => {
              onCloseDetail();
              onCreateListInGroup(groupId);
            }}
          />
        ) : (
          <ShoppingGroupDetailModal
            group={selectedGroupForDetail}
            lists={lists}
            isOpen={true}
            onClose={onCloseDetail}
            onDeleteClick={(g) => {
              onCloseDetail();
              onDeleteGroup(g);
            }}
            onArchiveClick={(g) => {
              onCloseDetail();
              onToggleArchive(g);
            }}
            onUnarchiveClick={(g) => {
              onCloseDetail();
              onToggleArchive(g);
            }}
            onEditClick={(g) => {
              onCloseDetail();
              onEditClickFromDetail(g);
            }}
            onOpenInvite={(g) => {
              onOpenInvite(g);
            }}
            onSelectList={(listId) => {
              onCloseDetail();
              onSelectList(listId);
            }}
            onCreateListInGroup={(groupId) => {
              onCloseDetail();
              onCreateListInGroup(groupId);
            }}
          />
        )
      )}

      {/* 3. Modale Modifica Gruppo */}
      {selectedGroupForEdit && (
        isMobile ? (
          <MobileShoppingGroupCreateModal
            isOpen={true}
            onClose={onCloseEdit}
            initialData={selectedGroupForEdit}
            title="Modifica Gruppo Spesa"
            submitLabel="Salva Modifiche"
            onSubmit={(data) => onUpdateGroup(selectedGroupForEdit.id, data)}
          />
        ) : (
          <ShoppingGroupCreateModal
            isOpen={true}
            onClose={onCloseEdit}
            initialData={selectedGroupForEdit}
            title="Modifica Gruppo Spesa"
            submitLabel="Salva Modifiche"
            onSubmit={(data) => onUpdateGroup(selectedGroupForEdit.id, data)}
          />
        )
      )}

      {/* 4. Modale Invita Membri */}
      {selectedGroupForInvite && (
        isMobile ? (
          <MobileShoppingGroupInviteModal
            isOpen={true}
            onClose={onCloseInvite}
            groupName={selectedGroupForInvite.name}
            currentUserRole={selectedGroupForInvite.userRole || undefined}
            onSubmit={(invites) => onInviteMembers(selectedGroupForInvite.id, invites)}
          />
        ) : (
          <ShoppingGroupInviteModal
            isOpen={true}
            onClose={onCloseInvite}
            groupName={selectedGroupForInvite.name}
            currentUserRole={selectedGroupForInvite.userRole || undefined}
            onSubmit={(invites) => onInviteMembers(selectedGroupForInvite.id, invites)}
          />
        )
      )}
    </>
  );
};
