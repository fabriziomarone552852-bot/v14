// src/components/shared/shopping/ShoppingQuickAddBar.tsx
import React, { useId } from 'react';
import type { ConfigOption, ShoppingProductOption } from '@/types/shopping';
import ShoppingUnitSelect from './ShoppingUnitSelect';
import ShoppingQuantityInput from './ShoppingQuantityInput';
import ShoppingProductAutocomplete from './ShoppingProductAutocomplete';
import { AddButton } from '@/components/shared/utils/AddButton';

interface ShoppingQuickAddBarProps {
  activeListId: number | null;
  unitOptions: ConfigOption[];
  quickName: string;
  quickQuantity: string;
  quickUnitId: string;
  loading?: boolean;
  products?: ShoppingProductOption[];
  onQuickNameChange: (value: string) => void;
  onQuickQuantityChange: (value: string) => void;
  onQuickUnitChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const ShoppingQuickAddBar: React.FC<ShoppingQuickAddBarProps> = ({
  activeListId,
  unitOptions,
  quickName,
  quickQuantity,
  quickUnitId,
  loading = false,
  products = [],
  onQuickNameChange,
  onQuickQuantityChange,
  onQuickUnitChange,
  onSubmit,
}) => {
  const hasActiveList = activeListId != null;
  const disabled = !hasActiveList || !quickName.trim() || loading;

  const quickNameId = useId();

  return (
    <form
      onSubmit={onSubmit}
      className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-2xs"
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_110px_160px_auto] items-center">
        {/* Nome Prodotto con autocomplete */}
        <div>
          <label htmlFor={quickNameId} className="sr-only">
            Nome articolo
          </label>
          <ShoppingProductAutocomplete
            id={quickNameId}
            value={quickName}
            onChange={(name) => onQuickNameChange(name)}
            products={products}
            hideBrand={true}
            placeholder={
              hasActiveList
                ? 'Aggiungi rapidamente un prodotto...'
                : 'Seleziona prima una lista'
            }
            disabled={!hasActiveList || loading}
          />
        </div>

        {/* Quantità */}
        <div>
          <ShoppingQuantityInput
            value={quickQuantity}
            onChange={onQuickQuantityChange}
            placeholder="Qtà (1)"
            disabled={!hasActiveList || loading}
          />
        </div>

        {/* Unità di misura */}
        <div>
          <ShoppingUnitSelect
            value={quickUnitId}
            onChange={onQuickUnitChange}
            unitOptions={unitOptions}
            disabled={!hasActiveList || loading}
          />
        </div>

        {/* Pulsante Aggiunta */}
        <div className="shrink-0 min-w-[120px]">
          <AddButton
            label={loading ? 'Aggiunta...' : 'Aggiungi'}
            compact={true}
            type="submit"
            disabled={disabled}
          />
        </div>
      </div>
    </form>
  );
};

export default ShoppingQuickAddBar;