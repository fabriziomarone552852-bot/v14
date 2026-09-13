// src/mobile/components/modals/shopping/quickprice/MobileQuickPriceItemCard.tsx
import React from 'react';
import { TrashIcon } from '@/components/shared/utils/Icons';
import ShoppingProductAutocomplete from '@/components/shared/shopping/ShoppingProductAutocomplete';
import ShoppingBrandAutocomplete from '@/components/shared/shopping/ShoppingBrandAutocomplete';
import ShoppingSupplierSelect from '@/components/shared/shopping/ShoppingSupplierSelect';
import ShoppingUnitSelect from '@/components/shared/shopping/ShoppingUnitSelect';
import ShoppingQuantityInput from '@/components/shared/shopping/ShoppingQuantityInput';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import type {
  ConfigOption,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import type { QuickPriceItem } from './useMobileQuickPriceLogic';

export interface MobileQuickPriceItemCardProps {
  item: QuickPriceItem;
  index: number;
  totalCount: number;
  products: ShoppingProductOption[];
  brands: ShoppingSupplierOption[];
  suppliers: ShoppingSupplierOption[];
  unitOptions: ConfigOption[];
  isDatePickerOpen: boolean;
  onToggleDatePicker: () => void;
  onCloseDatePicker: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: <K extends keyof QuickPriceItem>(id: string, field: K, value: QuickPriceItem[K]) => void;
}

export const MobileQuickPriceItemCard: React.FC<MobileQuickPriceItemCardProps> = ({
  item,
  index,
  totalCount,
  products,
  brands,
  suppliers,
  unitOptions,
  isDatePickerOpen,
  onToggleDatePicker,
  onCloseDatePicker,
  onRemoveItem,
  onUpdateItem,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-3.5 shadow-2xs space-y-3 relative">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200/60">
          PRODOTTO #{index + 1}
        </span>

        {totalCount > 1 && (
          <button
            type="button"
            onClick={() => onRemoveItem(item.id)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Rimuovi questo prodotto"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nome Prodotto Autocomplete */}
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
          Nome Prodotto
        </label>
        <ShoppingProductAutocomplete
          value={item.productName}
          onChange={(name, opt) => {
            onUpdateItem(item.id, 'productName', name);
            if (opt?.brandName) onUpdateItem(item.id, 'brandName', opt.brandName);
            if (opt?.brandId) onUpdateItem(item.id, 'brandId', String(opt.brandId));
            if (opt?.defaultUnitId) onUpdateItem(item.id, 'unitId', String(opt.defaultUnitId));
          }}
          products={products}
          placeholder="Es. Caffè macinato, Detersivo..."
        />
      </div>

      {/* Prezzo & Quantità */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
            Prezzo (€)
          </label>
          <input
            type="text"
            inputMode="decimal"
            required
            placeholder="0,00"
            value={item.price}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.,]/g, '');
              onUpdateItem(item.id, 'price', val);
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
            Quantità
          </label>
          <ShoppingQuantityInput
            value={item.quantity}
            onChange={(val) => onUpdateItem(item.id, 'quantity', val)}
            placeholder="1"
          />
        </div>
      </div>

      {/* Unità di Misura con modale centrata */}
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
          Unità di Misura
        </label>
        <ShoppingUnitSelect
          value={item.unitId}
          onChange={(val) => onUpdateItem(item.id, 'unitId', val)}
          unitOptions={unitOptions}
          asModal={true}
        />
      </div>

      {/* Negozio con modale centrata */}
      <ShoppingSupplierSelect
        value={item.supplierId}
        onChange={(val) => onUpdateItem(item.id, 'supplierId', val)}
        suppliers={suppliers}
        asModal={true}
      />

      {/* Marca */}
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
          Marca
        </label>
        <ShoppingBrandAutocomplete
          value={item.brandName}
          onChange={(brandName, brand) => {
            onUpdateItem(item.id, 'brandName', brandName);
            onUpdateItem(item.id, 'brandId', brand?.id ? String(brand.id) : '');
          }}
          brands={brands}
          placeholder="Seleziona o digita marca..."
        />
      </div>

      {/* Data & Offerta */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex-1">
          <DatePicker
            value={item.purchaseDate}
            onChange={(newDate: string) => {
              onUpdateItem(item.id, 'purchaseDate', newDate);
              onCloseDatePicker();
            }}
            isOpen={isDatePickerOpen}
            onClose={onCloseDatePicker}
            onToggle={onToggleDatePicker}
            overlay={true}
          />
        </div>

        <label className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={item.isOnSale}
            onChange={(e) => onUpdateItem(item.id, 'isOnSale', e.target.checked)}
            className="w-3.5 h-3.5 text-blue-600 rounded"
          />
          <span className="text-xs font-bold text-gray-700">In Offerta 🏷️</span>
        </label>
      </div>
    </div>
  );
};
