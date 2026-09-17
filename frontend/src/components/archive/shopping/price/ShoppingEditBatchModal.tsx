import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { EditIcon } from '@/components/shared/utils/Icons';
import type {
  ConfigOption,
  ItemBatchRecord,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import type { PurchasedItemEditFormData } from '@/mobile/components/modals/shopping/MobilePurchasedItemEditModal';
import {
  fetchShoppingSuppliers,
  fetchShoppingLists,
  fetchShoppingProducts,
  fetchShoppingConfig,
  shoppingQueryKeys,
} from '@/api/shoppingApi';
import {
  ShoppingPurchasedItemProductFields,
  ShoppingPurchasedItemPurchaseFields,
} from '@/components/shared/shopping/purchased';

import { useIsMobile } from '@/mobile/hooks/useIsMobile';
import MobileBaseModal from '@/mobile/components/modals/MobileBaseModal';
import {
  MobilePurchasedItemProductSection,
  MobilePurchasedItemPurchaseSection,
} from '@/mobile/components/modals/shopping/purchased';

export interface ShoppingEditBatchModalProps {
  isOpen: boolean;
  batch: ItemBatchRecord | null;
  onClose: () => void;
  suppliers?: ShoppingSupplierOption[];
  lists?: ShoppingListSummary[];
  brands?: ShoppingSupplierOption[];
  products?: ShoppingProductOption[];
  unitOptions?: ConfigOption[];
  currencyOptions?: ConfigOption[];
  onSave: (batchId: number, data: {
    purchasePrice: number;
    purchaseDate: string;
    quantityPurchased?: number;
    supplierId?: number | null;
    isOnSale: boolean;
    productName?: string;
    brandName?: string;
    brandId?: number | null;
    notes?: string;
    unitId?: number | null;
    shoppingListId?: number | null;
  }) => Promise<void>;
  onDelete?: (batchId: number) => Promise<void>;
}

export const ShoppingEditBatchModal: React.FC<ShoppingEditBatchModalProps> = ({
  isOpen,
  batch,
  onClose,
  suppliers = [],
  lists = [],
  brands = [],
  products = [],
  unitOptions = [],
  currencyOptions = [],
  onSave,
}) => {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState<PurchasedItemEditFormData>({
    productName: '',
    brandName: '',
    brandId: '',
    shoppingListId: '',
    quantity: '1',
    unitId: '',
    notes: '',
    price: '',
    unitPrice: '',
    totalPrice: '',
    lastPriceEdited: 'unit',
    currencyId: '',
    supplierId: '',
    purchaseDate: '',
    isOnSale: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: fetchedSuppliers = [] } = useQuery<ShoppingSupplierOption[]>({
    queryKey: shoppingQueryKeys.suppliers(),
    queryFn: ({ signal }) => fetchShoppingSuppliers(signal),
    staleTime: 60_000,
    enabled: isOpen && suppliers.length === 0,
  });

  const { data: fetchedLists = [] } = useQuery<ShoppingListSummary[]>({
    queryKey: shoppingQueryKeys.lists(),
    queryFn: ({ signal }) => fetchShoppingLists(signal),
    staleTime: 60_000,
    enabled: isOpen && lists.length === 0,
  });

  const { data: fetchedProducts = [] } = useQuery<ShoppingProductOption[]>({
    queryKey: shoppingQueryKeys.products(),
    queryFn: ({ signal }) => fetchShoppingProducts(signal),
    staleTime: 60_000,
    enabled: isOpen && products.length === 0,
  });

  const { data: config } = useQuery({
    queryKey: shoppingQueryKeys.config(),
    queryFn: ({ signal }) => fetchShoppingConfig(signal),
    staleTime: 300_000,
    enabled: isOpen && (unitOptions.length === 0 || currencyOptions.length === 0),
  });

  const effectiveSuppliers = suppliers.length > 0 ? suppliers : fetchedSuppliers;
  const effectiveBrands = brands.length > 0 ? brands : effectiveSuppliers;
  const effectiveLists = lists.length > 0 ? lists : fetchedLists;
  const effectiveProducts = products.length > 0 ? products : fetchedProducts;
  const effectiveUnits = unitOptions.length > 0 ? unitOptions : (config?.unitOptions ?? []);
  const effectiveCurrencies = currencyOptions.length > 0 ? currencyOptions : (config?.currencyOptions ?? []);

  useEffect(() => {
    if (isOpen && batch) {
      const uPrice = batch.unitPrice != null ? String(batch.unitPrice) : batch.purchasePrice != null ? String(batch.purchasePrice) : '';
      const qtyStr = batch.quantityPurchased != null ? String(batch.quantityPurchased) : '1';
      const qNum = Number(qtyStr) || 1;
      const uNum = Number(uPrice.replace(',', '.'));
      const tCalc = !Number.isNaN(uNum) && uPrice !== '' ? (uNum * qNum).toFixed(2) : batch.purchasePrice != null ? String(batch.purchasePrice) : '';

      let listIdStr = batch.shoppingListId ? String(batch.shoppingListId) : '';
      if (!listIdStr && batch.listName && effectiveLists.length > 0) {
        const found = effectiveLists.find((l) => l.name.toLowerCase().trim() === batch.listName?.toLowerCase().trim());
        if (found) {
          listIdStr = String(found.id);
        }
      }

      let unitIdStr = batch.unitId ? String(batch.unitId) : '';
      if (!unitIdStr && batch.unitName && effectiveUnits.length > 0) {
        const foundU = effectiveUnits.find(
          (u) =>
            (u.codeValue && u.codeValue.toLowerCase().trim() === batch.unitName?.toLowerCase().trim()) ||
            (u.codeName && u.codeName.toLowerCase().trim() === batch.unitName?.toLowerCase().trim()) ||
            (u.displayName && u.displayName.toLowerCase().trim() === batch.unitName?.toLowerCase().trim())
        );
        if (foundU) {
          unitIdStr = String(foundU.id);
        }
      }

      setFormData({
        productName: batch.productName || '',
        brandName: batch.brandName || '',
        brandId: batch.brandId ? String(batch.brandId) : '',
        shoppingListId: listIdStr,
        quantity: qtyStr,
        unitId: unitIdStr,
        notes: batch.notes || '',
        price: uPrice,
        unitPrice: uPrice,
        totalPrice: tCalc,
        lastPriceEdited: 'unit',
        currencyId: '',
        supplierId: batch.supplierId ? String(batch.supplierId) : '',
        purchaseDate: batch.purchaseDate || '',
        isOnSale: Boolean(batch.isOnSale),
      });
      setError(null);
      setIsSubmitting(false);
      setIsDatePickerOpen(false);
    }
  }, [isOpen, batch, effectiveLists, effectiveUnits]);

  if (!isOpen || !batch) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceVal = formData.unitPrice ?? formData.price ?? '';
    const parsedPrice = Number(String(priceVal).replace(',', '.'));
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Inserisci un prezzo unitario valido maggiore di zero.');
      return;
    }

    const parsedQty = Number(String(formData.quantity).replace(',', '.'));
    if (Number.isNaN(parsedQty) || parsedQty <= 0) {
      setError('Inserisci una quantità valida.');
      return;
    }

    if (!formData.purchaseDate) {
      setError('Seleziona una data di acquisto valida.');
      return;
    }

    setIsSubmitting(true);
    try {
      const totalPurchasePrice = (formData.lastPriceEdited === 'total' && formData.totalPrice && formData.totalPrice.trim() !== '')
        ? Number(String(formData.totalPrice).replace(',', '.'))
        : parsedPrice * parsedQty;

      await onSave(batch.id, {
        purchasePrice: totalPurchasePrice,
        purchaseDate: formData.purchaseDate,
        quantityPurchased: parsedQty,
        supplierId: formData.supplierId ? Number(formData.supplierId) : null,
        isOnSale: formData.isOnSale,
        productName: formData.productName.trim(),
        brandName: formData.brandName.trim() || undefined,
        brandId: formData.brandId ? Number(formData.brandId) : null,
        notes: formData.notes.trim() || undefined,
        unitId: formData.unitId ? Number(formData.unitId) : null,
        shoppingListId: formData.shoppingListId ? Number(formData.shoppingListId) : null,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio della rilevazione.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isMobile) {
    return (
      <MobileBaseModal
        isOpen={isOpen}
        onClose={onClose}
        zIndexClass="z-[10020]"
        title={
          <div className="flex items-center gap-2">
            <EditIcon className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="truncate">
              <span className="text-sm font-extrabold text-gray-900 block">
                Modifica Rilevazione Prezzo
              </span>
              <span className="text-xs font-normal text-gray-500 truncate block">
                {batch.productName}
              </span>
            </div>
          </div>
        }
        formId="shopping-edit-batch-mobile-form"
        confirmText={isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
        cancelText="Annulla"
        isConfirmDisabled={isSubmitting || !formData.productName.trim()}
      >
        <form
          id="shopping-edit-batch-mobile-form"
          onSubmit={handleSubmit}
          className="space-y-4 max-w-lg mx-auto pb-6"
        >
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium text-xs">
              {error}
            </div>
          )}

          <MobilePurchasedItemProductSection
            formData={formData}
            setFormData={setFormData}
            lists={effectiveLists}
            brands={effectiveBrands}
            products={effectiveProducts}
            unitOptions={effectiveUnits}
          />

          <MobilePurchasedItemPurchaseSection
            formData={formData}
            setFormData={setFormData}
            suppliers={effectiveSuppliers}
            currencyOptions={effectiveCurrencies}
          />

          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Note Prodotto (Opzionale)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Aggiungi una nota personale..."
              rows={2}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden resize-none transition"
            />
          </div>
        </form>
      </MobileBaseModal>
    );
  }

  const sidePanel = (
    <ShoppingPurchasedItemPurchaseFields
      formData={formData}
      setFormData={setFormData}
      suppliers={effectiveSuppliers}
      currencyOptions={effectiveCurrencies}
      isDatePickerOpen={isDatePickerOpen}
      setIsDatePickerOpen={setIsDatePickerOpen}
      asSidePanel={true}
    />
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-base font-bold text-gray-800">
          <EditIcon className="w-5 h-5 text-blue-600" />
          <span>Modifica Rilevazione Prezzo</span>
        </div>
      }
      sidePanel={sidePanel}
      maxWidthClass="max-w-lg"
      zIndexClass="z-[10020]"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium text-xs">
            {error}
          </div>
        )}

        {/* Sezione Proprietà Prodotto */}
        <ShoppingPurchasedItemProductFields
          formData={formData}
          setFormData={setFormData}
          lists={effectiveLists}
          products={effectiveProducts}
          brands={effectiveBrands}
          unitOptions={effectiveUnits}
        />

        {/* Note Aggiuntive */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Note Prodotto (Opzionale)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Aggiungi una nota personale..."
            rows={2}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden resize-none transition"
          />
        </div>

        {/* Footer con Pulsanti di Salvataggio */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.productName.trim()}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default ShoppingEditBatchModal;
