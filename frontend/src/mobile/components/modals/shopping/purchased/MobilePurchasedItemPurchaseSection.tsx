// src/mobile/components/modals/shopping/purchased/MobilePurchasedItemPurchaseSection.tsx
import React, { useState } from 'react';
import type { ConfigOption, ShoppingSupplierOption } from '@/types/shopping';
import ShoppingCurrencySelect from '@/components/shared/shopping/ShoppingCurrencySelect';
import ShoppingSupplierSelect from '@/components/shared/shopping/ShoppingSupplierSelect';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import { TagIcon } from '@/components/shared/utils/Icons';
import type { PurchasedItemEditFormData } from '../MobilePurchasedItemEditModal';

export interface MobilePurchasedItemPurchaseSectionProps {
  formData: PurchasedItemEditFormData;
  setFormData: React.Dispatch<React.SetStateAction<PurchasedItemEditFormData>>;
  suppliers: ShoppingSupplierOption[];
  currencyOptions: ConfigOption[];
}

export const MobilePurchasedItemPurchaseSection: React.FC<MobilePurchasedItemPurchaseSectionProps> = ({
  formData,
  setFormData,
  suppliers,
  currencyOptions,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  return (
    <div className="bg-emerald-50/40 rounded-2xl border border-emerald-200/80 p-4 shadow-2xs space-y-3">
      <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wide border-b border-emerald-100 pb-2">
        Dettagli Acquisto
      </h3>

      {/* Prezzo Totale */}
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
          Prezzo Pagato
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            inputMode="decimal"
            required
            placeholder="0,00"
            value={formData.price}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.,]/g, '');
              setFormData((prev) => ({ ...prev, price: val }));
            }}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
          <ShoppingCurrencySelect
            value={formData.currencyId}
            onChange={(val) => setFormData((p) => ({ ...p, currencyId: val }))}
            currencyOptions={currencyOptions}
          />
        </div>
      </div>

      {/* Negozio / Supermercato */}
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
          Negozio / Supermercato
        </label>
        <ShoppingSupplierSelect
          value={formData.supplierId}
          onChange={(val) => setFormData((prev) => ({ ...prev, supplierId: val }))}
          suppliers={suppliers}
          asModal={true}
        />
      </div>

      {/* Data d'Acquisto */}
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
          Data d'Acquisto
        </label>
        <DatePicker
          value={formData.purchaseDate}
          onChange={(newDate: string) => {
            setFormData((prev) => ({
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

      {/* Articolo in Offerta */}
      <div className="pt-2 border-t border-emerald-100">
        <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
          <input
            type="checkbox"
            checked={formData.isOnSale}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                isOnSale: e.target.checked,
              }))
            }
            className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
          />
          <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <TagIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>Articolo acquistato in offerta / promozione</span>
          </span>
        </label>
      </div>
    </div>
  );
};
