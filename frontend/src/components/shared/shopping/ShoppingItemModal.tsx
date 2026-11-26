// src/components/shared/shopping/ShoppingItemModal.tsx
import React from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import ShoppingUnitSelect from './ShoppingUnitSelect';
import ShoppingQuantityInput from './ShoppingQuantityInput';
import ShoppingProductAutocomplete from './ShoppingProductAutocomplete';
import ShoppingBrandAutocomplete from './ShoppingBrandAutocomplete';
import ShoppingListSelect from './ShoppingListSelect';
import ShoppingItemBrandSidePanel, {
  shouldShowBrandSidePanel,
} from './ShoppingItemBrandSidePanel';
import type {
  ConfigOption,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
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

const findBrandNotesForPair = (
  productName: string,
  brandName: string,
  products: ShoppingProductOption[],
  brands: ShoppingSupplierOption[]
): { brandId: string; notes: string } => {
  const pName = productName.trim().toLowerCase();
  const bName = brandName.trim().toLowerCase();
  if (!pName || !bName) {
    return { brandId: '', notes: '' };
  }

  const matchedProd = products.find(
    (p) => (p?.displayName || p?.nameNormalized || '').trim().toLowerCase() === pName
  );
  const brandLink = matchedProd?.productBrands?.find((pb) => {
    const linkName =
      pb.brand?.nameNormalized ||
      brands.find((b) => b.id === pb.brandId)?.name ||
      '';
    return linkName.trim().toLowerCase() === bName;
  });
  const matchedBrandOption = brands.find(
    (b) => (b.name || '').trim().toLowerCase() === bName
  );

  return {
    brandId: matchedBrandOption?.id
      ? String(matchedBrandOption.id)
      : brandLink?.brandId
      ? String(brandLink.brandId)
      : '',
    notes: brandLink?.notes ?? '',
  };
};

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

  const confirmText = isCreate ? 'Aggiungi Prodotto' : 'Salva Modifiche';
  const formId = isCreate ? 'create-item-form' : 'edit-item-form';
  const isConfirmDisabled = disabled || !itemForm.productName.trim();

  const showSidePanel = shouldShowBrandSidePanel(
    itemForm.productName,
    itemForm.brandName,
    products,
    brands,
    isCreate
  );

  const sidePanel = showSidePanel ? (
    <ShoppingItemBrandSidePanel
      productName={itemForm.productName}
      brandName={itemForm.brandName}
      brandNotes={itemForm.brandNotes}
      products={products}
      brands={brands}
      disabled={disabled}
      readOnly={isCreate}
      onSelectBrand={(entry) =>
        setItemForm((prev) => ({
          ...prev,
          brandName: entry.brandName,
          brandId: String(entry.brandId),
          brandNotes: entry.notes ?? '',
        }))
      }
      onClearBrand={() =>
        setItemForm((prev) => ({
          ...prev,
          brandName: '',
          brandId: '',
          brandNotes: '',
        }))
      }
      onBrandNotesChange={(val) =>
        setItemForm((prev) => ({
          ...prev,
          brandNotes: val ?? '',
        }))
      }
    />
  ) : undefined;

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      title={title}
      sidePanel={sidePanel}
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
              setItemForm((prev) => {
                const nextBrandName =
                  selectedProd?.brandName && !prev.brandName
                    ? selectedProd.brandName
                    : prev.brandName;
                const pairInfo = findBrandNotesForPair(
                  name,
                  nextBrandName,
                  products,
                  brands
                );
                return {
                  ...prev,
                  productName: name,
                  brandName: nextBrandName,
                  brandId:
                    selectedProd?.brandId && !prev.brandName
                      ? String(selectedProd.brandId)
                      : pairInfo.brandId || prev.brandId,
                  brandNotes: nextBrandName ? pairInfo.notes : '',
                  ...(isCreate && selectedProd?.defaultUnitId && !prev.unitId
                    ? { unitId: String(selectedProd.defaultUnitId) }
                    : {}),
                };
              })
            }
            products={products}
            autoFocus
            disabled={disabled}
          />
        </div>

        {/* Marchio / Brand */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Marchio / Brand
          </label>
          <ShoppingBrandAutocomplete
            value={itemForm.brandName}
            onChange={(bName, brandObj) => {
              const pairInfo = findBrandNotesForPair(
                itemForm.productName,
                bName,
                products,
                brands
              );
              setItemForm((prev) => ({
                ...prev,
                brandName: bName,
                brandId: brandObj?.id ? String(brandObj.id) : pairInfo.brandId,
                brandNotes: pairInfo.notes,
              }));
            }}
            brands={brands}
            productName={itemForm.productName}
            products={products}
            disabled={disabled}
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

        {/* Selettore Lista di Destinazione / Sposta Lista */}
        {lists.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              {isCreate ? 'Lista di destinazione' : "Sposta in un'altra lista"}
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
