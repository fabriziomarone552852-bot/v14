import React, { useState } from 'react';
import type {
  ConfigOption,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import type { PurchaseFormState } from './shoppingItems.utils';
import BaseModal from '@/components/shared/dialog/BaseModal';
import ShoppingQuantityInput from './ShoppingQuantityInput';
import ShoppingCurrencySelect from './ShoppingCurrencySelect';
import ShoppingSupplierSelect from './ShoppingSupplierSelect';
import ShoppingBrandAutocomplete from './ShoppingBrandAutocomplete';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import { ShoppingIcon } from '@/components/shared/utils/Icons';

import { formatUnitForQuantity } from './ShoppingUnitSelect';

interface ShoppingPurchaseModalProps {
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
  offerFlagOptions: ConfigOption[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const ShoppingPurchaseModal: React.FC<ShoppingPurchaseModalProps> = ({
  open,
  itemName,
  itemTotalQuantity,
  unitCodeName,
  purchaseForm,
  setPurchaseForm,
  suppliers,
  brands = [],
  products = [],
  currencyOptions,
  onClose,
  onSubmit,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  if (!open) return null;

  const numericBought = Number(purchaseForm.quantity) || 0;
  const isPartial = itemTotalQuantity != null && numericBought < itemTotalQuantity && numericBought > 0;

  // Unità formattata singolare o plurale in base alla quantità acquistata
  const unitDisplayForBought = formatUnitForQuantity(unitCodeName, purchaseForm.quantity);
  const unitDisplayForTotal = formatUnitForQuantity(unitCodeName, itemTotalQuantity);

  return (
    <BaseModal
      isOpen={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <ShoppingIcon className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="truncate">
            <span className="text-base font-bold text-gray-800">Registra Acquisto</span>
            <span className="block text-xs font-normal text-gray-400 truncate">
              {itemName || 'Prodotto'}
            </span>
          </div>
        </div>
      }
      formId="purchase-form"
      confirmText="Conferma Acquisto"
      cancelText="Annulla"
      isConfirmDisabled={!purchaseForm.price.trim() || numericBought <= 0}
      maxWidthClass="max-w-md"
      overflowVisible={true}
    >
      <form id="purchase-form" onSubmit={onSubmit} className="space-y-4">
        {/* Riga 1: Quantità acquistata & Prezzo con Valuta incorporata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">

          {/* Quantità acquistata */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
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
                Da comprare: <span className="font-semibold text-gray-700">{itemTotalQuantity} {unitDisplayForTotal}</span>
              </p>
            )}
          </div>

          {/* Prezzo & Valuta accostata */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Prezzo Pagato
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
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white transition-colors"
              />
              <ShoppingCurrencySelect
                value={purchaseForm.currencyId}
                onChange={(val) => setPurchaseForm((p) => ({ ...p, currencyId: val }))}
                currencyOptions={currencyOptions}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Prezzo totale per i pezzi presi.
            </p>
          </div>
        </div>

        {/* Avviso acquisto parziale */}
        {isPartial && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
            <strong>Acquisto parziale:</strong> registrerai {numericBought} {unitDisplayForBought}, e il prodotto rimarrà nella lista con i rimanenti{' '}
            <strong>
              {(itemTotalQuantity - numericBought).toFixed(1).replace(/\.0$/, '')}{' '}
              {formatUnitForQuantity(unitCodeName, itemTotalQuantity - numericBought)}
            </strong>.
          </div>
        )}

        {/* Riga 2: Marchio / Brand */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Marchio / Brand <span className="text-gray-400 font-normal lowercase">(opzionale)</span>
          </label>
          <ShoppingBrandAutocomplete
            value={purchaseForm.brandName}
            onChange={(bName, brandObj) =>
              setPurchaseForm((prev) => ({
                ...prev,
                brandName: bName,
                brandId: brandObj?.id ? String(brandObj.id) : '',
              }))
            }
            brands={brands}
            productName={itemName}
            products={products}
          />
        </div>

        {/* Riga 3: Negozio con Tasto + e Data Acquisto con DatePicker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
          {/* Negozio */}
          <div>
            <ShoppingSupplierSelect
              value={purchaseForm.supplierId}
              onChange={(val) => setPurchaseForm((prev) => ({ ...prev, supplierId: val }))}
              suppliers={suppliers}
            />
          </div>

          {/* Data Acquisto con DatePicker */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Data Acquisto
            </label>
            <DatePicker
              value={purchaseForm.purchaseDate}
              onChange={(date) => setPurchaseForm((prev) => ({ ...prev, purchaseDate: date }))}
              isOpen={isDatePickerOpen}
              onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
              onClose={() => setIsDatePickerOpen(false)}
            />
          </div>
        </div>

        {/* Riga 3: Checkbox Era in offerta? */}
        <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <input
            id="is-on-sale-toggle"
            type="checkbox"
            checked={purchaseForm.isOnSale}
            onChange={(e) => setPurchaseForm((prev) => ({ ...prev, isOnSale: e.target.checked }))}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
          />
          <label
            htmlFor="is-on-sale-toggle"
            className="text-xs font-semibold text-gray-700 cursor-pointer select-none"
          >
            Era in offerta?

          </label>
        </div>
      </form>
    </BaseModal>
  );
};

export default ShoppingPurchaseModal;