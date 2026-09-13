// src/components/shared/shopping/bulk/ShoppingBulkPurchaseRow.tsx
import React, { useId } from 'react';
import type {
  ConfigOption,
  ShoppingListItem,
  ShoppingSupplierOption,
} from '@/types/shopping';
import {
  shoppingButtonPrimaryClass,
  shoppingCardClass,
  shoppingInputClass,
} from '../shoppingUi';
import { getConfigOptionLabel, type PurchaseFormState } from '../shoppingItems.utils';

export interface ShoppingBulkPurchaseRowProps {
  item: ShoppingListItem;
  form: PurchaseFormState;
  saving: boolean;
  suppliers: ShoppingSupplierOption[];
  currencyOptions: ConfigOption[];
  offerFlagOptions: ConfigOption[];
  onChangeForm: (
    itemId: number,
    updater: (prev: PurchaseFormState) => PurchaseFormState
  ) => void;
  onSave: (itemId: number) => void;
}

const renderConfigOptions = (options: ConfigOption[]) =>
  options.map((option) => (
    <option key={option.id} value={String(option.id)}>
      {getConfigOptionLabel(option)}
    </option>
  ));

export const ShoppingBulkPurchaseRow: React.FC<ShoppingBulkPurchaseRowProps> = ({
  item,
  form,
  saving,
  suppliers,
  currencyOptions,
  offerFlagOptions,
  onChangeForm,
  onSave,
}) => {
  const supplierId = useId();
  const priceId = useId();
  const purchaseDateId = useId();
  const currencyId = useId();
  const offerFlagId = useId();
  const itemLabel = item.productName || 'articolo';

  return (
    <div className={`${shoppingCardClass} flex flex-col gap-3 p-4`}>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-800" title={itemLabel}>
          {itemLabel}
        </p>
        {item.notes ? (
          <p className="truncate text-xs text-slate-400">{item.notes}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label htmlFor={supplierId} className="sr-only">
            Fornitore per {itemLabel}
          </label>
          <select
            id={supplierId}
            className={shoppingInputClass}
            value={form.supplierId}
            onChange={(e) =>
              onChangeForm(item.id, (prev) => ({
                ...prev,
                supplierId: e.target.value,
              }))
            }
          >
            <option value="">Seleziona fornitore</option>
            {suppliers.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={priceId} className="sr-only">
            Prezzo per {itemLabel}
          </label>
          <input
            id={priceId}
            type="text"
            inputMode="decimal"
            className={shoppingInputClass}
            placeholder="0,00"
            value={form.price}
            onChange={(e) =>
              onChangeForm(item.id, (prev) => ({
                ...prev,
                price: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <label htmlFor={purchaseDateId} className="sr-only">
            Data acquisto per {itemLabel}
          </label>
          <input
            id={purchaseDateId}
            type="date"
            className={shoppingInputClass}
            value={form.purchaseDate}
            onChange={(e) =>
              onChangeForm(item.id, (prev) => ({
                ...prev,
                purchaseDate: e.target.value,
              }))
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={currencyId} className="sr-only">
              Valuta per {itemLabel}
            </label>
            <select
              id={currencyId}
              className={shoppingInputClass}
              value={form.currencyId}
              onChange={(e) =>
                onChangeForm(item.id, (prev) => ({
                  ...prev,
                  currencyId: e.target.value,
                }))
              }
            >
              {renderConfigOptions(currencyOptions)}
            </select>
          </div>

          <div>
            <label htmlFor={offerFlagId} className="sr-only">
              Stato offerta per {itemLabel}
            </label>
            <select
              id={offerFlagId}
              className={shoppingInputClass}
              value={form.offerFlagId}
              onChange={(e) =>
                onChangeForm(item.id, (prev) => ({
                  ...prev,
                  offerFlagId: e.target.value,
                }))
              }
            >
              {renderConfigOptions(offerFlagOptions)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className={shoppingButtonPrimaryClass}
          onClick={() => onSave(item.id)}
          disabled={saving}
        >
          {saving ? 'Salvataggio...' : 'Segna come acquistato'}
        </button>
      </div>
    </div>
  );
};
