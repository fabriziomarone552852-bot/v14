// src/mobile/components/modals/shopping/item/MobileShoppingBrandSection.tsx
import React, { useMemo, useState } from 'react';
import ShoppingBrandAutocomplete from '@/components/shared/shopping/ShoppingBrandAutocomplete';
import BrandPreferenceRatingControl from '@/components/shared/shopping/BrandPreferenceRatingControl';
import {
  extractTriedBrandsForProduct,
  type TriedBrandEntry,
} from '@/components/shared/shopping/ShoppingItemBrandSidePanel';
import { TagIcon } from '@/components/shared/utils/Icons';
import type { ShoppingProductOption, ShoppingSupplierOption } from '@/types/shopping';
import type { ItemFormState } from '@/components/shared/shopping/shoppingItems.utils';
import { MobileOtherTriedBrandsModal } from './MobileOtherTriedBrandsModal';

export interface MobileShoppingBrandSectionProps {
  itemForm: ItemFormState;
  setItemForm: React.Dispatch<React.SetStateAction<ItemFormState>>;
  products: ShoppingProductOption[];
  brands: ShoppingSupplierOption[];
  disabled?: boolean;
  isCreate?: boolean;
}

export const MobileShoppingBrandSection: React.FC<MobileShoppingBrandSectionProps> = ({
  itemForm,
  setItemForm,
  products,
  brands,
  disabled = false,
  isCreate = false,
}) => {
  const [isOtherBrandsOpen, setIsOtherBrandsOpen] = useState(false);

  const trimmedProduct = itemForm.productName.trim();
  const trimmedBrand = itemForm.brandName.trim();
  const lowerSelectedBrand = trimmedBrand.toLowerCase();

  const triedBrands = useMemo(
    () => extractTriedBrandsForProduct(itemForm.productName, products, brands),
    [itemForm.productName, products, brands]
  );

  const selectedTriedEntry = useMemo(
    () =>
      lowerSelectedBrand
        ? triedBrands.find((b) => b.brandName.toLowerCase() === lowerSelectedBrand) ?? null
        : null,
    [triedBrands, lowerSelectedBrand]
  );

  const otherTriedBrands = useMemo(
    () =>
      lowerSelectedBrand
        ? triedBrands.filter((b) => b.brandName.toLowerCase() !== lowerSelectedBrand)
        : triedBrands,
    [triedBrands, lowerSelectedBrand]
  );

  const handleSelectTriedBrand = (entry: TriedBrandEntry) => {
    setItemForm((prev) => ({
      ...prev,
      brandName: entry.brandName,
      brandId: String(entry.brandId),
      brandNotes: entry.notes ?? '',
    }));
  };

  const otherBrandsButton =
    trimmedProduct && otherTriedBrands.length > 0 ? (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOtherBrandsOpen(true)}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 active:scale-95 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
      >
        <TagIcon className="w-3 h-3 text-blue-600 shrink-0" />
        <span>Altri marchi</span>
        <span className="px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold">
          {otherTriedBrands.length}
        </span>
      </button>
    ) : null;

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-3.5 space-y-3">
        {/* Intestazione Marca + Campo Inserimento */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
              Marca
            </label>
            {!trimmedBrand && otherBrandsButton}
          </div>

          <ShoppingBrandAutocomplete
            value={itemForm.brandName}
            onChange={(brandName, brand) => {
              const pName = (itemForm.productName || '').trim().toLowerCase();
              const matchedProd = products.find(
                (p) => (p?.displayName || p?.nameNormalized || '').trim().toLowerCase() === pName
              );
              const brandLink = matchedProd?.productBrands?.find((pb) => {
                const linkName =
                  pb.brand?.nameNormalized ||
                  brands.find((b) => b.id === pb.brandId)?.name ||
                  '';
                return linkName.trim().toLowerCase() === brandName.trim().toLowerCase();
              });
              setItemForm((prev) => ({
                ...prev,
                brandName,
                brandId: brand?.id
                  ? String(brand.id)
                  : brandLink?.brandId
                  ? String(brandLink.brandId)
                  : '',
                brandNotes: brandLink?.notes ?? '',
              }));
            }}
            brands={brands}
            productName={itemForm.productName}
            products={products}
            disabled={disabled}
            placeholder="Es. Barilla, Granarolo, Coop..."
          />
        </div>

        {/* Marchio Scelto + Tasto Altri Marchi sulla stessa riga + Finestrella Giudizio */}
        {trimmedProduct &&
          trimmedBrand &&
          (!isCreate || Boolean(selectedTriedEntry) || otherTriedBrands.length > 0) && (
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">
                Marchio scelto
              </span>
              {otherBrandsButton}
            </div>

            <BrandPreferenceRatingControl
              productName={itemForm.productName}
              brandName={trimmedBrand}
              value={itemForm.brandNotes}
              onChange={(val) =>
                setItemForm((prev) => ({
                  ...prev,
                  brandNotes: val ?? '',
                }))
              }
              lastPrice={selectedTriedEntry?.lastPrice}
              lastSupplierName={selectedTriedEntry?.lastSupplierName}
              showPrice={false}
              readOnly={isCreate}
              onClearBrand={() =>
                setItemForm((prev) => ({
                  ...prev,
                  brandName: '',
                  brandId: '',
                  brandNotes: '',
                }))
              }
              disabled={disabled}
            />
          </div>
        )}
      </div>

      <MobileOtherTriedBrandsModal
        isOpen={isOtherBrandsOpen}
        onClose={() => setIsOtherBrandsOpen(false)}
        productName={itemForm.productName}
        title={trimmedBrand ? 'Altri marchi già provati' : 'Marchi già provati'}
        brands={otherTriedBrands}
        onSelectBrand={handleSelectTriedBrand}
      />
    </>
  );
};

export default MobileShoppingBrandSection;
