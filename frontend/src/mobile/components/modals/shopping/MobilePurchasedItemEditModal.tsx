// src/mobile/components/modals/shopping/MobilePurchasedItemEditModal.tsx
import React, { useState, useEffect } from 'react';
import type {
  ConfigOption,
  ShoppingListItem,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import MobileBaseModal from '../MobileBaseModal';
import ShoppingQuantityInput from '@/components/shared/shopping/ShoppingQuantityInput';
import ShoppingUnitSelect from '@/components/shared/shopping/ShoppingUnitSelect';
import ShoppingProductAutocomplete from '@/components/shared/shopping/ShoppingProductAutocomplete';
import ShoppingBrandAutocomplete from '@/components/shared/shopping/ShoppingBrandAutocomplete';
import ShoppingListSelect from '@/components/shared/shopping/ShoppingListSelect';
import ShoppingCurrencySelect from '@/components/shared/shopping/ShoppingCurrencySelect';
import ShoppingSupplierSelect from '@/components/shared/shopping/ShoppingSupplierSelect';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import { EditIcon, TagIcon } from '@/components/shared/utils/Icons';
import { getLocalTodayStr } from '@/utils/dateUtils';

export interface PurchasedItemEditFormData {
  productName: string;
  brandName: string;
  brandId: string;
  shoppingListId: string;
  quantity: string;
  unitId: string;
  notes: string;
  price: string;
  currencyId: string;
  supplierId: string;
  purchaseDate: string;
  isOnSale: boolean;
}

interface MobilePurchasedItemEditModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: PurchasedItemEditFormData) => Promise<void> | void;
  item: ShoppingListItem | null;
  lists?: ShoppingListSummary[];
  suppliers: ShoppingSupplierOption[];
  brands?: ShoppingSupplierOption[];
  products?: ShoppingProductOption[];
  unitOptions: ConfigOption[];
  currencyOptions: ConfigOption[];
  zIndexClass?: string;
}

export const MobilePurchasedItemEditModal: React.FC<MobilePurchasedItemEditModalProps> = ({
  open,
  onClose,
  onSubmit,
  item,
  lists = [],
  suppliers,
  brands = [],
  products = [],
  unitOptions,
  currencyOptions,
  zIndexClass = 'z-[10010]',
}) => {
  const [formData, setFormData] = useState<PurchasedItemEditFormData>({
    productName: '',
    brandName: '',
    brandId: '',
    shoppingListId: '',
    quantity: '1',
    unitId: '',
    notes: '',
    price: '',
    currencyId: '1',
    supplierId: '',
    purchaseDate: getLocalTodayStr(),
    isOnSale: false,
  });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && item) {
      const batches = item.inventoryBatches || [];
      const latestBatch = batches.length > 0 ? batches[0] : null;

      const priceVal =
        item.lastPrice != null
          ? item.lastPrice.toFixed(2).replace('.', ',')
          : latestBatch?.purchase_price != null || latestBatch?.purchasePrice != null
          ? Number(latestBatch.purchase_price ?? latestBatch.purchasePrice).toFixed(2).replace('.', ',')
          : '';

      const supplierVal =
        item.lastSupplierId != null
          ? String(item.lastSupplierId)
          : latestBatch?.supplier_id != null || latestBatch?.supplierId != null
          ? String(latestBatch.supplier_id ?? latestBatch.supplierId)
          : '';

      const dateVal =
        item.lastPurchaseDate
          ? item.lastPurchaseDate.split('T')[0]
          : latestBatch?.purchase_date || latestBatch?.purchaseDate
          ? String(latestBatch.purchase_date || latestBatch.purchaseDate).split('T')[0]
          : getLocalTodayStr();

      const onSaleVal = Boolean(
        latestBatch?.is_on_sale ?? latestBatch?.isOnSale ?? false
      );

      setFormData({
        productName: item.productName || '',
        brandName: item.brandName || '',
        brandId: item.brandId ? String(item.brandId) : '',
        shoppingListId: item.shoppingListId ? String(item.shoppingListId) : '',
        quantity: item.quantity != null ? String(item.quantity) : '1',
        unitId: item.unitId ? String(item.unitId) : '',
        notes: item.notes || '',
        price: priceVal,
        currencyId: item.lastCurrencyId ? String(item.lastCurrencyId) : '1',
        supplierId: supplierVal,
        purchaseDate: dateVal,
        isOnSale: onSaleVal,
      });
    }
  }, [open, item]);

  if (!open || !item) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.price.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConfirmDisabled =
    isSubmitting || !formData.productName.trim() || !formData.price.trim();

  return (
    <>
      <MobileBaseModal
        isOpen={open}
        onClose={onClose}
        zIndexClass={zIndexClass}
        title={
          <div className="flex items-center gap-2">
            <EditIcon className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="truncate">
              <span className="text-sm font-extrabold text-gray-900 block">
                Modifica Prodotto Acquistato
              </span>
              <span className="text-xs font-normal text-gray-500 truncate block">
                {item.productName}
              </span>
            </div>
          </div>
        }
        formId="mobile-purchased-item-edit-form"
        confirmText="Salva Modifiche"
        cancelText="Annulla"
        isConfirmDisabled={isConfirmDisabled}
      >
        <form
          id="mobile-purchased-item-edit-form"
          onSubmit={handleSubmit}
          className="space-y-4 max-w-lg mx-auto pb-6"
        >
          {/* SEZIONE 1: DATI PRODOTTO */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2">
              Informazioni Prodotto
            </h3>

            {/* Lista di Appartenenza */}
            {lists.length > 1 && (
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Lista
                </label>
                <ShoppingListSelect
                  value={formData.shoppingListId}
                  onChange={(val) => setFormData((prev) => ({ ...prev, shoppingListId: val }))}
                  lists={lists}
                  asModal={true}
                />
              </div>
            )}

            {/* Nome Prodotto */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Nome Prodotto
              </label>
              <ShoppingProductAutocomplete
                value={formData.productName}
                onChange={(name, opt) => {
                  setFormData((prev) => ({
                    ...prev,
                    productName: name,
                    brandName: opt?.brandName || prev.brandName,
                    brandId: opt?.brandId ? String(opt.brandId) : prev.brandId,
                    unitId: opt?.defaultUnitId ? String(opt.defaultUnitId) : prev.unitId,
                  }));
                }}
                products={products}
                placeholder="Es. Latte, Pasta..."
              />
            </div>

            {/* Marca */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Marca
              </label>
              <ShoppingBrandAutocomplete
                value={formData.brandName}
                onChange={(bName, brand) =>
                  setFormData((prev) => ({
                    ...prev,
                    brandName: bName,
                    brandId: brand?.id ? String(brand.id) : prev.brandId,
                  }))
                }
                brands={brands}
                placeholder="Es. Barilla, Granarolo..."
              />
            </div>

            {/* Quantità & Unità di Misura */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Quantità
                </label>
                <ShoppingQuantityInput
                  value={formData.quantity}
                  onChange={(val) => setFormData((prev) => ({ ...prev, quantity: val }))}
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Unità di Misura
                </label>
                <ShoppingUnitSelect
                  value={formData.unitId}
                  onChange={(val) => setFormData((prev) => ({ ...prev, unitId: val }))}
                  unitOptions={unitOptions}
                  asModal={true}
                />
              </div>
            </div>

            {/* Note / Indicazioni */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                Note / Indicazioni
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Es. Confezione risparmio, senza glutine..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* SEZIONE 2: DATI ACQUISTO (PREZZO, NEGOZIO, DATA, OFFERTA) */}
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
        </form>
      </MobileBaseModal>
    </>
  );
};

export default MobilePurchasedItemEditModal;
