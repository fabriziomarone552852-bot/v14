import React from 'react';
import { PlusIcon } from '@/components/shared/utils/Icons';
import { QuickPriceRowItem } from './QuickPriceRowItem';
import type { QuickPriceRow, DropdownOption } from './QuickPriceTypes';
import type { ShoppingProductOption, ShoppingSupplierOption } from '@/types/shopping';

export interface QuickPriceTableProps {
  rows: QuickPriceRow[];
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
  onAddRow: () => void;
}

export const QuickPriceTable: React.FC<QuickPriceTableProps> = ({
  rows,
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
  onAddRow,
}) => {
  return (
    <div className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
      <div className="overflow-x-auto max-h-[55vh] custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse min-w-[840px]">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 sticky top-0 z-20">
            <tr>
              <th className="py-2.5 px-3 min-w-[170px]">Prodotto</th>
              <th className="py-2.5 px-3 min-w-[150px]">Brand / Marchio</th>
              <th className="py-2.5 px-2.5 w-24">Prezzo</th>
              <th className="py-2.5 px-2 w-16">Qtà</th>
              <th className="py-2.5 px-2.5 min-w-[110px]">Unità</th>
              <th className="py-2.5 px-2.5 min-w-[140px]">Data</th>
              <th className="py-2.5 px-2.5 min-w-[140px]">Negozio</th>
              <th className="py-2.5 px-2.5 w-16 text-center">Offerta</th>
              <th className="py-2.5 px-2 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <QuickPriceRowItem
                key={row.id}
                row={row}
                index={index}
                products={products}
                brands={brands}
                unitDropdownOptions={unitDropdownOptions}
                supplierDropdownOptions={supplierDropdownOptions}
                openDatePickerRowId={openDatePickerRowId}
                onUpdateRow={onUpdateRow}
                onProductSelect={onProductSelect}
                onBrandSelect={onBrandSelect}
                onRemoveRow={onRemoveRow}
                onDatePickerToggle={onDatePickerToggle}
                onKeyDownOnLastField={onKeyDownOnLastField}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-2.5 bg-slate-50/60 border-t border-slate-200/80 flex items-center">
        <button
          type="button"
          onClick={onAddRow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition cursor-pointer"
        >
          <PlusIcon className="w-4 h-4 text-slate-500" />
          <span>Aggiungi riga</span>
        </button>
      </div>
    </div>
  );
};
