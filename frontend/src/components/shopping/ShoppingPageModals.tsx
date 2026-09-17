// src/components/shopping/ShoppingPageModals.tsx
import React from 'react';
import type { UseModalResult } from '@/hooks/useModals';
import type {
  ShoppingGroupSummary,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingSupplierOption,
  ConfigOption,
  PendingGroupInvite,
  ShoppingGroupCreatePayload,
} from '@/types/shopping';
import type { ListFormState } from '@/components/shared/shopping/ShoppingListModal';
import ShoppingGroupDetailModal from '@/components/shared/shopping/ShoppingGroupDetailModal';
import ShoppingGroupCreateModal from '@/components/shared/shopping/ShoppingGroupCreateModal';
import ShoppingGroupInviteModal from '@/components/shared/shopping/ShoppingGroupInviteModal';
import { ShoppingListModal } from '@/components/shared/shopping/ShoppingListModal';
import ShoppingQuickPriceModal from '@/components/archive/shopping/ShoppingQuickPriceModal';

interface ShoppingPageModalsProps {
  groups: ShoppingGroupSummary[];
  lists: ShoppingListSummary[];
  products: ShoppingProductOption[];
  brands: ShoppingSupplierOption[];
  suppliers: ShoppingSupplierOption[];
  unitOptions: ConfigOption[];
  detailGroup: ShoppingGroupSummary | null;
  setDetailGroup: (group: ShoppingGroupSummary | null) => void;
  isGroupCreateOpen: boolean;
  setIsGroupCreateOpen: (open: boolean) => void;
  editingGroup: ShoppingGroupSummary | null;
  setEditingGroup: (group: ShoppingGroupSummary | null) => void;
  activeInviteGroup: ShoppingGroupSummary | null;
  setActiveInviteGroup: (group: ShoppingGroupSummary | null) => void;
  editListModal: UseModalResult<ShoppingListSummary>;
  listEditForm: ListFormState;
  setListEditForm: React.Dispatch<React.SetStateAction<ListFormState>>;
  quickPriceModal: UseModalResult<null>;
  groupMembersRefreshKey: number;
  handleCreateGroup: (data: ShoppingGroupCreatePayload) => Promise<unknown>;
  handleUpdateGroup: (data: ShoppingGroupCreatePayload) => Promise<unknown>;
  handleDeleteGroup: (group: ShoppingGroupSummary) => Promise<void>;
  handleArchiveGroup: (group: ShoppingGroupSummary) => Promise<void>;
  handleUnarchiveGroup: (group: ShoppingGroupSummary) => Promise<void>;
  handleInviteMembers: (invites: PendingGroupInvite[]) => Promise<void>;
  setActiveListId: (listId: number) => void;
  handleCreateListInGroupModal: (groupId: number) => void;
  handleSaveModalListSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const ShoppingPageModals: React.FC<ShoppingPageModalsProps> = ({
  groups,
  lists,
  products,
  brands,
  suppliers,
  unitOptions,
  detailGroup,
  setDetailGroup,
  isGroupCreateOpen,
  setIsGroupCreateOpen,
  editingGroup,
  setEditingGroup,
  activeInviteGroup,
  setActiveInviteGroup,
  editListModal,
  listEditForm,
  setListEditForm,
  quickPriceModal,
  groupMembersRefreshKey,
  handleCreateGroup,
  handleUpdateGroup,
  handleDeleteGroup,
  handleArchiveGroup,
  handleUnarchiveGroup,
  handleInviteMembers,
  setActiveListId,
  handleCreateListInGroupModal,
  handleSaveModalListSubmit,
}) => {
  return (
    <>
      {/* Modale Dettaglio Gruppo con SidePanel */}
      {detailGroup && (
        <ShoppingGroupDetailModal
          isOpen={Boolean(detailGroup)}
          onClose={() => setDetailGroup(null)}
          group={detailGroup}
          lists={lists}
          onEditClick={(group) => setEditingGroup(group)}
          onDeleteClick={handleDeleteGroup}
          onArchiveClick={handleArchiveGroup}
          onUnarchiveClick={handleUnarchiveGroup}
          onOpenInvite={(group) => setActiveInviteGroup(group)}
          onSelectList={(listId) => setActiveListId(listId)}
          onCreateListInGroup={handleCreateListInGroupModal}
          currentUserRole={detailGroup.userRole || undefined}
          refreshKey={groupMembersRefreshKey}
        />
      )}

      {/* Modale Creazione Gruppo */}
      <ShoppingGroupCreateModal
        isOpen={isGroupCreateOpen}
        onClose={() => setIsGroupCreateOpen(false)}
        onSubmit={async (data) => {
          await handleCreateGroup(data);
        }}
      />

      {/* Modale Modifica Gruppo */}
      {editingGroup && (
        <ShoppingGroupCreateModal
          isOpen={Boolean(editingGroup)}
          onClose={() => setEditingGroup(null)}
          onSubmit={async (data) => {
            await handleUpdateGroup(data);
          }}
          initialData={editingGroup}
          title="Modifica Gruppo Spesa"
          submitLabel="Salva Modifiche"
        />
      )}

      {/* Modale Invito Collaboratori */}
      {activeInviteGroup && (
        <ShoppingGroupInviteModal
          isOpen={Boolean(activeInviteGroup)}
          groupName={activeInviteGroup.name}
          currentUserRole={activeInviteGroup.userRole || undefined}
          onClose={() => setActiveInviteGroup(null)}
          onSubmit={handleInviteMembers}
        />
      )}

      {/* Modale Modifica/Creazione Lista */}
      {editListModal.isOpen && editListModal.data && (
        <ShoppingListModal
          title={editListModal.data.id === 0 ? 'Nuova Lista nel Gruppo' : 'Modifica Lista Spesa'}
          form={listEditForm}
          setForm={setListEditForm}
          groups={groups}
          isDefault={Boolean(editListModal.data.isDefault)}
          onClose={editListModal.close}
          onSubmit={handleSaveModalListSubmit}
          submitLabel={editListModal.data.id === 0 ? 'Crea Lista' : 'Salva Modifiche'}
        />
      )}

      {/* Modale Aggiunta Rapida Prezzi */}
      <ShoppingQuickPriceModal
        isOpen={quickPriceModal.isOpen}
        onClose={quickPriceModal.close}
        lists={lists}
        products={products}
        brands={brands}
        suppliers={suppliers}
        unitOptions={unitOptions}
      />
    </>
  );
};
