// src/mobile/components/modals/shopping/MobileSupplierModal.tsx
import React, { useState, useEffect } from 'react';
import MobileBaseModal from '../MobileBaseModal';
import { StoreIcon } from '@/components/shared/utils/Icons';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import type { ConfigOption, ShoppingConfigBundle, ShoppingSupplierOption } from '@/types/shopping';

interface MobileSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierToEdit?: ShoppingSupplierOption | null;
  config?: ShoppingConfigBundle | null;
  isSuperuser?: boolean;
}

export const MobileSupplierModal: React.FC<MobileSupplierModalProps> = ({
  isOpen,
  onClose,
  supplierToEdit,
  config,
  isSuperuser = false,
}) => {
  const mutations = useShoppingMutations();
  const isEdit = Boolean(supplierToEdit);

  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supplierStatusOptions: ConfigOption[] = config?.supplierStatusOptions ?? [];

  useEffect(() => {
    if (supplierToEdit) {
      setName(supplierToEdit.nameNormalized || supplierToEdit.name || '');
      const activeState =
        supplierToEdit.isActive ??
        (supplierToEdit.statusId == null ||
          supplierToEdit.statusId === 1 ||
          supplierToEdit.statusCodeName?.toLowerCase() === 'active');
      setIsActive(activeState);
    } else {
      setName('');
      setIsActive(true);
    }
  }, [supplierToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const activeOpt = supplierStatusOptions.find(
      (o) => o.codeValue?.toLowerCase() === 'active' || o.codeName?.toLowerCase() === 'active'
    );
    const inactiveOpt = supplierStatusOptions.find(
      (o) => o.codeValue?.toLowerCase() === 'inactive' || o.codeName?.toLowerCase() === 'inactive'
    );

    const resolvedStatusId = isActive
      ? activeOpt ? Number(activeOpt.id) : 1
      : inactiveOpt ? Number(inactiveOpt.id) : 2;

    setIsSubmitting(true);
    try {
      if (isEdit && supplierToEdit) {
        await mutations.updateSupplier({
          id: supplierToEdit.id,
          data: {
            nameNormalized: name.trim(),
            statusId: resolvedStatusId,
          },
        });
      } else {
        await mutations.createSupplier({
          nameNormalized: name.trim(),
          statusId: resolvedStatusId,
        });
      }
      onClose();
    } catch {
      // Toast gestito dalle mutazioni
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <StoreIcon className="w-5 h-5 text-orange-600" />
          <span>{isEdit ? 'Modifica Negozio' : 'Nuovo Negozio'}</span>
        </div>
      }
      formId="mobile-supplier-form"
      confirmText={isEdit ? 'Salva Modifiche' : 'Crea Negozio'}
      isConfirmDisabled={!name.trim()}
      isLoading={isSubmitting}
    >
      <form
        id="mobile-supplier-form"
        onSubmit={handleSubmit}
        className="space-y-4 pb-4 animate-fadeIn"
      >
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Nome Negozio
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es. Coop, Esselunga, Lidl, Macelleria Rossi..."
            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
            autoFocus
          />
        </div>

        {isSuperuser && (
          <div className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-200/80 rounded-xl shadow-2xs">
            <input
              type="checkbox"
              id="mobile-supplier-is-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4.5 h-4.5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="mobile-supplier-is-active" className="cursor-pointer select-none">
              <span className="block text-xs font-bold text-gray-800">Negozio Attivo</span>
              <span className="block text-[11px] text-gray-400">
                Deseleziona se il negozio ha chiuso o non viene più utilizzato.
              </span>
            </label>
          </div>
        )}
      </form>
    </MobileBaseModal>
  );
};

export default MobileSupplierModal;
