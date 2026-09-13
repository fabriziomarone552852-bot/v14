// src/components/shared/shopping/ShoppingPurchasedItemEditModal.tsx
import React from 'react';
import type {
  ConfigOption,
  ShoppingListItem,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import type { PurchasedItemEditFormData } from '@/mobile/components/modals/shopping/MobilePurchasedItemEditModal';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { EditIcon } from '@/components/shared/utils/Icons';
import {
  usePurchasedItemEditForm,
  ShoppingPurchasedItemProductFields,
  ShoppingPurchasedItemPurchaseFields,
} from './purchased';

export interface ShoppingPurchasedItemEditModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: PurchasedItemEditFormData) => Promise<void> | void;
  item: ShoppingListItem | null;
  lists?: ShoppingListSummary[];
  suppliers: ShoppingSupplierOption[];
  brands?: ShoppingSupplierOption[];
  products?: ShoppingProductOption[];
  unitOptions: ConfigOption[];
  currencyOptions: ConfigOption[];
}

export const ShoppingPurchasedItemEditModal: React.FC<ShoppingPurchasedItemEditModalProps> = ({
  open,
  onClose,
  onSubmit,
  item,
  lists = [],
  suppliers,
  brands = [],
  products = [],
  unitOptions,
  currencyOptions,
}) => {
  const {
    formData,
    setFormData,
    isDatePickerOpen,
    setIsDatePickerOpen,
    isSubmitting,
    handleSubmit,
  } = usePurchasedItemEditForm({
    open,
    item,
    onSubmit,
    onClose,
  });

  if (!open || !item) return null;

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-base font-bold text-gray-800">
          <EditIcon className="w-5 h-5 text-blue-600" />
          <span>Modifica Articolo Acquistato</span>
        </span>
      }
      maxWidthClass="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sezione 1: Proprietà Prodotto */}
        <ShoppingPurchasedItemProductFields
          formData={formData}
          setFormData={setFormData}
          lists={lists}
          products={products}
          brands={brands}
          unitOptions={unitOptions}
        />

        {/* Note Aggiuntive */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Note Prodotto (Opzionale)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Aggiungi una nota personale..."
            rows={2}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden resize-none transition"
          />
        </div>

        {/* Sezione 2: Dettagli Acquisto */}
        <ShoppingPurchasedItemPurchaseFields
          formData={formData}
          setFormData={setFormData}
          suppliers={suppliers}
          currencyOptions={currencyOptions}
          isDatePickerOpen={isDatePickerOpen}
          setIsDatePickerOpen={setIsDatePickerOpen}
        />

        {/* Footer con Pulsanti di Salvataggio */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.productName.trim()}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default ShoppingPurchasedItemEditModal;
