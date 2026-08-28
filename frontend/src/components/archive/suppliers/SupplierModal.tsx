// src/components/archive/suppliers/SupplierModal.tsx
import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { StoreIcon } from '@/components/shared/utils/Icons';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import type { ConfigOption, ShoppingConfigBundle, ShoppingSupplierOption } from '@/types/shopping';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierToEdit?: ShoppingSupplierOption | null;
  config?: ShoppingConfigBundle | null;
  isSuperuser?: boolean;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset form state when modal opens or edit target changes
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

    // Ricerca ID di stato attivo o inattivo dal bundle di config
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


  const modalFooter = (
    <div className="flex items-center justify-end gap-2 w-full">
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
      >
        Annulla
      </button>

      <button
        type="submit"
        form="supplier-form"
        disabled={isSubmitting || !name.trim()}
        className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition cursor-pointer shadow-xs"
      >
        {isSubmitting ? 'Salvataggio...' : isEdit ? 'Salva Modifiche' : 'Crea Negozio'}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <StoreIcon className="w-5 h-5 text-orange-600" />
          <span>{isEdit ? 'Modifica Fornitore' : 'Nuovo Negozio / Fornitore'}</span>
        </div>
      }
      footer={modalFooter}
      formId="supplier-form"
      maxWidthClass="max-w-md"
    >
      <form id="supplier-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Nome fornitore */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Nome Negozio
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es. Coop, Esselunga, Lidl, Macelleria Rossi..."
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            autoFocus
          />
        </div>

        {/* Checkbox Stato Attivo (Visibile solo per Superuser) */}
        {isSuperuser && (
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            <input
              type="checkbox"
              id="supplier-is-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="supplier-is-active" className="cursor-pointer select-none">
              <span className="block text-xs font-bold text-slate-800">Negozio Attivo</span>
              <span className="block text-[11px] text-slate-400">
                Deseleziona se il negozio ha chiuso o non viene più utilizzato.
              </span>
            </label>
          </div>
        )}
      </form>
    </BaseModal>
  );
};

export default SupplierModal;
