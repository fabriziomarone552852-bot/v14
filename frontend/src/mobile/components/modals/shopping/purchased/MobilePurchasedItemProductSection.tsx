// src/mobile/components/modals/shopping/purchased/MobilePurchasedItemProductSection.tsx
import React from 'react';
import type {
  ConfigOption,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import ShoppingQuantityInput from '@/components/shared/shopping/ShoppingQuantityInput';
import ShoppingUnitSelect from '@/components/shared/shopping/ShoppingUnitSelect';
import ShoppingProductAutocomplete from '@/components/shared/shopping/ShoppingProductAutocomplete';
import ShoppingBrandAutocomplete from '@/components/shared/shopping/ShoppingBrandAutocomplete';
import ShoppingListSelect from '@/components/shared/shopping/ShoppingListSelect';
import type { PurchasedItemEditFormData } from '../MobilePurchasedItemEditModal';

export interface MobilePurchasedItemProductSectionProps {
  formData: PurchasedItemEditFormData;
  setFormData: React.Dispatch<React.SetStateAction<PurchasedItemEditFormData>>;
  lists?: ShoppingListSummary[];
  brands?: ShoppingSupplierOption[];
  products?: ShoppingProductOption[];
  unitOptions: ConfigOption[];
}

export const MobilePurchasedItemProductSection: React.FC<MobilePurchasedItemProductSectionProps> = ({
  formData,
  setFormData,
  lists = [],
  brands = [],
  products = [],
  unitOptions,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
      <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2">
        Informazioni Prodotto
      </h3>

      {/* Lista di Appartenenza */}
      {lists.length > 1 && (
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
            Lista
          </label>
          <ShoppingListSelect
            value={formData.shoppingListId}
            onChange={(val) => setFormData((prev) => ({ ...prev, shoppingListId: val }))}
            lists={lists}
            asModal={true}
          />
        </div>
      )}

      {/* Nome Prodotto */}
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
          Nome Prodotto
        </label>
        <ShoppingProductAutocomplete
          value={formData.productName}
          onChange={(name, opt) => {
            setFormData((prev) => ({
              ...prev,
              productName: name,
              brandName: opt?.brandName || prev.brandName,
              brandId: opt?.brandId ? String(opt.brandId) : prev.brandId,
              unitId: opt?.defaultUnitId ? String(opt.defaultUnitId) : prev.unitId,
            }));
          }}
          products={products}
          placeholder="Es. Latte, Pasta..."
        />
      </div>

      {/* Marca */}
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
          Marca
        </label>
        <ShoppingBrandAutocomplete
          value={formData.brandName}
          onChange={(bName, brand) =>
            setFormData((prev) => ({
              ...prev,
              brandName: bName,
              brandId: brand?.id ? String(brand.id) : prev.brandId,
            }))
          }
          brands={brands}
          placeholder="Es. Barilla, Granarolo..."
        />
      </div>

      {/* Quantità & Unità di Misura */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
            Quantità
          </label>
          <ShoppingQuantityInput
            value={formData.quantity}
            onChange={(val) => setFormData((prev) => ({ ...prev, quantity: val }))}
            placeholder="1"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
            Unità di Misura
          </label>
          <ShoppingUnitSelect
            value={formData.unitId}
            onChange={(val) => setFormData((prev) => ({ ...prev, unitId: val }))}
            unitOptions={unitOptions}
            asModal={true}
          />
        </div>
      </div>

      {/* Note / Indicazioni */}
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
          Note / Indicazioni
        </label>
        <input
          type="text"
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Es. Confezione risparmio, senza glutine..."
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>
    </div>
  );
};
