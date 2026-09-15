import React from 'react';
import { PlusIcon } from '@/components/shared/utils/Icons';
import ShoppingUnitSelect from '@/components/shared/shopping/ShoppingUnitSelect';
import ShoppingProductAutocomplete from '@/components/shared/shopping/ShoppingProductAutocomplete';
import type { ConfigOption, ShoppingProductOption } from '@/types/shopping';
import type { useShoppingItemsColumn } from '@/components/shared/shopping/useShoppingItemsColumn';

export interface MobileShoppingQuickAddBarProps {
  columnLogic: ReturnType<typeof useShoppingItemsColumn>;
  unitOptions: ConfigOption[];
  products?: ShoppingProductOption[];
}

export const MobileShoppingQuickAddBar: React.FC<MobileShoppingQuickAddBarProps> = ({
  columnLogic,
  unitOptions,
  products = [],
}) => {
  return (
    <form
      onSubmit={columnLogic.handleQuickAdd}
      className="shrink-0 flex items-center gap-1.5 pb-2 border-b border-gray-100"
    >
      {/* 1. Nome Prodotto con Autocomplete */}
      <div className="relative flex-1 min-w-0">
        <ShoppingProductAutocomplete
          value={columnLogic.quickName}
          onChange={(name) => columnLogic.setQuickName(name)}
          products={products}
          hideBrand={true}
          placeholder="Aggiungi prodotto alla lista..."
          usePortal={true}
          inputClassName="w-full px-3 py-2 bg-gray-100/90 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
      </div>

      {/* 2. Input Quantità compatto */}
      <input
        type="text"
        value={columnLogic.quickQuantity}
        onChange={(e) => columnLogic.setQuickQuantity(e.target.value)}
        placeholder="Q.tà"
        className="w-12 px-1.5 py-2 bg-gray-100/90 border border-gray-200 rounded-xl text-xs font-medium text-center text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shrink-0"
      />

      {/* 3. Selettore Unità di Misura con modale centrata */}
      <div className="shrink-0">
        <ShoppingUnitSelect
          value={columnLogic.quickUnitId}
          onChange={columnLogic.setQuickUnitId}
          unitOptions={unitOptions}
          compact={true}
          asModal={true}
        />
      </div>

      {/* 4. Tasto Invia (+) */}
      <button
        type="submit"
        disabled={!columnLogic.quickName.trim() || columnLogic.quickAdding}
        className="p-2 rounded-xl bg-blue-600 text-white disabled:opacity-40 disabled:pointer-events-none hover:bg-blue-700 active:scale-95 transition-all shrink-0 cursor-pointer shadow-2xs"
        title="Aggiungi alla lista"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
    </form>
  );
};
