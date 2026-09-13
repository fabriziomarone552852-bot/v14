// src/components/shared/shopping/purchased/ShoppingPurchasedItemProductFields.tsx
import React from 'react';
import type {
  ConfigOption,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import type { PurchasedItemEditFormData } from '@/mobile/components/modals/shopping/MobilePurchasedItemEditModal';
import ShoppingProductAutocomplete from '../ShoppingProductAutocomplete';
import ShoppingBrandAutocomplete from '../ShoppingBrandAutocomplete';
import ShoppingListSelect from '../ShoppingListSelect';
import ShoppingQuantityInput from '../ShoppingQuantityInput';
import ShoppingUnitSelect from '../ShoppingUnitSelect';

export interface ShoppingPurchasedItemProductFieldsProps {
  formData: PurchasedItemEditFormData;
  setFormData: React.Dispatch<React.SetStateAction<PurchasedItemEditFormData>>;
  lists: ShoppingListSummary[];
  products: ShoppingProductOption[];
  brands: ShoppingSupplierOption[];
  unitOptions: ConfigOption[];
}

export const ShoppingPurchasedItemProductFields: React.FC<ShoppingPurchasedItemProductFieldsProps> = ({
  formData,
  setFormData,
  lists,
  products,
  brands,
  unitOptions,
}) => {
  return (
    <div className="space-y-4">
      {/* 1. Nome Prodotto con Autocomplete */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
          Nome Prodotto <span className="text-red-500">*</span>
        </label>
        <ShoppingProductAutocomplete
          value={formData.productName}
          onChange={(name, opt) => {
            setFormData((prev) => ({
              ...prev,
              productName: name,
              brandName: opt?.brandName || prev.brandName,
              brandId: opt?.brandId ? String(opt.brandId) : prev.brandId,
            }));
          }}
          products={products}
          placeholder="Es. Latte Intero, Pasta..."
          autoFocus={true}
        />
      </div>

      {/* 2. Marca / Brand con Autocomplete */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
          Marca / Produttore (Opzionale)
        </label>
        <ShoppingBrandAutocomplete
          value={formData.brandName}
          onChange={(name, opt) => {
            setFormData((prev) => ({
              ...prev,
              brandName: name,
              brandId: opt ? String(opt.id) : '',
            }));
          }}
          brands={brands}
          placeholder="Es. Barilla, Mulino Bianco..."
        />
      </div>

      {/* 3. Lista di Destinazione */}
      {lists.length > 0 && (
        <ShoppingListSelect
          value={formData.shoppingListId}
          onChange={(val) => setFormData((prev) => ({ ...prev, shoppingListId: val }))}
          lists={lists}
        />
      )}

      {/* 4. Quantità e Unità di Misura */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Quantità
          </label>
          <ShoppingQuantityInput
            value={formData.quantity}
            onChange={(val) => setFormData((prev) => ({ ...prev, quantity: val }))}
          />
        </div>

        <div>
          <ShoppingUnitSelect
            value={formData.unitId}
            onChange={(val) => setFormData((prev) => ({ ...prev, unitId: val }))}
            unitOptions={unitOptions}
          />
        </div>
      </div>
    </div>
  );
};
