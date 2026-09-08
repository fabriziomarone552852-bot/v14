// src/mobile/components/modals/shopping/MobileShoppingQuickPriceModal.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MobileBaseModal from '../MobileBaseModal';
import { TagIcon, TrashIcon } from '@/components/shared/utils/Icons';
import { AddButton } from '@/components/shared/utils/AddButton';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { getLocalTodayStr } from '@/utils/dateUtils';
import type {
  ConfigOption,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';
import ShoppingProductAutocomplete from '@/components/shared/shopping/ShoppingProductAutocomplete';
import ShoppingBrandAutocomplete from '@/components/shared/shopping/ShoppingBrandAutocomplete';
import ShoppingSupplierSelect from '@/components/shared/shopping/ShoppingSupplierSelect';
import ShoppingUnitSelect from '@/components/shared/shopping/ShoppingUnitSelect';
import ShoppingQuantityInput from '@/components/shared/shopping/ShoppingQuantityInput';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';

interface MobileShoppingQuickPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: ShoppingProductOption[];
  brands?: ShoppingSupplierOption[];
  suppliers?: ShoppingSupplierOption[];
  unitOptions?: ConfigOption[];
  initialProductName?: string;
  zIndexClass?: string;
}

interface QuickPriceItem {
  id: string;
  productName: string;
  brandName: string;
  brandId: string;
  price: string;
  quantity: string;
  unitId: string;
  purchaseDate: string;
  supplierId: string;
  isOnSale: boolean;
}

const createEmptyItem = (defaultProductName = ''): QuickPriceItem => ({
  id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  productName: defaultProductName,
  brandName: '',
  brandId: '',
  price: '',
  quantity: '1',
  unitId: '',
  purchaseDate: getLocalTodayStr(),
  supplierId: '',
  isOnSale: false,
});

export const MobileShoppingQuickPriceModal: React.FC<MobileShoppingQuickPriceModalProps> = ({
  isOpen,
  onClose,
  products = [],
  brands = [],
  suppliers = [],
  unitOptions = [],
  initialProductName = '',
  zIndexClass = 'z-[10010]',
}) => {
  const mutations = useShoppingMutations();
  const [items, setItems] = useState<QuickPriceItem[]>([createEmptyItem()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [datePickerItemId, setDatePickerItemId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setItems([createEmptyItem(initialProductName)]);
      setErrorMessage(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialProductName]);

  const handleAddItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      if (prev.length === 1) return [createEmptyItem()];
      return prev.filter((it) => it.id !== id);
    });
  };

  const updateItem = useCallback(
    <K extends keyof QuickPriceItem>(id: string, field: K, value: QuickPriceItem[K]) => {
      setItems((prev) =>
        prev.map((it) => {
          if (it.id !== id) return it;
          return { ...it, [field]: value };
        })
      );
    },
    []
  );

  const validItems = useMemo(() => {
    return items.filter(
      (it) => it.productName.trim() && it.price.trim() && Number(it.price.replace(',', '.')) > 0
    );
  }, [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validItems.length === 0) {
      setErrorMessage('Inserisci almeno un prodotto con relativo prezzo valido.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const records = validItems.map((it) => {
        const parsedPrice = Number(it.price.replace(',', '.'));
        const parsedQty = Number(it.quantity.replace(',', '.')) || 1;
        const finalUnitId = it.unitId ? Number(it.unitId) : undefined;
        const finalBrandId = it.brandId ? Number(it.brandId) : undefined;
        const finalSupplierId = it.supplierId ? Number(it.supplierId) : undefined;

        return {
          productName: it.productName.trim(),
          brandName: it.brandName.trim() || undefined,
          brandId: finalBrandId,
          purchasePrice: parsedPrice,
          quantityPurchased: parsedQty,
          unitId: finalUnitId,
          purchaseDate: it.purchaseDate || getLocalTodayStr(),
          supplierId: finalSupplierId,
          isOnSale: it.isOnSale,
        };
      });

      await mutations.createQuickPriceBatch({ records });
      onClose();
    } catch {
      setErrorMessage('Errore durante il salvataggio dei prezzi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={onClose}
      zIndexClass={zIndexClass}
      title={
        <div className="flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-blue-600" />
          <span>Prezzo Rapido a Catalogo</span>
        </div>
      }
      formId="mobile-quick-price-form"
      confirmText={`Salva ${validItems.length} ${validItems.length === 1 ? 'Prezzo' : 'Prezzi'}`}
      cancelText="Annulla"
      isLoading={isSubmitting}
      isConfirmDisabled={validItems.length === 0 || isSubmitting}
    >
      <form id="mobile-quick-price-form" onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto pb-6">
        
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="space-y-3">
          {items.map((it, idx) => (
            <div
              key={it.id}
              className="bg-white border border-gray-200 rounded-2xl p-3.5 shadow-2xs space-y-3 relative"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200/60">
                  PRODOTTO #{idx + 1}
                </span>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(it.id)}
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
                  value={it.productName}
                  onChange={(name, opt) => {
                    updateItem(it.id, 'productName', name);
                    if (opt?.brandName) updateItem(it.id, 'brandName', opt.brandName);
                    if (opt?.brandId) updateItem(it.id, 'brandId', String(opt.brandId));
                    if (opt?.defaultUnitId) updateItem(it.id, 'unitId', String(opt.defaultUnitId));
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
                    value={it.price}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.,]/g, '');
                      updateItem(it.id, 'price', val);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                    Quantità
                  </label>
                  <ShoppingQuantityInput
                    value={it.quantity}
                    onChange={(val) => updateItem(it.id, 'quantity', val)}
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
                  value={it.unitId}
                  onChange={(val) => updateItem(it.id, 'unitId', val)}
                  unitOptions={unitOptions}
                  asModal={true}
                />
              </div>

              {/* Negozio con modale centrata */}
              <ShoppingSupplierSelect
                value={it.supplierId}
                onChange={(val) => updateItem(it.id, 'supplierId', val)}
                suppliers={suppliers}
                asModal={true}
              />

              {/* Marca */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Marca
                </label>
                <ShoppingBrandAutocomplete
                  value={it.brandName}
                  onChange={(brandName, brand) => {
                    updateItem(it.id, 'brandName', brandName);
                    updateItem(it.id, 'brandId', brand?.id ? String(brand.id) : '');
                  }}
                  brands={brands}
                  placeholder="Seleziona o digita marca..."
                />
              </div>

              {/* Data & Offerta */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex-1">
                  <DatePicker
                    value={it.purchaseDate}
                    onChange={(newDate: string) => {
                      updateItem(it.id, 'purchaseDate', newDate);
                      setDatePickerItemId(null);
                    }}
                    isOpen={datePickerItemId === it.id}
                    onClose={() => setDatePickerItemId(null)}
                    onToggle={() => setDatePickerItemId((prev) => (prev === it.id ? null : it.id))}
                    overlay={true}
                  />
                </div>

                <label className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={it.isOnSale}
                    onChange={(e) => updateItem(it.id, 'isOnSale', e.target.checked)}
                    className="w-3.5 h-3.5 text-blue-600 rounded"
                  />
                  <span className="text-xs font-bold text-gray-700">In Offerta 🏷️</span>
                </label>
              </div>

            </div>
          ))}
        </div>

        {/* Bottone Aggiungi Altro Articolo in stile AddButton */}
        <div className="pt-1">
          <AddButton
            label="Aggiungi un altro prodotto al lotto"
            onClick={handleAddItem}
          />
        </div>

      </form>
    </MobileBaseModal>
  );
};

export default MobileShoppingQuickPriceModal;
