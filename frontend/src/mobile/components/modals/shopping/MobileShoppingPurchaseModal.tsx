// src/mobile/components/modals/shopping/MobileShoppingPurchaseModal.tsx
import React from 'react';
import type {
  ConfigOption,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import type { PurchaseFormState } from '@/components/shared/shopping/shoppingItems.utils';
import MobileBaseModal from '../MobileBaseModal';
import { ShoppingIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';
import { MobileShoppingPurchaseForm } from './purchase';

export interface MobileShoppingPurchaseModalProps {
  open: boolean;
  itemName: string;
  itemTotalQuantity?: number | null;
  unitCodeName?: string | null;
  purchaseForm: PurchaseFormState;
  setPurchaseForm: React.Dispatch<React.SetStateAction<PurchaseFormState>>;
  suppliers: ShoppingSupplierOption[];
  brands?: ShoppingSupplierOption[];
  products?: ShoppingProductOption[];
  currencyOptions: ConfigOption[];
  offerFlagOptions?: ConfigOption[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isAlreadyPurchased?: boolean;
  zIndexClass?: string;
}

export const MobileShoppingPurchaseModal: React.FC<MobileShoppingPurchaseModalProps> = ({
  open,
  itemName,
  itemTotalQuantity,
  unitCodeName,
  purchaseForm,
  setPurchaseForm,
  suppliers,
  brands = [],
  currencyOptions,
  onClose,
  onSubmit,
  isAlreadyPurchased = false,
  zIndexClass = 'z-[10010]',
}) => {
  if (!open) return null;

  const numericBought = Number(purchaseForm.quantity) || 0;

  return (
    <MobileBaseModal
      isOpen={open}
      onClose={onClose}
      zIndexClass={zIndexClass}
      title={
        <div className="flex items-center gap-2">
          {isAlreadyPurchased ? (
            <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <ShoppingIcon className="w-5 h-5 text-blue-600 shrink-0" />
          )}
          <div className="truncate">
            <span className="text-sm font-extrabold text-gray-900 block">
              {isAlreadyPurchased ? 'Modifica Prodotto Acquistato' : 'Registra Acquisto'}
            </span>
            <span className="text-xs font-normal text-gray-500 truncate block">
              {itemName || 'Prodotto'}
            </span>
          </div>
        </div>
      }
      formId="mobile-purchase-form"
      confirmText={isAlreadyPurchased ? 'Salva Modifiche' : 'Conferma Acquisto'}
      cancelText="Annulla"
      isConfirmDisabled={!purchaseForm.price.trim() || numericBought <= 0}
    >
      <MobileShoppingPurchaseForm
        itemTotalQuantity={itemTotalQuantity}
        unitCodeName={unitCodeName}
        purchaseForm={purchaseForm}
        setPurchaseForm={setPurchaseForm}
        suppliers={suppliers}
        brands={brands}
        currencyOptions={currencyOptions}
        onSubmit={onSubmit}
      />
    </MobileBaseModal>
  );
};

export default MobileShoppingPurchaseModal;
