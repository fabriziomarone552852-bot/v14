// src/components/shared/shopping/purchased/ShoppingPurchasedItemPurchaseFields.tsx
import React from 'react';
import type { ConfigOption, ShoppingSupplierOption } from '@/types/shopping';
import {
  type PurchasedItemEditFormData,
  syncPurchasedFormPrices,
} from '@/mobile/components/modals/shopping/MobilePurchasedItemEditModal';
import ShoppingCurrencySelect from '../ShoppingCurrencySelect';
import ShoppingSupplierSelect from '../ShoppingSupplierSelect';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import { TagIcon } from '@/components/shared/utils/Icons';

export interface ShoppingPurchasedItemPurchaseFieldsProps {
  formData: PurchasedItemEditFormData;
  setFormData: React.Dispatch<React.SetStateAction<PurchasedItemEditFormData>>;
  suppliers: ShoppingSupplierOption[];
  currencyOptions: ConfigOption[];
  isDatePickerOpen: boolean;
  setIsDatePickerOpen: (open: boolean) => void;
  asSidePanel?: boolean;
}

export const ShoppingPurchasedItemPurchaseFields: React.FC<ShoppingPurchasedItemPurchaseFieldsProps> = ({
  formData,
  setFormData,
  suppliers,
  currencyOptions,
  isDatePickerOpen,
  setIsDatePickerOpen,
  asSidePanel = false,
}) => {
  const content = (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
        <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
          <TagIcon className="w-4 h-4 text-emerald-600" />
          Dettagli Acquisto
        </span>
        <button
          type="button"
          onClick={() => setFormData((prev) => ({ ...prev, isOnSale: !prev.isOnSale }))}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
            formData.isOnSale
              ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-xs'
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <TagIcon className="w-3.5 h-3.5 text-amber-600" />
          <span>In Offerta</span>
        </button>
      </div>

      {/* Prezzo Unitario, Prezzo Totale e Valuta */}
      <div className="grid grid-cols-3 gap-2.5">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Prezzo Unit. (€)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={formData.unitPrice ?? formData.price}
            onChange={(e) =>
              setFormData((prev) =>
                syncPurchasedFormPrices(prev, 'unitPrice', e.target.value.replace(/[^0-9.,]/g, '').replace(/,/g, '.'))
              )
            }
            placeholder="0,00"
            className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden font-bold text-emerald-700 placeholder:text-gray-300 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
            Prezzo Tot. (€)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={formData.totalPrice ?? ''}
            onChange={(e) =>
              setFormData((prev) =>
                syncPurchasedFormPrices(prev, 'totalPrice', e.target.value.replace(/[^0-9.,]/g, '').replace(/,/g, '.'))
              )
            }
            placeholder="0,00"
            className="w-full px-3 py-2 text-sm bg-emerald-50/40 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden font-bold text-emerald-800 placeholder:text-gray-300 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Valuta
          </label>
          <ShoppingCurrencySelect
            value={formData.currencyId}
            onChange={(val) => setFormData((prev) => ({ ...prev, currencyId: val }))}
            currencyOptions={currencyOptions}
          />
        </div>
      </div>

      {/* Negozio / Fornitore */}
      <ShoppingSupplierSelect
        value={formData.supplierId}
        onChange={(val) => setFormData((prev) => ({ ...prev, supplierId: val }))}
        suppliers={suppliers}
        hideLabel={false}
      />

      {/* Data Acquisto */}
      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
          Data Acquisto
        </label>
        <DatePicker
          value={formData.purchaseDate}
          onChange={(newDate) => {
            setFormData((prev) => ({ ...prev, purchaseDate: newDate }));
            setIsDatePickerOpen(false);
          }}
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
        />
      </div>
    </div>
  );

  if (asSidePanel) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-fit p-5 bg-emerald-50/20">
        {content}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
      {content}
    </div>
  );
};
