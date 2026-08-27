import React from 'react';
import type {
  ConfigOption,
  ShoppingListItem,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import type { ItemFormState, PurchaseFormState } from './shoppingItems.utils';

import ShoppingItemModal from './ShoppingItemModal';
import ShoppingItemDetailModal from './ShoppingItemDetailModal';
import ShoppingPurchaseModal from './ShoppingPurchaseModal';
import ShoppingPriceHistoryModal from './ShoppingPriceHistoryModal';

import { useModal } from '@/hooks/useModals';

interface ShoppingItemsColumnModalsProps {
  detailModal: ReturnType<typeof useModal<ShoppingListItem>>;
  editModal: ReturnType<typeof useModal<ShoppingListItem>>;
  purchaseModal: ReturnType<typeof useModal<ShoppingListItem>>;
  isCreateOpen: boolean;
  historyModalItem: ShoppingListItem | null;

  itemForm: ItemFormState;
  setItemForm: React.Dispatch<React.SetStateAction<ItemFormState>>;
  editForm: ItemFormState;
  setEditForm: React.Dispatch<React.SetStateAction<ItemFormState>>;
  purchaseForm: PurchaseFormState;
  setPurchaseForm: React.Dispatch<React.SetStateAction<PurchaseFormState>>;

  activeListId: number | null;
  unitOptions: ConfigOption[];
  products: ShoppingProductOption[];
  brands: ShoppingSupplierOption[];
  suppliers: ShoppingSupplierOption[];
  currencyOptions: ConfigOption[];
  offerFlagOptions: ConfigOption[];

  handleCloseCreate: () => void;
  handleCreate: (e: React.FormEvent<HTMLFormElement>) => void;
  handleCloseEdit: () => void;
  handleEdit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleClosePurchase: () => void;
  handlePurchase: (e: React.FormEvent<HTMLFormElement>) => void;
  handleOpenEdit: (item: ShoppingListItem) => void;
  handleDelete: (item: ShoppingListItem) => void;
  setHistoryModalItem: React.Dispatch<React.SetStateAction<ShoppingListItem | null>>;

  canEditItem: boolean;
  canEditPurchasedItem: boolean;
  canDeleteItem: boolean;
}

export function ShoppingItemsColumnModals({
  detailModal,
  editModal,
  purchaseModal,
  isCreateOpen,
  historyModalItem,
  itemForm,
  setItemForm,
  editForm,
  setEditForm,
  purchaseForm,
  setPurchaseForm,
  activeListId,
  unitOptions,
  products,
  brands,
  suppliers,
  currencyOptions,
  offerFlagOptions,
  handleCloseCreate,
  handleCreate,
  handleCloseEdit,
  handleEdit,
  handleClosePurchase,
  handlePurchase,
  handleOpenEdit,
  handleDelete,
  setHistoryModalItem,
  canEditItem,
  canEditPurchasedItem,
  canDeleteItem,
}: ShoppingItemsColumnModalsProps) {
  return (
    <>
      <ShoppingItemDetailModal
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
        item={detailModal.data}
        onEditClick={handleOpenEdit}
        onDeleteClick={handleDelete}
        canEdit={detailModal.data?.isPurchased ? canEditPurchasedItem : canEditItem}
        canDelete={canDeleteItem}
      />

      <ShoppingItemModal
        mode="create"
        open={isCreateOpen}
        onClose={handleCloseCreate}
        onSubmit={handleCreate}
        itemForm={itemForm}
        setItemForm={setItemForm}
        activeListId={activeListId}
        unitOptions={unitOptions}
        products={products}
        brands={brands}
      />

      <ShoppingItemModal
        mode="edit"
        open={editModal.isOpen}
        onClose={handleCloseEdit}
        onSubmit={handleEdit}
        itemForm={editForm}
        setItemForm={setEditForm}
        unitOptions={unitOptions}
        products={products}
        brands={brands}
      />

      <ShoppingPurchaseModal
        open={purchaseModal.isOpen}
        onClose={handleClosePurchase}
        onSubmit={handlePurchase}
        purchaseForm={purchaseForm}
        setPurchaseForm={setPurchaseForm}
        suppliers={suppliers}
        brands={brands}
        products={products}
        currencyOptions={currencyOptions}
        offerFlagOptions={offerFlagOptions}
        itemName={purchaseModal.data?.productName ?? ''}
        itemTotalQuantity={purchaseModal.data?.quantity ?? null}
        unitCodeName={purchaseModal.data?.unitCodeName ?? null}
      />

      {historyModalItem ? (
        <ShoppingPriceHistoryModal
          isOpen={Boolean(historyModalItem)}
          itemId={historyModalItem.id}
          productName={historyModalItem.productName}
          onClose={() => setHistoryModalItem(null)}
        />
      ) : null}
    </>
  );
}
