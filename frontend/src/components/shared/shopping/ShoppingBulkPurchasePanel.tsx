// src/components/shared/shopping/ShoppingBulkPurchasePanel.tsx
import React from 'react';
import type {
  ConfigOption,
  ShoppingListItem,
  ShoppingListSummary,
  ShoppingSupplierOption,
} from '@/types/shopping';
import {
  shoppingButtonPrimaryClass,
} from './shoppingUi';
import {
  useBulkPurchaseLogic,
  ShoppingBulkPurchaseRow,
} from './bulk';

export interface ShoppingBulkPurchasePanelProps {
  activeList?: ShoppingListSummary | null;
  items: ShoppingListItem[];
  suppliers: ShoppingSupplierOption[];
  currencyOptions: ConfigOption[];
  offerFlagOptions: ConfigOption[];
}

export const ShoppingBulkPurchasePanel: React.FC<ShoppingBulkPurchasePanelProps> = ({
  activeList,
  items,
  suppliers,
  currencyOptions,
  offerFlagOptions,
}) => {
  const {
    rowStates,
    updateRowForm,
    handleSaveItem,
    handleSaveAll,
  } = useBulkPurchaseLogic({
    activeList,
    items,
    currencyOptions,
  });

  const isAnySaving = Object.values(rowStates).some((r) => r.saving);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            Registrazione rapida acquisti
          </h3>
          <p className="text-xs text-slate-500">
            Inserisci prezzo, negozio e dettagli per ciascun articolo prima di segnarlo come acquistato.
          </p>
        </div>

        {items.length > 1 && (
          <button
            type="button"
            className={`${shoppingButtonPrimaryClass} self-start sm:self-auto`}
            onClick={handleSaveAll}
            disabled={isAnySaving}
          >
            {isAnySaving ? 'Salvataggio...' : 'Salva tutti come acquistati'}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {items.map((it) => {
          const state = rowStates[it.id];
          if (!state) return null;

          return (
            <ShoppingBulkPurchaseRow
              key={it.id}
              item={it}
              form={state.form}
              saving={state.saving}
              suppliers={suppliers}
              currencyOptions={currencyOptions}
              offerFlagOptions={offerFlagOptions}
              onChangeForm={updateRowForm}
              onSave={handleSaveItem}
            />
          );
        })}
      </div>
    </section>
  );
};

export default ShoppingBulkPurchasePanel;