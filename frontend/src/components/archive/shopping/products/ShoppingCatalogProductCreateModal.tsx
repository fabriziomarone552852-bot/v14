// src/components/archive/shopping/products/ShoppingCatalogProductCreateModal.tsx
import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import BaseModal from '@/components/shared/dialog/BaseModal';
import MobileBaseModal from '@/mobile/components/modals/MobileBaseModal';
import { ShoppingIcon } from '@/components/shared/utils/Icons';
import { createShoppingProduct, shoppingQueryKeys } from '@/api/shoppingApi';

interface ShoppingCatalogProductCreateModalProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
}

export const ShoppingCatalogProductCreateModal: React.FC<
  ShoppingCatalogProductCreateModalProps
> = ({ isOpen, isMobile, onClose }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg('Inserisci il nome del prodotto.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await createShoppingProduct({ name: trimmed });
      await queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.products() });
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : 'Errore durante la creazione del prodotto.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleNode = (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-xl bg-lime-50 border border-lime-200 text-lime-700 flex items-center justify-center shrink-0">
        <ShoppingIcon className="w-4 h-4" />
      </div>
      <span className="text-base font-extrabold text-slate-900">Nuovo Prodotto</span>
    </div>
  );

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Nome Prodotto (Catalogo)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errorMsg) setErrorMsg(null);
          }}
          placeholder="Es. Latte intero, Pasta, Detersivo piatti..."
          autoFocus
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        <p className="text-[11px] text-slate-400 mt-1.5">
          Usa il nome canonico senza marca (i marchi si associano separatamente).
        </p>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {errorMsg}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          {isSubmitting ? 'Salvataggio...' : 'Crea Prodotto'}
        </button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <MobileBaseModal isOpen={isOpen} onClose={onClose} title={titleNode}>
        {formContent}
      </MobileBaseModal>
    );
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={titleNode} maxWidthClass="max-w-md">
      {formContent}
    </BaseModal>
  );
};

export default ShoppingCatalogProductCreateModal;
