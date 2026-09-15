// src/components/shared/shopping/supplier/ShoppingSupplierCreateModal.tsx
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { StoreIcon } from '@/components/shared/utils/Icons';
import type { ShoppingSupplierOption } from '@/types/shopping';
import { createShoppingSupplier, shoppingQueryKeys } from '@/api/shoppingApi';

export interface ShoppingSupplierCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSupplierCreated?: (newSupplier: ShoppingSupplierOption) => void;
  onSelectSupplier: (supplierIdStr: string) => void;
  zIndexClass?: string;
}

export const ShoppingSupplierCreateModal: React.FC<ShoppingSupplierCreateModalProps> = ({
  isOpen,
  onClose,
  onSupplierCreated,
  onSelectSupplier,
  zIndexClass = 'z-[20000]',
}) => {
  const queryClient = useQueryClient();
  const [newSupplierName, setNewSupplierName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createShoppingSupplier({
        name: newSupplierName.trim(),
        nameNormalized: newSupplierName.trim(),
        typeCode: 1,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.suppliers() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.config() }),
      ]);

      if (onSupplierCreated) {
        onSupplierCreated(created);
      }
      onSelectSupplier(String(created.id));
      setNewSupplierName('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore nella creazione del negozio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      zIndexClass={zIndexClass}
      title={
        <div className="flex items-center gap-2">
          <StoreIcon className="w-5 h-5 text-blue-600" />
          <span className="text-base font-bold text-gray-800">Nuovo Negozio</span>
        </div>
      }
      maxWidthClass="max-w-md"
    >
      <form onSubmit={handleCreateSupplier} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Nome Negozio / Supermercato <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={newSupplierName}
            onChange={(e) => setNewSupplierName(e.target.value)}
            placeholder="Es. Esselunga, Conad, Amazon..."
            className="w-full px-3.5 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden font-medium text-gray-800"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !newSupplierName.trim()}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Salvataggio...' : 'Crea Negozio'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};
