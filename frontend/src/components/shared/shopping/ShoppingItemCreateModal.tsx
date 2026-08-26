// src/components/shared/shopping/ShoppingItemCreateModal.tsx
import React from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import ShoppingUnitSelect from './ShoppingUnitSelect';
import ShoppingQuantityInput from './ShoppingQuantityInput';
import ShoppingProductAutocomplete from './ShoppingProductAutocomplete';
import ShoppingBrandAutocomplete from './ShoppingBrandAutocomplete';
import type { ConfigOption, ShoppingProductOption, ShoppingSupplierOption } from '@/types/shopping';
import type { ItemFormState } from './shoppingItems.utils';
import { ShoppingIcon } from '@/components/shared/utils/Icons';

interface ShoppingItemCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  itemForm: ItemFormState;
  setItemForm: React.Dispatch<React.SetStateAction<ItemFormState>>;
  activeListId: number | null;
  unitOptions: ConfigOption[];
  products?: ShoppingProductOption[];
  brands?: ShoppingSupplierOption[];
}


const ShoppingItemCreateModal: React.FC<ShoppingItemCreateModalProps> = ({
  open,
  onClose,
  onSubmit,
  itemForm,
  setItemForm,
  activeListId,
  unitOptions,
  products = [],
  brands = [],
}) => {
  if (!open) return null;

  const hasActiveList = activeListId != null;

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-base font-bold text-gray-800">
          <ShoppingIcon className="w-5 h-5 text-blue-600" />
          <span>Nuovo Prodotto</span>
        </span>
      }
      formId="create-item-form"
      confirmText="Aggiungi Prodotto"
      cancelText="Annulla"
      isConfirmDisabled={!hasActiveList || !itemForm.productName.trim()}
      maxWidthClass="max-w-md"
      overflowVisible={true}
    >
      <form id="create-item-form" onSubmit={onSubmit} className="space-y-4">
        {!hasActiveList && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            Seleziona prima una lista per aggiungere un prodotto.
          </div>
        )}

        {/* Nome Prodotto */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Nome Prodotto
          </label>
          <ShoppingProductAutocomplete
            value={itemForm.productName}
            onChange={(name, selectedProd) =>
              setItemForm((prev) => ({
                ...prev,
                productName: name,
                ...(selectedProd?.brandName && !prev.brandName
                  ? {
                      brandName: selectedProd.brandName,
                      brandId: selectedProd.brandId ? String(selectedProd.brandId) : '',
                    }
                  : {}),
                ...(selectedProd?.defaultUnitId && !prev.unitId
                  ? { unitId: String(selectedProd.defaultUnitId) }
                  : {}),
              }))
            }
            products={products}
            autoFocus
            disabled={!hasActiveList}
          />
        </div>

        {/* Marchio / Brand */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Marchio / Brand <span className="text-gray-400 font-normal lowercase">(opzionale)</span>
          </label>
          <ShoppingBrandAutocomplete
            value={itemForm.brandName}
            onChange={(bName, brandObj) =>
              setItemForm((prev) => ({
                ...prev,
                brandName: bName,
                brandId: brandObj?.id ? String(brandObj.id) : '',
              }))
            }
            brands={brands}
            productName={itemForm.productName}
            products={products}
            disabled={!hasActiveList}
          />
        </div>


        {/* Quantità & Unità di Misura */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Quantità
            </label>
            <ShoppingQuantityInput
              value={itemForm.quantity}
              onChange={(val) =>
                setItemForm((prev) => ({
                  ...prev,
                  quantity: val,
                }))
              }
              placeholder="Es. 1"
              disabled={!hasActiveList}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Unità di misura
            </label>
            <ShoppingUnitSelect
              value={itemForm.unitId}
              onChange={(val) =>
                setItemForm((prev) => ({
                  ...prev,
                  unitId: val,
                }))
              }
              unitOptions={unitOptions}
              disabled={!hasActiveList}
            />
          </div>
        </div>

        {/* Note / Dettagli con textarea non ridimensionabile */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Note
          </label>

          <textarea
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
            value={itemForm.notes}
            onChange={(e) =>
              setItemForm((prev) => ({
                ...prev,
                notes: e.target.value,
              }))
            }
            placeholder="Es. Marca preferita, offerte..."
            disabled={!hasActiveList}
          />
        </div>
      </form>
    </BaseModal>
  );
};

export default ShoppingItemCreateModal;