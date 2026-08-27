import React from 'react';
import ShoppingProductAutocomplete from '@/components/shared/shopping/ShoppingProductAutocomplete';
import ShoppingBrandAutocomplete from '@/components/shared/shopping/ShoppingBrandAutocomplete';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import { TrashIcon } from '@/components/shared/utils/Icons';
import { InlineDropdownSelect } from './InlineDropdownSelect';
import type { QuickPriceRow, DropdownOption } from './QuickPriceTypes';
import type { ShoppingProductOption, ShoppingSupplierOption } from '@/types/shopping';

export interface QuickPriceRowItemProps {
  row: QuickPriceRow;
  index: number;
  products: ShoppingProductOption[];
  brands: ShoppingSupplierOption[];
  unitDropdownOptions: DropdownOption[];
  supplierDropdownOptions: DropdownOption[];
  openDatePickerRowId: string | null;
  onUpdateRow: <K extends keyof QuickPriceRow>(id: string, field: K, value: QuickPriceRow[K]) => void;
  onProductSelect: (rowId: string, productName: string, product?: ShoppingProductOption) => void;
  onBrandSelect: (rowId: string, brandName: string, brand?: ShoppingSupplierOption) => void;
  onRemoveRow: (id: string) => void;
  onDatePickerToggle: (rowId: string | null) => void;
  onKeyDownOnLastField: (e: React.KeyboardEvent, rowIndex: number) => void;
}

export const QuickPriceRowItem: React.FC<QuickPriceRowItemProps> = ({
  row,
  index,
  products,
  brands,
  unitDropdownOptions,
  supplierDropdownOptions,
  openDatePickerRowId,
  onUpdateRow,
  onProductSelect,
  onBrandSelect,
  onRemoveRow,
  onDatePickerToggle,
  onKeyDownOnLastField,
}) => {
  return (
    <tr className="hover:bg-slate-50/70 transition-colors group">
      <td className="py-2 px-3">
        <ShoppingProductAutocomplete
          id={`prod-${row.id}`}
          value={row.productName}
          onChange={(name, prod) => onProductSelect(row.id, name, prod)}
          products={products}
          hideBrand={true}
          placeholder="Es. Pasta..."
          className="w-full text-xs"
          usePortal={true}
        />
      </td>

      <td className="py-2 px-3">
        <ShoppingBrandAutocomplete
          id={`brand-${row.id}`}
          value={row.brandName}
          onChange={(name, brand) => onBrandSelect(row.id, name, brand)}
          brands={brands}
          productName={row.productName}
          products={products}
          placeholder="Es. Barilla..."
          className="w-full text-xs"
          usePortal={true}
        />
      </td>

      <td className="py-2 px-2.5">
        <input
          id={`price-${row.id}`}
          type="text"
          inputMode="decimal"
          value={row.price}
          onChange={(e) => onUpdateRow(row.id, 'price', e.target.value)}
          placeholder="0.00"
          className="w-full px-2.5 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
        />
      </td>

      <td className="py-2 px-2">
        <input
          id={`qty-${row.id}`}
          type="text"
          inputMode="decimal"
          value={row.quantity}
          onChange={(e) => onUpdateRow(row.id, 'quantity', e.target.value)}
          placeholder="1"
          className="w-full px-2 py-2 border border-gray-200 rounded-xl text-xs text-center text-slate-700 focus:outline-none focus:border-blue-500 bg-white"
        />
      </td>

      <td className="py-2 px-2.5">
        <InlineDropdownSelect
          id={`unit-${row.id}`}
          value={row.unitId}
          onChange={(val) => onUpdateRow(row.id, 'unitId', val)}
          options={unitDropdownOptions}
          placeholder="Unità"
          className="w-full"
        />
      </td>

      <td className="py-2 px-2.5">
        <DatePicker
          value={row.purchaseDate}
          onChange={(newDate) => {
            onUpdateRow(row.id, 'purchaseDate', newDate);
            onDatePickerToggle(null);
          }}
          isOpen={openDatePickerRowId === row.id}
          onToggle={() => onDatePickerToggle(openDatePickerRowId === row.id ? null : row.id)}
          onClose={() => onDatePickerToggle(null)}
          align="left"
          usePortal={true}
        />
      </td>

      <td className="py-2 px-2.5">
        <InlineDropdownSelect
          id={`supplier-${row.id}`}
          value={row.supplierId}
          onChange={(val) => onUpdateRow(row.id, 'supplierId', val)}
          options={supplierDropdownOptions}
          placeholder="Negozio"
          className="w-full"
        />
      </td>

      <td className="py-2 px-2.5 text-center">
        <input
          id={`sale-${row.id}`}
          type="checkbox"
          checked={row.isOnSale}
          onChange={(e) => onUpdateRow(row.id, 'isOnSale', e.target.checked)}
          onKeyDown={(e) => onKeyDownOnLastField(e, index)}
          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
        />
      </td>

      <td className="py-2 px-2 text-center">
        <button
          type="button"
          tabIndex={-1}
          onClick={() => onRemoveRow(row.id)}
          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Elimina riga"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};
