// src/mobile/components/modals/shopping/MobileShoppingItemsColumnModals.tsx
import React from 'react';
import type {
  ConfigOption,
  ShoppingListItem,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import type { ItemFormState, PurchaseFormState } from '@/components/shared/shopping/shoppingItems.utils';

import MobileShoppingItemModal from './MobileShoppingItemModal';
import MobileShoppingItemDetailModal from './MobileShoppingItemDetailModal';
import MobilePurchasedItemDetailModal from './MobilePurchasedItemDetailModal';
import MobilePurchasedItemEditModal, { type PurchasedItemEditFormData } from './MobilePurchasedItemEditModal';
import MobileShoppingPurchaseModal from './MobileShoppingPurchaseModal';
import ShoppingPriceHistoryModal from '@/components/shared/shopping/ShoppingPriceHistoryModal';

import { useModal } from '@/hooks/useModals';

interface MobileShoppingItemsColumnModalsProps {
  detailModal: ReturnType<typeof useModal<ShoppingListItem>>;
  purchasedDetailModal: ReturnType<typeof useModal<ShoppingListItem>>;
  purchasedEditModal: ReturnType<typeof useModal<ShoppingListItem>>;
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
  lists?: ShoppingListSummary[];
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
  handlePurchasedEdit: (formData: PurchasedItemEditFormData) => Promise<void> | void;
  handleDelete: (item: ShoppingListItem) => void;
  setHistoryModalItem: React.Dispatch<React.SetStateAction<ShoppingListItem | null>>;

  canEditItem: boolean;
  canEditPurchasedItem: boolean;
  canDeleteItem: boolean;
}

export const MobileShoppingItemsColumnModals: React.FC<MobileShoppingItemsColumnModalsProps> = ({
  detailModal,
  purchasedDetailModal,
  purchasedEditModal,
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
  lists = [],
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
  handlePurchasedEdit,
  handleDelete,
  setHistoryModalItem,
  canEditItem,
  canEditPurchasedItem,
  canDeleteItem,
}) => {
  return (
    <>
      {/* 1. Dettaglio Articolo da Comprare */}
      <MobileShoppingItemDetailModal
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
        item={detailModal.data}
        onEditClick={handleOpenEdit}
        onDeleteClick={handleDelete}
        canEdit={detailModal.data?.isPurchased ? canEditPurchasedItem : canEditItem}
        canDelete={canDeleteItem}
      />

      {/* 2. Dettaglio Articolo Acquistato (con tasto Modifica che apre MobilePurchasedItemEditModal) */}
      <MobilePurchasedItemDetailModal
        isOpen={purchasedDetailModal.isOpen}
        onClose={purchasedDetailModal.close}
        item={purchasedDetailModal.data}
        onEditPurchase={(item) => purchasedEditModal.open(item)}
        onDeleteClick={handleDelete}
        canEdit={canEditPurchasedItem}
        canDelete={canDeleteItem}
      />

      {/* 3. Nuovo Modale Modifica Unificata Articolo Acquistato (Prodotto + Prezzo/Acquisto) */}
      <MobilePurchasedItemEditModal
        open={purchasedEditModal.isOpen}
        onClose={purchasedEditModal.close}
        onSubmit={handlePurchasedEdit}
        item={purchasedEditModal.data}
        lists={lists}
        suppliers={suppliers}
        brands={brands}
        products={products}
        unitOptions={unitOptions}
        currencyOptions={currencyOptions}
      />

      {/* 4. Modale Creazione Articolo */}
      <MobileShoppingItemModal
        mode="create"
        open={isCreateOpen}
        onClose={handleCloseCreate}
        onSubmit={handleCreate}
        itemForm={itemForm}
        setItemForm={setItemForm}
        activeListId={activeListId}
        lists={lists}
        unitOptions={unitOptions}
        products={products}
        brands={brands}
      />

      {/* 5. Modale Modifica Articolo Non Acquistato */}
      <MobileShoppingItemModal
        mode="edit"
        open={editModal.isOpen}
        onClose={handleCloseEdit}
        onSubmit={handleEdit}
        itemForm={editForm}
        setItemForm={setEditForm}
        lists={lists}
        unitOptions={unitOptions}
        products={products}
        brands={brands}
      />

      {/* 6. Modale Registrazione Acquisto al check */}
      <MobileShoppingPurchaseModal
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
        isAlreadyPurchased={Boolean(purchaseModal.data?.isPurchased)}
      />

      {/* 7. Modale Storico Prezzi Separato */}
      {historyModalItem && (
        <ShoppingPriceHistoryModal
          isOpen={Boolean(historyModalItem)}
          itemId={historyModalItem.id}
          productName={historyModalItem.productName}
          onClose={() => setHistoryModalItem(null)}
        />
      )}
    </>
  );
};

export default MobileShoppingItemsColumnModals;
