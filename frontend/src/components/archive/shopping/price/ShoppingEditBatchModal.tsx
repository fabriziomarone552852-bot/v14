import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import BaseModal from '@/components/shared/dialog/BaseModal';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import ShoppingSupplierSelect from '@/components/shared/shopping/ShoppingSupplierSelect';
import { TagIcon } from '@/components/shared/utils/Icons';
import type { ItemBatchRecord, ShoppingSupplierOption } from '@/types/shopping';
import { fetchShoppingSuppliers, shoppingQueryKeys } from '@/api/shoppingApi';
import { useIsMobile } from '@/mobile/hooks/useIsMobile';

export interface ShoppingEditBatchModalProps {
  isOpen: boolean;
  batch: ItemBatchRecord | null;
  onClose: () => void;
  suppliers?: ShoppingSupplierOption[];
  onSave: (batchId: number, data: {
    purchasePrice: number;
    purchaseDate: string;
    quantityPurchased?: number;
    supplierId?: number | null;
    isOnSale: boolean;
  }) => Promise<void>;
  onDelete?: (batchId: number) => Promise<void>;
}

export const ShoppingEditBatchModal: React.FC<ShoppingEditBatchModalProps> = ({
  isOpen,
  batch,
  onClose,
  suppliers = [],
  onSave,
}) => {
  const isMobile = useIsMobile();
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [supplierId, setSupplierId] = useState<string>('');
  const [isOnSale, setIsOnSale] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: fetchedSuppliers = [] } = useQuery<ShoppingSupplierOption[]>({
    queryKey: shoppingQueryKeys.suppliers(),
    queryFn: ({ signal }) => fetchShoppingSuppliers(signal),
    staleTime: 60_000,
    enabled: isOpen,
  });

  const effectiveSuppliers = suppliers.length > 0 ? suppliers : fetchedSuppliers;

  useEffect(() => {
    if (isOpen && batch) {
      setPrice(batch.purchasePrice != null ? String(batch.purchasePrice) : '');
      setDate(batch.purchaseDate || '');
      setQuantity(batch.quantityPurchased != null ? String(batch.quantityPurchased) : '1');
      setSupplierId(batch.supplierId != null ? String(batch.supplierId) : '');
      setIsOnSale(Boolean(batch.isOnSale));
      setError(null);
      setIsSubmitting(false);
      setIsDatePickerOpen(false);
    }
  }, [isOpen, batch]);

  if (!isOpen || !batch) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedPrice = Number(price.replace(',', '.'));
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Inserisci un prezzo valido maggiore di zero.');
      return;
    }

    const parsedQty = Number(quantity.replace(',', '.'));
    if (Number.isNaN(parsedQty) || parsedQty <= 0) {
      setError('Inserisci una quantità valida.');
      return;
    }

    if (!date) {
      setError('Seleziona una data valida.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(batch.id, {
        purchasePrice: parsedPrice,
        purchaseDate: date,
        quantityPurchased: parsedQty,
        supplierId: supplierId ? Number(supplierId) : null,
        isOnSale,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore durante il salvataggio della rilevazione.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-blue-600" />
          <span className="text-base font-bold text-gray-800">Modifica Rilevazione Prezzo</span>
        </div>
      }
      formId="edit-batch-form"
      confirmText={isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
      cancelText="Annulla"
      isConfirmDisabled={isSubmitting}
      maxWidthClass="max-w-md"
      zIndexClass="z-[10020]"
    >
      <form id="edit-batch-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Prezzo e Quantità */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
              Prezzo (€)
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9.,]/g, '').replace(/,/g, '.'))}
              placeholder="es. 2.49"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
              Quantità
            </label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="es. 1"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Data e Negozio */}
        <div className="space-y-3">
          <div>
            <label className="block font-bold text-gray-700 mb-1 uppercase tracking-wider text-[11px]">
              Data Rilevazione
            </label>
            <DatePicker
              value={date}
              onChange={(newDate: string) => {
                setDate(newDate);
                setIsDatePickerOpen(false);
              }}
              isOpen={isDatePickerOpen}
              onClose={() => setIsDatePickerOpen(false)}
              onToggle={() => setIsDatePickerOpen((prev) => !prev)}
              usePortal={true}
              overlay={isMobile}
            />
          </div>

          <div>
            <ShoppingSupplierSelect
              value={supplierId}
              onChange={(val) => setSupplierId(val)}
              suppliers={effectiveSuppliers}
              hideLabel={false}
              asModal={isMobile}
            />
          </div>
        </div>

        {/* Offerta / In Promozione */}
        <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isOnSale}
            onChange={(e) => setIsOnSale(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="font-semibold text-gray-700">Prezzo in Offerta / Promozione</span>
        </label>
      </form>
    </BaseModal>
  );
};

export default ShoppingEditBatchModal;
