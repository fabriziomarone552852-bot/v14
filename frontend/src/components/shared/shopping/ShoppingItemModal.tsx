// src/components/shared/shopping/ShoppingItemModal.tsx
import React from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import ShoppingUnitSelect from './ShoppingUnitSelect';
import ShoppingQuantityInput from './ShoppingQuantityInput';
import ShoppingProductAutocomplete from './ShoppingProductAutocomplete';
import ShoppingBrandAutocomplete from './ShoppingBrandAutocomplete';
import ShoppingListSelect from './ShoppingListSelect';
import type { ConfigOption, ShoppingListSummary, ShoppingProductOption, ShoppingSupplierOption } from '@/types/shopping';
import type { ItemFormState } from './shoppingItems.utils';
import { ShoppingIcon, EditIcon } from '@/components/shared/utils/Icons';

interface ShoppingItemModalProps {
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  itemForm: ItemFormState;
  setItemForm: React.Dispatch<React.SetStateAction<ItemFormState>>;
  activeListId?: number | null;
  lists?: ShoppingListSummary[];
  unitOptions: ConfigOption[];
  products?: ShoppingProductOption[];
  brands?: ShoppingSupplierOption[];
}

const ShoppingItemModal: React.FC<ShoppingItemModalProps> = ({
  mode,
  open,
  onClose,
  onSubmit,
  itemForm,
  setItemForm,
  activeListId,
  lists = [],
  unitOptions,
  products = [],
  brands = [],
}) => {
  if (!open) return null;

  const isCreate = mode === 'create';
  const hasActiveList = activeListId != null || Boolean(itemForm.shoppingListId);
  const disabled = isCreate ? !hasActiveList : false;
  
  const title = isCreate ? (
    <span className="flex items-center gap-2 text-base font-bold text-gray-800">
      <ShoppingIcon className="w-5 h-5 text-blue-600" />
      <span>Nuovo Prodotto</span>
    </span>
  ) : (
    <span className="flex items-center gap-2 text-base font-bold text-gray-800">
      <EditIcon className="w-5 h-5 text-blue-600" />
      <span>Modifica Prodotto</span>
    </span>
  );

  const confirmText = isCreate ? "Aggiungi Prodotto" : "Salva Modifiche";
  const formId = isCreate ? "create-item-form" : "edit-item-form";
  
  const isConfirmDisabled = disabled || !itemForm.productName.trim();

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      title={title}
      formId={formId}
      confirmText={confirmText}
      cancelText="Annulla"
      isConfirmDisabled={isConfirmDisabled}
      maxWidthClass="max-w-md"
      overflowVisible={true}
    >
      <form id={formId} onSubmit={onSubmit} className="space-y-4">
        {isCreate && !hasActiveList && (
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
                ...(isCreate && selectedProd?.defaultUnitId && !prev.unitId
                  ? { unitId: String(selectedProd.defaultUnitId) }
                  : {}),
              }))
            }
            products={products}
            autoFocus
            disabled={disabled}
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
            disabled={disabled}
          />
          {/* Box preferenze e note sui brand già provati per questo prodotto */}
          {(() => {
            const pName = (itemForm.productName || '').trim().toLowerCase();
            if (!pName) return null;
            const matched = products.find(
              (p) => (p?.displayName || p?.nameNormalized || '').toLowerCase() === pName
            );
            const brandsWithNotes = matched?.productBrands?.filter((pb) => pb.notes || pb.brand?.nameNormalized) || [];
            if (brandsWithNotes.length === 0) return null;

            return (
              <div className="mt-2 p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs space-y-1.5 animate-fadeIn">
                <div className="font-bold text-amber-800 flex items-center gap-1 text-[11px] uppercase tracking-wide">
                  <span>💡 Note e marchi già provati:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {brandsWithNotes.map((pb) => {
                    const bName = pb.brand?.nameNormalized || brands.find((b) => b.id === pb.brandId)?.name || '';
                    if (!bName) return null;
                    const isSelected = (itemForm.brandName || '').trim().toLowerCase() === bName.toLowerCase();
                    return (
                      <button
                        key={pb.id || pb.brandId}
                        type="button"
                        onClick={() =>
                          setItemForm((prev) => ({
                            ...prev,
                            brandName: bName,
                            brandId: String(pb.brandId),
                          }))
                        }
                        className={`text-left px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex flex-col ${
                          isSelected
                            ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-2xs'
                            : 'bg-white/80 border-amber-200 text-gray-700 hover:bg-amber-100/50 hover:border-amber-300'
                        }`}
                      >
                        <span className="font-semibold text-gray-900 capitalize">{bName}</span>
                        {pb.notes && (
                          <span className="text-[10px] text-amber-700 italic max-w-[220px] truncate">
                            «{pb.notes}»
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}
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
              disabled={disabled}
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
              disabled={disabled}
            />
          </div>
        </div>

        {/* Selettore Lista di Destinazione / Sposta Lista (Sotto quantità, prima delle note) */}
        {lists.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              {isCreate ? 'Lista di destinazione' : 'Sposta in un\'altra lista'}
            </label>
            <ShoppingListSelect
              value={itemForm.shoppingListId}
              onChange={(val) =>
                setItemForm((prev) => ({
                  ...prev,
                  shoppingListId: val,
                }))
              }
              lists={lists}
              disabled={disabled}
            />
          </div>
        )}

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
            disabled={disabled}
          />
        </div>
      </form>
    </BaseModal>
  );
};

export default ShoppingItemModal;
