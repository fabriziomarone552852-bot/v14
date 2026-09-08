// src/mobile/components/modals/shopping/MobileShoppingPurchaseModal.tsx
import React, { useState } from 'react';
import type {
  ConfigOption,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import type { PurchaseFormState } from '@/components/shared/shopping/shoppingItems.utils';
import MobileBaseModal from '../MobileBaseModal';
import ShoppingQuantityInput from '@/components/shared/shopping/ShoppingQuantityInput';
import ShoppingCurrencySelect from '@/components/shared/shopping/ShoppingCurrencySelect';
import ShoppingSupplierSelect from '@/components/shared/shopping/ShoppingSupplierSelect';
import ShoppingBrandAutocomplete from '@/components/shared/shopping/ShoppingBrandAutocomplete';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import { ShoppingIcon, TagIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';

interface MobileShoppingPurchaseModalProps {
  open: boolean;
  itemName: string;
  itemTotalQuantity?: number | null;
  unitCodeName?: string | null;
  purchaseForm: PurchaseFormState;
  setPurchaseForm: React.Dispatch<React.SetStateAction<PurchaseFormState>>;
  suppliers: ShoppingSupplierOption[];
  brands?: ShoppingSupplierOption[];
  products?: ShoppingProductOption[];
  currencyOptions: ConfigOption[];
  offerFlagOptions?: ConfigOption[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isAlreadyPurchased?: boolean;
  zIndexClass?: string;
}

export const MobileShoppingPurchaseModal: React.FC<MobileShoppingPurchaseModalProps> = ({
  open,
  itemName,
  itemTotalQuantity,
  unitCodeName,
  purchaseForm,
  setPurchaseForm,
  suppliers,
  brands = [],
  currencyOptions,
  onClose,
  onSubmit,
  isAlreadyPurchased = false,
  zIndexClass = 'z-[10010]',
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  if (!open) return null;

  const numericBought = Number(purchaseForm.quantity) || 0;
  const isPartial =
    itemTotalQuantity != null && numericBought < itemTotalQuantity && numericBought > 0;

  const unitDisplayForBought = formatUnitForQuantity(unitCodeName, purchaseForm.quantity);
  const unitDisplayForTotal = formatUnitForQuantity(unitCodeName, itemTotalQuantity);

  return (
    <MobileBaseModal
      isOpen={open}
      onClose={onClose}
      zIndexClass={zIndexClass}
      title={
        <div className="flex items-center gap-2">
          {isAlreadyPurchased ? (
            <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <ShoppingIcon className="w-5 h-5 text-blue-600 shrink-0" />
          )}
          <div className="truncate">
            <span className="text-sm font-extrabold text-gray-900 block">
              {isAlreadyPurchased ? 'Modifica Prodotto Acquistato' : 'Registra Acquisto'}
            </span>
            <span className="text-xs font-normal text-gray-500 truncate block">
              {itemName || 'Prodotto'}
            </span>
          </div>
        </div>
      }
      formId="mobile-purchase-form"
      confirmText={isAlreadyPurchased ? 'Salva Modifiche' : 'Conferma Acquisto'}
      cancelText="Annulla"
      isConfirmDisabled={!purchaseForm.price.trim() || numericBought <= 0}
    >
      <form id="mobile-purchase-form" onSubmit={onSubmit} className="space-y-4 max-w-lg mx-auto pb-6">
        
        {/* Avviso acquisto parziale */}
        {isPartial && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2">
            <span>ℹ️</span>
            <span>
              Acquisto parziale ({numericBought} di {itemTotalQuantity} {unitDisplayForTotal}). La quantità residua rimarrà nella lista.
            </span>
          </div>
        )}

        {/* Quantità & Prezzo */}
        <div className="grid grid-cols-2 gap-3">
          {/* Quantità */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Quantità {unitDisplayForBought ? `(${unitDisplayForBought})` : ''}
            </label>
            <ShoppingQuantityInput
              value={purchaseForm.quantity}
              onChange={(val) =>
                setPurchaseForm((prev) => ({
                  ...prev,
                  quantity: val,
                }))
              }
              placeholder="1"
            />
            {itemTotalQuantity != null && (
              <p className="text-[11px] text-gray-400 mt-1">
                Richiesti: <span className="font-semibold text-gray-700">{itemTotalQuantity} {unitDisplayForTotal}</span>
              </p>
            )}
          </div>

          {/* Prezzo Pagato */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
              Prezzo Totale
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                inputMode="decimal"
                required
                autoFocus
                placeholder="0,00"
                value={purchaseForm.price}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.,]/g, '');
                  setPurchaseForm((prev) => ({
                    ...prev,
                    price: val,
                  }));
                }}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all"
              />
              <ShoppingCurrencySelect
                value={purchaseForm.currencyId}
                onChange={(val) => setPurchaseForm((p) => ({ ...p, currencyId: val }))}
                currencyOptions={currencyOptions}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Prezzo complessivo</p>
          </div>
        </div>

        {/* Negozio con modale centrata */}
        <ShoppingSupplierSelect
          value={purchaseForm.supplierId}
          onChange={(val) =>
            setPurchaseForm((prev) => ({
              ...prev,
              supplierId: val,
            }))
          }
          suppliers={suppliers}
          asModal={true}
        />

        {/* Marca */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
            Marca
          </label>
          <ShoppingBrandAutocomplete
            value={purchaseForm.brandName}
            onChange={(brandName, brand) =>
              setPurchaseForm((prev) => ({
                ...prev,
                brandName,
                brandId: brand?.id ? String(brand.id) : '',
              }))
            }
            brands={brands}
            placeholder="Seleziona o digita la marca..."
          />
        </div>

        {/* Data Acquisto con modale overlay centrata */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
            Data Acquisto
          </label>
          <DatePicker
            value={purchaseForm.purchaseDate}
            onChange={(newDate: string) => {
              setPurchaseForm((prev) => ({
                ...prev,
                purchaseDate: newDate,
              }));
              setIsDatePickerOpen(false);
            }}
            isOpen={isDatePickerOpen}
            onClose={() => setIsDatePickerOpen(false)}
            onToggle={() => setIsDatePickerOpen((prev) => !prev)}
            overlay={true}
          />
        </div>

        {/* Toggle In Offerta / Saldi */}
        <div className="pt-1">
          <label className="flex items-center gap-2.5 p-3 bg-gray-50 border border-gray-200/90 rounded-xl cursor-pointer active:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={purchaseForm.isOnSale}
              onChange={(e) =>
                setPurchaseForm((prev) => ({
                  ...prev,
                  isOnSale: e.target.checked,
                }))
              }
              className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500"
            />
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <TagIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>Articolo in Offerta / Promozione</span>
            </div>
          </label>
        </div>

      </form>
    </MobileBaseModal>
  );
};

export default MobileShoppingPurchaseModal;
