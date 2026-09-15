// src/components/archive/shopping/ShoppingQuickPriceModal.tsx
import React, { useState } from 'react';
export * from './QuickPriceTypes';
export * from './InlineDropdownSelect';
export * from './QuickPriceRowItem';
export * from './QuickPriceTable';
export * from './quickprice';

import BaseModal from '@/components/shared/dialog/BaseModal';
import { TagIcon } from '@/components/shared/utils/Icons';
import type {
  ConfigOption,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import { QuickPriceTable } from './QuickPriceTable';
import { useQuickPriceModalLogic } from './quickprice';
import { ShoppingSupplierCreateModal } from '@/components/shared/shopping/supplier/ShoppingSupplierCreateModal';

export interface ShoppingQuickPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: ShoppingProductOption[];
  brands?: ShoppingSupplierOption[];
  suppliers?: ShoppingSupplierOption[];
  unitOptions?: ConfigOption[];
}

export const ShoppingQuickPriceModal: React.FC<ShoppingQuickPriceModalProps> = ({
  isOpen,
  onClose,
  products = [],
  brands = [],
  suppliers = [],
  unitOptions = [],
}) => {
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  const {
    rows,
    isSubmitting,
    openDatePickerRowId,
    setOpenDatePickerRowId,
    errorMessage,
    supplierDropdownOptions,
    unitDropdownOptions,
    handleAddRow,
    handleRemoveRow,
    updateRow,
    handleProductSelect,
    handleBrandSelect,
    handleKeyDownOnLastField,
    handleSubmit,
  } = useQuickPriceModalLogic({
    isOpen,
    suppliers,
    unitOptions,
    onClose,
  });

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-blue-600" />
            <span className="text-base font-bold text-gray-800">
              Inserimento Rapido Prezzi
            </span>
          </div>
        }
        maxWidthClass="max-w-5xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
              {errorMessage}
            </div>
          )}

          <QuickPriceTable
            rows={rows}
            products={products}
            brands={brands}
            supplierDropdownOptions={supplierDropdownOptions}
            unitDropdownOptions={unitDropdownOptions}
            openDatePickerRowId={openDatePickerRowId}
            onDatePickerToggle={setOpenDatePickerRowId}
            onAddRow={handleAddRow}
            onRemoveRow={handleRemoveRow}
            onUpdateRow={updateRow}
            onProductSelect={handleProductSelect}
            onBrandSelect={handleBrandSelect}
            onKeyDownOnLastField={handleKeyDownOnLastField}
            onOpenSupplierCreateModal={() => setIsSupplierModalOpen(true)}
          />

          {/* Pulsanti di Azione */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Salvataggio...' : 'Salva Rilevazioni'}
            </button>
          </div>
        </form>
      </BaseModal>

      <ShoppingSupplierCreateModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSelectSupplier={() => {}}
      />
    </>
  );
};

export default ShoppingQuickPriceModal;
