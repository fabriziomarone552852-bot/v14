// src/components/archive/shopping/price/ShoppingEditBatchModal.tsx
import React from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { EditIcon } from '@/components/shared/utils/Icons';
import type {
  ConfigOption,
  ItemBatchRecord,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import {
  ShoppingPurchasedItemProductFields,
  ShoppingPurchasedItemPurchaseFields,
} from '@/components/shared/shopping/purchased';
import MobileBaseModal from '@/mobile/components/modals/MobileBaseModal';
import {
  MobilePurchasedItemProductSection,
  MobilePurchasedItemPurchaseSection,
} from '@/mobile/components/modals/shopping/purchased';
import { useShoppingEditBatchModalLogic } from './useShoppingEditBatchModalLogic';

export interface ShoppingEditBatchModalProps {
  isOpen: boolean;
  batch: ItemBatchRecord | null;
  onClose: () => void;
  suppliers?: ShoppingSupplierOption[];
  lists?: ShoppingListSummary[];
  brands?: ShoppingSupplierOption[];
  products?: ShoppingProductOption[];
  unitOptions?: ConfigOption[];
  currencyOptions?: ConfigOption[];
  onSave: (batchId: number, data: {
    purchasePrice: number;
    purchaseDate: string;
    quantityPurchased?: number;
    supplierId?: number | null;
    isOnSale: boolean;
    productName?: string;
    brandName?: string;
    brandId?: number | null;
    notes?: string;
    unitId?: number | null;
    shoppingListId?: number | null;
  }) => Promise<void>;
  onDelete?: (batchId: number) => Promise<void>;
}

export const ShoppingEditBatchModal: React.FC<ShoppingEditBatchModalProps> = ({
  isOpen,
  batch,
  onClose,
  suppliers = [],
  lists = [],
  brands = [],
  products = [],
  unitOptions = [],
  currencyOptions = [],
  onSave,
  onDelete,
}) => {
  const {
    isMobile,
    formData,
    setFormData,
    isSubmitting,
    isDatePickerOpen,
    setIsDatePickerOpen,
    error,
    effectiveSuppliers,
    effectiveBrands,
    effectiveLists,
    effectiveProducts,
    effectiveUnits,
    effectiveCurrencies,
    handleSubmit,
  } = useShoppingEditBatchModalLogic({
    isOpen,
    batch,
    onClose,
    suppliers,
    lists,
    brands,
    products,
    unitOptions,
    currencyOptions,
    onSave,
  });

  if (!isOpen || !batch) return null;

  if (isMobile) {
    return (
      <MobileBaseModal
        isOpen={isOpen}
        onClose={onClose}
        zIndexClass="z-[10020]"
        title={
          <div className="flex items-center gap-2">
            <EditIcon className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-gray-900">Modifica Rilevazione</span>
              {batch.productName && (
                <span className="block text-xs font-normal text-gray-500 truncate">
                  {batch.productName}
                </span>
              )}
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 pb-24">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <MobilePurchasedItemProductSection
            formData={formData}
            setFormData={setFormData}
            products={effectiveProducts}
            brands={effectiveBrands}
            lists={effectiveLists}
            unitOptions={effectiveUnits}
          />

          <MobilePurchasedItemPurchaseSection
            formData={formData}
            setFormData={setFormData}
            suppliers={effectiveSuppliers}
            currencyOptions={effectiveCurrencies}
          />

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 flex items-center gap-3 z-30">
            {onDelete && (
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm('Vuoi davvero eliminare questa registrazione?')) return;
                  await onDelete(batch.id);
                  onClose();
                }}
                disabled={isSubmitting}
                className="py-3 px-4 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-colors cursor-pointer shrink-0"
              >
                🗑️ Elimina
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-colors cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </MobileBaseModal>
    );
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      zIndexClass="z-[10020]"
      title={
        <div className="flex items-center gap-2">
          <EditIcon className="w-5 h-5 text-blue-600" />
          <span>Modifica Rilevazione Prezzo</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 max-w-xl mx-auto">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium">
            {error}
          </div>
        )}

        <ShoppingPurchasedItemProductFields
          formData={formData}
          setFormData={setFormData}
          products={effectiveProducts}
          brands={effectiveBrands}
          lists={effectiveLists}
          unitOptions={effectiveUnits}
        />

        <ShoppingPurchasedItemPurchaseFields
          formData={formData}
          setFormData={setFormData}
          suppliers={effectiveSuppliers}
          currencyOptions={effectiveCurrencies}
          isDatePickerOpen={isDatePickerOpen}
          setIsDatePickerOpen={setIsDatePickerOpen}
        />

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 mt-2">
          {onDelete ? (
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm('Vuoi davvero eliminare questa registrazione?')) return;
                await onDelete(batch.id);
                onClose();
              }}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>🗑️</span>
              <span>Elimina Registrazione</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-sm shadow-blue-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default ShoppingEditBatchModal;
