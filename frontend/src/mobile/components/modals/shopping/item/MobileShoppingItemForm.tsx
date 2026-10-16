// src/mobile/components/modals/shopping/item/MobileShoppingItemForm.tsx
import React from 'react';
import ShoppingUnitSelect from '@/components/shared/shopping/ShoppingUnitSelect';
import ShoppingQuantityInput from '@/components/shared/shopping/ShoppingQuantityInput';
import ShoppingProductAutocomplete from '@/components/shared/shopping/ShoppingProductAutocomplete';
import ShoppingBrandAutocomplete from '@/components/shared/shopping/ShoppingBrandAutocomplete';
import ShoppingListSelect from '@/components/shared/shopping/ShoppingListSelect';
import BrandPreferenceRatingControl from '@/components/shared/shopping/BrandPreferenceRatingControl';
import { parseBrandPreference } from '@/utils/shoppingBrandPreference';
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
          onChange={(brandName, brand) => {
            const pName = (itemForm.productName || '').trim().toLowerCase();
            const matchedProd = products.find(
              (p) => (p?.displayName || p?.nameNormalized || '').toLowerCase() === pName
            );
            const brandLink = matchedProd?.productBrands?.find(
              (pb) => (pb.brand?.nameNormalized || '').toLowerCase() === brandName.trim().toLowerCase()
            );
            setItemForm((prev) => ({
              ...prev,
              brandName,
              brandId: brand?.id ? String(brand.id) : brandLink?.brandId ? String(brandLink.brandId) : prev.brandId,
              brandNotes: brandLink?.notes || prev.brandNotes || '',
            }));
          }}
          brands={brands}
          productName={itemForm.productName}
          products={products}
          placeholder="Es. Barilla, Granarolo, Coop..."
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
                  const pref = parseBrandPreference(pb.notes);
                  const isPos = pref?.sentiment === 'positive';
                  const isNeg = pref?.sentiment === 'negative';

                  return (
                    <button
                      key={pb.id || pb.brandId}
                      type="button"
                      onClick={() =>
                        setItemForm((prev) => ({
                          ...prev,
                          brandName: bName,
                          brandId: String(pb.brandId),
                          brandNotes: pb.notes || '',
                        }))
                      }
                      className={`text-left px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex flex-col ${
                        isSelected
                          ? isNeg
                            ? 'bg-rose-100 border-rose-400 text-rose-950 shadow-2xs ring-1 ring-rose-400'
                            : isPos
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-950 shadow-2xs ring-1 ring-emerald-400'
                            : 'bg-amber-100 border-amber-400 text-amber-900 shadow-2xs ring-1 ring-amber-400'
                          : isNeg
                          ? 'bg-rose-50/80 border-rose-200 text-rose-800 active:bg-rose-100'
                          : isPos
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 active:bg-emerald-100'
                          : 'bg-white/80 border-amber-200 text-gray-700 active:bg-amber-100'
                      }`}
                    >
                      <span className="font-semibold capitalize flex items-center gap-1">
                        {isNeg && <span>👎</span>}
                        {isPos && <span>👍</span>}
                        {!isNeg && !isPos && pb.notes && <span>📝</span>}
                        <span>{bName}</span>
                      </span>
                      {pb.notes && (
                        <span
                          className={`text-[10px] italic max-w-[200px] truncate ${
                            isNeg ? 'text-rose-700 font-medium' : isPos ? 'text-emerald-700 font-medium' : 'text-amber-700'
                          }`}
                        >
                          «{pref?.comment || pb.notes}»
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Valutazione Rapida Marchio (Stelle / Pollice Su / Pollice Giù + Nota) */}
        {itemForm.productName.trim() && itemForm.brandName.trim() && (() => {
          const pName = itemForm.productName.trim().toLowerCase();
          const matched = products.find(
            (p) => (p?.displayName || p?.nameNormalized || '').toLowerCase() === pName
          );
          return (
            <BrandPreferenceRatingControl
              productName={itemForm.productName}
              brandName={itemForm.brandName}
              value={itemForm.brandNotes}
              onChange={(val) =>
                setItemForm((prev) => ({
                  ...prev,
                  brandNotes: val ?? '',
                }))
              }
              productId={matched?.id}
              brandId={itemForm.brandId ? Number(itemForm.brandId) : undefined}
            />
          );
        })()}
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
