// src/mobile/components/modals/shopping/MobileShoppingItemModal.tsx
import React from 'react';
import MobileBaseModal from '../MobileBaseModal';
import type { ConfigOption, ShoppingListSummary, ShoppingProductOption, ShoppingSupplierOption } from '@/types/shopping';
import type { ItemFormState } from '@/components/shared/shopping/shoppingItems.utils';
import { ShoppingIcon, EditIcon } from '@/components/shared/utils/Icons';
import { MobileShoppingItemForm } from './item';

export interface MobileShoppingItemModalProps {
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  itemForm: ItemFormState;
  setItemForm: React.Dispatch<React.SetStateAction<ItemFormState>>;
  activeListId?: number | null;
  lists?: ShoppingListSummary[];
  unitOptions: ConfigOption[];
  products?: ShoppingProductOption[];
  brands?: ShoppingSupplierOption[];
  zIndexClass?: string;
}

export const MobileShoppingItemModal: React.FC<MobileShoppingItemModalProps> = ({
  mode,
  open,
  onClose,
  onSubmit,
  itemForm,
  setItemForm,
  activeListId,
  lists = [],
  unitOptions,
  products = [],
  brands = [],
  zIndexClass = 'z-[10010]',
}) => {
  if (!open) return null;

  const isCreate = mode === 'create';
  const hasActiveList = activeListId != null || Boolean(itemForm.shoppingListId);
  const disabled = isCreate ? !hasActiveList : false;

  const title = isCreate ? (
    <div className="flex items-center gap-2">
      <ShoppingIcon className="w-5 h-5 text-blue-600" />
      <span>Nuovo Articolo</span>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <EditIcon className="w-5 h-5 text-blue-600" />
      <span>Modifica Articolo</span>
    </div>
  );

  const confirmText = isCreate ? 'Aggiungi alla Lista' : 'Salva Modifiche';
  const formId = isCreate ? 'mobile-create-item-form' : 'mobile-edit-item-form';
  const isConfirmDisabled = disabled || !itemForm.productName.trim();

  return (
    <MobileBaseModal
      isOpen={open}
      onClose={onClose}
      zIndexClass={zIndexClass}
      title={title}
      formId={formId}
      confirmText={confirmText}
      cancelText="Annulla"
      isConfirmDisabled={isConfirmDisabled}
    >
      <MobileShoppingItemForm
        formId={formId}
        isCreate={isCreate}
        hasActiveList={hasActiveList}
        itemForm={itemForm}
        setItemForm={setItemForm}
        lists={lists}
        unitOptions={unitOptions}
        products={products}
        brands={brands}
        onSubmit={onSubmit}
      />
    </MobileBaseModal>
  );
};

export default MobileShoppingItemModal;
