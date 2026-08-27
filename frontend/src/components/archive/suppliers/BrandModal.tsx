// src/components/archive/suppliers/BrandModal.tsx
import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { TagIcon } from '@/components/shared/utils/Icons';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import type { ShoppingSupplierOption } from '@/types/shopping';

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandToEdit: ShoppingSupplierOption | null;
}

export const BrandModal: React.FC<BrandModalProps> = ({
  isOpen,
  onClose,
  brandToEdit,
}) => {
  const mutations = useShoppingMutations();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (brandToEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset form state when modal opens or edit target changes
      setName(brandToEdit.nameNormalized || brandToEdit.name || '');
    } else {
      setName('');
    }
  }, [brandToEdit, isOpen]);

  if (!isOpen || !brandToEdit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await mutations.updateSupplier({
        id: brandToEdit.id,
        data: {
          nameNormalized: name.trim(),
          typeCode: 2,
        },
      });
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
        form="brand-edit-form"
        disabled={isSubmitting || !name.trim()}
        className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition cursor-pointer shadow-xs"
      >
        {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-indigo-600" />
          <span>Modifica Marchio / Brand</span>
        </div>
      }
      footer={modalFooter}
      formId="brand-edit-form"
      maxWidthClass="max-w-md"
    >
      <form id="brand-edit-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Nome Brand */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Nome Marchio
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es. Barilla, Mulino Bianco, De Cecco, Coca Cola..."
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            autoFocus
          />
        </div>
      </form>
    </BaseModal>
  );
};

export default BrandModal;
