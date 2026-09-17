import React from 'react';
import MobileBaseModal from '../MobileBaseModal';
import { TagIcon, TaskListIcon } from '@/components/shared/utils/Icons';
import { AddButton } from '@/components/shared/utils/AddButton';
import type {
  ConfigOption,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import {
  useMobileQuickPriceLogic,
  MobileQuickPriceItemCard,
  type QuickPriceItem,
} from './quickprice';

import { ShoppingListSelect } from '@/components/shared/shopping/ShoppingListSelect';

export type { QuickPriceItem };

export interface MobileShoppingQuickPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lists?: ShoppingListSummary[];
  products?: ShoppingProductOption[];
  brands?: ShoppingSupplierOption[];
  suppliers?: ShoppingSupplierOption[];
  unitOptions?: ConfigOption[];
  initialProductName?: string;
  zIndexClass?: string;
}

export const MobileShoppingQuickPriceModal: React.FC<MobileShoppingQuickPriceModalProps> = ({
  isOpen,
  onClose,
  lists = [],
  products = [],
  brands = [],
  suppliers = [],
  unitOptions = [],
  initialProductName = '',
  zIndexClass = 'z-[10010]',
}) => {
  const {
    items,
    selectedListId,
    setSelectedListId,
    validItems,
    isSubmitting,
    errorMessage,
    datePickerItemId,
    setDatePickerItemId,
    handleAddItem,
    handleRemoveItem,
    updateItem,
    handleSubmit,
  } = useMobileQuickPriceLogic({
    isOpen,
    initialProductName,
    onClose,
  });

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={onClose}
      zIndexClass={zIndexClass}
      title={
        <div className="flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-blue-600" />
          <span>Prezzo Rapido a Catalogo</span>
        </div>
      }
      formId="mobile-quick-price-form"
      confirmText={`Salva ${validItems.length} ${validItems.length === 1 ? 'Prezzo' : 'Prezzi'}`}
      cancelText="Annulla"
      isLoading={isSubmitting}
      isConfirmDisabled={validItems.length === 0 || isSubmitting}
    >
      <form id="mobile-quick-price-form" onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto pb-6">
        {/* Selettore Lista Spesa di Destinazione */}
        <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-1.5">
          <label className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
            <TaskListIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Associa a Lista Spesa (Opzionale)</span>
          </label>
          <ShoppingListSelect
            value={selectedListId}
            onChange={(val) => setSelectedListId(val)}
            lists={lists}
            asModal={true}
            allowNone={true}
            noneLabel="Nessuna Lista (Solo Personale / Privato)"
          />
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="space-y-3">
          {items.map((it, idx) => (
            <MobileQuickPriceItemCard
              key={it.id}
              item={it}
              index={idx}
              totalCount={items.length}
              products={products}
              brands={brands}
              suppliers={suppliers}
              unitOptions={unitOptions}
              isDatePickerOpen={datePickerItemId === it.id}
              onToggleDatePicker={() => setDatePickerItemId((prev) => (prev === it.id ? null : it.id))}
              onCloseDatePicker={() => setDatePickerItemId(null)}
              onRemoveItem={handleRemoveItem}
              onUpdateItem={updateItem}
            />
          ))}
        </div>

        <div className="pt-1">
          <AddButton
            label="Aggiungi un altro prodotto al lotto"
            onClick={handleAddItem}
          />
        </div>
      </form>
    </MobileBaseModal>
  );
};

export default MobileShoppingQuickPriceModal;
