// src/mobile/components/shopping/MobileShoppingModalsContainer.tsx
import React from 'react';
import type { useShoppingItemsColumn } from '@/components/shared/shopping/useShoppingItemsColumn';
import type { useShoppingGroupActions } from '@/hooks/shopping/useShoppingGroupActions';
import type { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import type {
  ConfigOption,
  ShoppingGroupSummary,
  ShoppingListItem,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import type { ListFormState } from '@/components/shared/shopping/ShoppingListModal';
import type { useModal } from '@/hooks/useModals';

// Modali Shopping
import MobileShoppingListPickerModal from './MobileShoppingListPickerModal';
import MobileShoppingOmniSearch from './MobileShoppingOmniSearch';
import MobileShoppingQuickPriceModal from '../modals/shopping/MobileShoppingQuickPriceModal';
import MobileShoppingItemsColumnModals from '../modals/shopping/MobileShoppingItemsColumnModals';
import MobileShoppingListModal from '../modals/shopping/MobileShoppingListModal';
import MobileShoppingGroupCreateModal from '../modals/shopping/MobileShoppingGroupCreateModal';
import MobileShoppingGroupDetailModal from '../modals/shopping/MobileShoppingGroupDetailModal';
import MobileShoppingGroupInviteModal from '../modals/shopping/MobileShoppingGroupInviteModal';

export interface MobileShoppingModalsContainerProps {
  isPickerModalOpen: boolean;
  setIsPickerModalOpen: (open: boolean) => void;
  clearSelection: () => void;
  lists: ShoppingListSummary[];
  groups: ShoppingGroupSummary[];
  activeListId: number | null;
  setActiveListId: (id: number | null) => void;
  groupActions: ReturnType<typeof useShoppingGroupActions>;
  handleOpenEditList: (list: ShoppingListSummary) => void;
  handleDeleteList: (list: ShoppingListSummary) => Promise<void>;
  handleToggleCompleteList: (list: ShoppingListSummary, isCompleted: boolean) => Promise<void>;
  handleOpenCreateGroupList: (groupId?: number) => void;
  isOmniSearchOpen: boolean;
  setIsOmniSearchOpen: (open: boolean) => void;
  products: ShoppingProductOption[];
  items: ShoppingListItem[];
  mutations: ReturnType<typeof useShoppingMutations>;
  quickPriceModal: ReturnType<typeof useModal<null>>;
  brands: ShoppingSupplierOption[];
  suppliers: ShoppingSupplierOption[];
  unitOptions: ConfigOption[];
  currencyOptions: ConfigOption[];
  offerFlagOptions: ConfigOption[];
  columnLogic: ReturnType<typeof useShoppingItemsColumn>;
  canEditItem: boolean;
  canEditPurchasedItem: boolean;
  canDeleteItem: boolean;
  editListModal: ReturnType<typeof useModal<ShoppingListSummary>>;
  listEditForm: ListFormState;
  setListEditForm: React.Dispatch<React.SetStateAction<ListFormState>>;
  handleSaveEditList: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const MobileShoppingModalsContainer: React.FC<MobileShoppingModalsContainerProps> = ({
  isPickerModalOpen,
  setIsPickerModalOpen,
  clearSelection,
  lists,
  groups,
  activeListId,
  setActiveListId,
  groupActions,
  handleOpenEditList,
  handleDeleteList,
  handleToggleCompleteList,
  handleOpenCreateGroupList,
  isOmniSearchOpen,
  setIsOmniSearchOpen,
  products,
  items,
  mutations,
  quickPriceModal,
  brands,
  suppliers,
  unitOptions,
  currencyOptions,
  offerFlagOptions,
  columnLogic,
  canEditItem,
  canEditPurchasedItem,
  canDeleteItem,
  editListModal,
  listEditForm,
  setListEditForm,
  handleSaveEditList,
}) => {
  return (
    <>
      {/* 1. SELETTORE GRUPPO & LISTA A TUTTO SCHERMO */}
      <MobileShoppingListPickerModal
        isOpen={isPickerModalOpen}
        onClose={() => {
          clearSelection();
          setIsPickerModalOpen(false);
        }}
        lists={lists}
        groups={groups}
        activeListId={activeListId}
        onSelectList={(id) => setActiveListId(id)}
        onOpenGroupDetail={(group) => groupActions.setDetailGroup(group)}
        onOpenListDetail={(list) => handleOpenEditList(list)}
        onDeleteList={handleDeleteList}
        onDeleteGroup={groupActions.handleDeleteGroup}
        onArchiveGroup={groupActions.handleArchiveGroup}
        onArchiveList={(list) => handleToggleCompleteList(list, true)}
      />

      {/* 2. OMNI-SEARCH VELOCE */}
      <MobileShoppingOmniSearch
        isOpen={isOmniSearchOpen}
        onClose={() => setIsOmniSearchOpen(false)}
        groups={groups}
        lists={lists}
        products={products}
        currentItems={items}
        activeListId={activeListId}
        onSelectList={(id) => setActiveListId(id)}
        onOpenGroupDetail={(group) => groupActions.setDetailGroup(group)}
        onQuickAddProduct={async (prodName) => {
          let targetListId = activeListId;
          if (!targetListId && lists.length > 0) {
            const defaultList = lists.find((l) => l.isDefault) || lists[0];
            targetListId = defaultList.id;
            setActiveListId(defaultList.id);
          }
          if (!targetListId) return;
          await mutations.createItem({
            shoppingListId: targetListId,
            productName: prodName,
          });
        }}
        onOpenQuickPrice={() => quickPriceModal.open(null)}
      />

      {/* 3. AGGIUNTA RAPIDA PREZZI A CATALOGO */}
      <MobileShoppingQuickPriceModal
        isOpen={quickPriceModal.isOpen}
        onClose={quickPriceModal.close}
        products={products}
        brands={brands}
        suppliers={suppliers}
        unitOptions={unitOptions}
      />

      {/* 4. MODALI ARTICOLI (Purchase, Detail, PurchasedDetail, Edit, Price History) */}
      <MobileShoppingItemsColumnModals
        detailModal={columnLogic.detailModal}
        purchasedDetailModal={columnLogic.purchasedDetailModal}
        purchasedEditModal={columnLogic.purchasedEditModal}
        editModal={columnLogic.editModal}
        purchaseModal={columnLogic.purchaseModal}
        isCreateOpen={columnLogic.isCreateOpen}
        historyModalItem={columnLogic.historyModalItem}
        itemForm={columnLogic.itemForm}
        setItemForm={columnLogic.setItemForm}
        editForm={columnLogic.editForm}
        setEditForm={columnLogic.setEditForm}
        purchaseForm={columnLogic.purchaseForm}
        setPurchaseForm={columnLogic.setPurchaseForm}
        activeListId={activeListId}
        lists={lists}
        unitOptions={unitOptions}
        products={products}
        brands={brands}
        suppliers={suppliers}
        currencyOptions={currencyOptions}
        offerFlagOptions={offerFlagOptions}
        handleCloseCreate={columnLogic.handleCloseCreate}
        handleCreate={columnLogic.handleCreate}
        handleCloseEdit={columnLogic.handleCloseEdit}
        handleEdit={columnLogic.handleEdit}
        handleClosePurchase={columnLogic.handleClosePurchase}
        handlePurchase={columnLogic.handlePurchase}
        handleOpenEdit={columnLogic.handleOpenEdit}
        handlePurchasedEdit={columnLogic.handlePurchasedEdit}
        handleDelete={columnLogic.handleDelete}
        setHistoryModalItem={columnLogic.setHistoryModalItem}
        canEditItem={canEditItem}
        canEditPurchasedItem={canEditPurchasedItem}
        canDeleteItem={canDeleteItem}
      />

      {/* 5. CREAZIONE / MODIFICA LISTA */}
      {editListModal.isOpen && editListModal.data && (
        <MobileShoppingListModal
          title={editListModal.data.id === 0 ? 'Nuova Lista Spesa' : 'Modifica Lista Spesa'}
          form={listEditForm}
          setForm={setListEditForm}
          groups={groups}
          isDefault={Boolean(editListModal.data.isDefault)}
          onClose={editListModal.close}
          onSubmit={handleSaveEditList}
          submitLabel={editListModal.data.id === 0 ? 'Crea Lista' : 'Salva Modifiche'}
          zIndexClass="z-[10010]"
        />
      )}

      {/* 6. CREAZIONE GRUPPO */}
      <MobileShoppingGroupCreateModal
        isOpen={groupActions.isGroupCreateOpen}
        onClose={() => groupActions.setIsGroupCreateOpen(false)}
        onSubmit={groupActions.handleCreateGroup}
      />

      {/* 7. MODIFICA GRUPPO */}
      {groupActions.editingGroup && (
        <MobileShoppingGroupCreateModal
          isOpen={Boolean(groupActions.editingGroup)}
          onClose={() => groupActions.setEditingGroup(null)}
          onSubmit={async (data) => {
            await groupActions.handleUpdateGroup(data);
            groupActions.setDetailGroup((prev) => (prev ? { ...prev, ...data } : null));
          }}
          initialData={groupActions.editingGroup}
          title="Modifica Gruppo Spesa"
          submitLabel="Salva Modifiche"
          zIndexClass="z-[10010]"
        />
      )}

      {/* 8. DETTAGLIO GRUPPO & MEMBRI */}
      {groupActions.detailGroup && (
        <MobileShoppingGroupDetailModal
          isOpen={Boolean(groupActions.detailGroup)}
          onClose={() => groupActions.setDetailGroup(null)}
          group={groupActions.detailGroup}
          lists={lists}
          onEditClick={(group) => groupActions.setEditingGroup(group)}
          onDeleteClick={groupActions.handleDeleteGroup}
          onArchiveClick={groupActions.handleArchiveGroup}
          onUnarchiveClick={groupActions.handleUnarchiveGroup}
          onOpenInvite={(group) => groupActions.setActiveInviteGroup(group)}
          onSelectList={(listId) => {
            setActiveListId(listId);
            groupActions.setDetailGroup(null);
          }}
          onCreateListInGroup={(groupId) => handleOpenCreateGroupList(groupId)}
          currentUserRole={groupActions.detailGroup.userRole || undefined}
          refreshKey={groupActions.groupMembersRefreshKey}
        />
      )}

      {/* 9. AGGIUNTA COLLABORATORI */}
      {groupActions.activeInviteGroup && (
        <MobileShoppingGroupInviteModal
          isOpen={Boolean(groupActions.activeInviteGroup)}
          groupName={groupActions.activeInviteGroup.name}
          currentUserRole={groupActions.activeInviteGroup.userRole || undefined}
          onClose={() => groupActions.setActiveInviteGroup(null)}
          onSubmit={groupActions.handleInviteMembers}
          zIndexClass="z-[10010]"
        />
      )}
    </>
  );
};
