// src/components/shared/shopping/ShoppingItemEditModal.tsx
import React from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import ShoppingUnitSelect from './ShoppingUnitSelect';
import ShoppingQuantityInput from './ShoppingQuantityInput';
import ShoppingProductAutocomplete from './ShoppingProductAutocomplete';
import ShoppingBrandAutocomplete from './ShoppingBrandAutocomplete';
import type { ConfigOption, ShoppingProductOption, ShoppingSupplierOption } from '@/types/shopping';
import type { ItemFormState } from './shoppingItems.utils';
import { EditIcon } from '@/components/shared/utils/Icons';

interface ShoppingItemEditModalProps {
  open: boolean;
  editForm: ItemFormState;
  setEditForm: React.Dispatch<React.SetStateAction<ItemFormState>>;
  unitOptions: ConfigOption[];
  products?: ShoppingProductOption[];
  brands?: ShoppingSupplierOption[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const ShoppingItemEditModal: React.FC<ShoppingItemEditModalProps> = ({
  open,
  editForm,
  setEditForm,
  unitOptions,
  products = [],
  brands = [],
  onClose,
  onSubmit,
}) => {
  if (!open) return null;

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-base font-bold text-gray-800">
          <EditIcon className="w-5 h-5 text-blue-600" />
          <span>Modifica Prodotto</span>
        </span>
      }
      formId="edit-item-form"
      confirmText="Salva Modifiche"
      cancelText="Annulla"
      isConfirmDisabled={!editForm.productName.trim()}
      maxWidthClass="max-w-md"
      overflowVisible={true}
    >
      <form id="edit-item-form" onSubmit={onSubmit} className="space-y-4">
        {/* Nome Prodotto */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Nome Prodotto
          </label>
          <ShoppingProductAutocomplete
            value={editForm.productName}
            onChange={(name, selectedProd) =>
              setEditForm((prev) => ({
                ...prev,
                productName: name,
                ...(selectedProd?.brandName && !prev.brandName
                  ? {
                      brandName: selectedProd.brandName,
                      brandId: selectedProd.brandId ? String(selectedProd.brandId) : '',
                    }
                  : {}),
              }))
            }
            products={products}
            autoFocus
          />
        </div>

        {/* Marchio / Brand */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Marchio / Brand <span className="text-gray-400 font-normal lowercase">(opzionale)</span>
          </label>
          <ShoppingBrandAutocomplete
            value={editForm.brandName}
            onChange={(bName, brandObj) =>
              setEditForm((prev) => ({
                ...prev,
                brandName: bName,
                brandId: brandObj?.id ? String(brandObj.id) : '',
              }))
            }
            brands={brands}
            productName={editForm.productName}
            products={products}
          />
        </div>


        {/* Quantità & Unità di Misura */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Quantità
            </label>
            <ShoppingQuantityInput
              value={editForm.quantity}
              onChange={(val) =>
                setEditForm((prev) => ({
                  ...prev,
                  quantity: val,
                }))
              }
              placeholder="Es. 1"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Unità di misura
            </label>
            <ShoppingUnitSelect
              value={editForm.unitId}
              onChange={(val) =>
                setEditForm((prev) => ({
                  ...prev,
                  unitId: val,
                }))
              }
              unitOptions={unitOptions}
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
            value={editForm.notes}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                notes: e.target.value,
              }))
            }
            placeholder="Es. Marca preferita, offerte..."
          />
        </div>
      </form>
    </BaseModal>
  );
};

export default ShoppingItemEditModal;