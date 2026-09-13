// src/mobile/components/modals/shopping/item/MobileShoppingItemForm.tsx
import React from 'react';
import ShoppingUnitSelect from '@/components/shared/shopping/ShoppingUnitSelect';
import ShoppingQuantityInput from '@/components/shared/shopping/ShoppingQuantityInput';
import ShoppingProductAutocomplete from '@/components/shared/shopping/ShoppingProductAutocomplete';
import ShoppingBrandAutocomplete from '@/components/shared/shopping/ShoppingBrandAutocomplete';
import ShoppingListSelect from '@/components/shared/shopping/ShoppingListSelect';
import type { ConfigOption, ShoppingListSummary, ShoppingProductOption, ShoppingSupplierOption } from '@/types/shopping';
import type { ItemFormState } from '@/components/shared/shopping/shoppingItems.utils';

export interface MobileShoppingItemFormProps {
  formId: string;
  isCreate: boolean;
  hasActiveList: boolean;
  itemForm: ItemFormState;
  setItemForm: React.Dispatch<React.SetStateAction<ItemFormState>>;
  lists?: ShoppingListSummary[];
  unitOptions: ConfigOption[];
  products?: ShoppingProductOption[];
  brands?: ShoppingSupplierOption[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const MobileShoppingItemForm: React.FC<MobileShoppingItemFormProps> = ({
  formId,
  isCreate,
  hasActiveList,
  itemForm,
  setItemForm,
  lists = [],
  unitOptions,
  products = [],
  brands = [],
  onSubmit,
}) => {
  return (
    <form id={formId} onSubmit={onSubmit} className="space-y-4 max-w-lg mx-auto pb-6">
      {isCreate && !hasActiveList && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          Seleziona una lista prima di aggiungere un prodotto.
        </div>
      )}

      {/* Selezione Lista se creazione o spostamento */}
      {lists.length > 1 && (
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
            Lista di Destinazione
          </label>
          <ShoppingListSelect
            value={itemForm.shoppingListId}
            onChange={(val) => setItemForm((prev) => ({ ...prev, shoppingListId: val }))}
            lists={lists}
            asModal={true}
          />
        </div>
      )}

      {/* Nome Prodotto con Autocompletamento Catalogo */}
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
          Nome Prodotto
        </label>
        <ShoppingProductAutocomplete
          value={itemForm.productName}
          onChange={(name, opt) => {
            setItemForm((prev) => ({
              ...prev,
              productName: name,
              brandName: opt?.brandName || prev.brandName,
              brandId: opt?.brandId ? String(opt.brandId) : prev.brandId,
              unitId: opt?.defaultUnitId ? String(opt.defaultUnitId) : prev.unitId,
            }));
          }}
          products={products}
          placeholder="Es. Latte Intero, Pasta, Biscotti..."
        />
      </div>

      {/* Marca Autocomplete */}
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
          Marca
        </label>
        <ShoppingBrandAutocomplete
          value={itemForm.brandName}
          onChange={(brandName, brand) =>
            setItemForm((prev) => ({
              ...prev,
              brandName,
              brandId: brand?.id ? String(brand.id) : prev.brandId,
            }))
          }
          brands={brands}
          placeholder="Es. Barilla, Granarolo, Coop..."
        />
      </div>

      {/* Quantità & Unità di Misura */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
            Quantità
          </label>
          <ShoppingQuantityInput
            value={itemForm.quantity}
            onChange={(val) => setItemForm((prev) => ({ ...prev, quantity: val }))}
            placeholder="1"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
            Unità di Misura
          </label>
          <ShoppingUnitSelect
            value={itemForm.unitId}
            onChange={(val) => setItemForm((prev) => ({ ...prev, unitId: val }))}
            unitOptions={unitOptions}
            asModal={true}
          />
        </div>
      </div>

      {/* Note / Dettagli Aggiuntivi */}
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
          Note / Dettagli
        </label>
        <textarea
          rows={3}
          value={itemForm.notes}
          onChange={(e) => setItemForm((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Aggiungi eventuali preferenze (es. senza lattosio, pacco doppio...)"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
        />
      </div>
    </form>
  );
};
