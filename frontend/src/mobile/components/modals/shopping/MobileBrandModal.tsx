// src/mobile/components/modals/shopping/MobileBrandModal.tsx
import React, { useState, useEffect } from 'react';
import MobileBaseModal from '../MobileBaseModal';
import { TagIcon } from '@/components/shared/utils/Icons';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import type { ShoppingSupplierOption } from '@/types/shopping';

interface MobileBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandToEdit: ShoppingSupplierOption | null;
}

export const MobileBrandModal: React.FC<MobileBrandModalProps> = ({
  isOpen,
  onClose,
  brandToEdit,
}) => {
  const mutations = useShoppingMutations();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (brandToEdit) {
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

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-indigo-600" />
          <span>Modifica Marchio / Brand</span>
        </div>
      }
      formId="mobile-brand-form"
      confirmText="Salva Modifiche"
      isConfirmDisabled={!name.trim()}
      isLoading={isSubmitting}
    >
      <form
        id="mobile-brand-form"
        onSubmit={handleSubmit}
        className="space-y-4 pb-4 animate-fadeIn"
      >
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Nome Marchio
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es. Barilla, Mulino Bianco, De Cecco, Coca Cola..."
            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
            autoFocus
          />
        </div>
      </form>
    </MobileBaseModal>
  );
};

export default MobileBrandModal;
