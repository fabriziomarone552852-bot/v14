// src/components/shared/shopping/ShoppingSupplierSelect.tsx
import React, { useState, useEffect } from 'react';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { PlusIcon, DropdownIcon, StoreIcon } from '@/components/shared/utils/Icons';
import type { ShoppingSupplierOption } from '@/types/shopping';
import { createShoppingSupplier } from '@/api/shoppingApi';
import BaseModal from '@/components/shared/dialog/BaseModal';

interface ShoppingSupplierSelectProps {
  value: string; // supplierId come stringa, oppure ""
  onChange: (val: string) => void;
  suppliers: ShoppingSupplierOption[];
  onSupplierCreated?: (newSupplier: ShoppingSupplierOption) => void;
  disabled?: boolean;
}

export const ShoppingSupplierSelect: React.FC<ShoppingSupplierSelectProps> = ({
  value,
  onChange,
  suppliers,
  onSupplierCreated,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ref = useOutsideClick<HTMLDivElement>(() => setIsOpen(false));

  useEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 220);
    }
  }, [isOpen]);

  const selectedSupplier = suppliers.find((s) => String(s.id) === value);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createShoppingSupplier({ name: newSupplierName.trim() });
      if (onSupplierCreated) {
        onSupplierCreated(created);
      }
      onChange(String(created.id));
      setIsCreateModalOpen(false);
      setNewSupplierName('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore nella creazione del negozio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full" ref={ref}>
      {/* Header Etichetta con Tasto + a destra */}
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-bold text-gray-500 uppercase">
          Negozio
        </label>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setIsCreateModalOpen(true);
          }}
          disabled={disabled}
          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
          title="Aggiungi nuovo negozio"
        >
          <PlusIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Select Box */}
      <div className="relative">
        <div
          onClick={() => {
            if (!disabled) setIsOpen(!isOpen);
          }}
          className={`w-full px-3 py-2 bg-white border border-gray-200 hover:border-blue-500 rounded-xl text-xs font-semibold transition-colors outline-none cursor-pointer flex justify-between items-center shadow-xs ${
            disabled ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          <span className="truncate text-gray-700 flex items-center gap-1.5">
            <StoreIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">
              {selectedSupplier ? selectedSupplier.name : 'Seleziona negozio (opzionale)'}
            </span>
          </span>
          <DropdownIcon isDropdownOpen={isOpen} />
        </div>

        {isOpen && !disabled && (
          <div
            className={`absolute z-[100] w-full min-w-[200px] bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-fadeIn max-h-56 overflow-y-auto custom-scrollbar ${
              openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
            }`}
          >
            {/* Opzione Nessun Negozio */}
            <div
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors hover:bg-gray-50 flex items-center justify-between ${
                !value ? 'text-blue-600 bg-blue-50/50 font-bold' : 'text-gray-500 italic'
              }`}
            >
              <span>Nessun negozio specificato</span>
              {!value && <span className="text-blue-600 font-bold">✓</span>}
            </div>

            {suppliers.map((s) => {
              const isSelected = String(s.id) === value;
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onChange(String(s.id));
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors hover:bg-gray-50 flex items-center justify-between ${
                    isSelected ? 'text-blue-600 bg-blue-50/50 font-bold' : 'text-gray-700'
                  }`}
                >
                  <span className="truncate">{s.name}</span>
                  {isSelected && <span className="text-blue-600 font-bold">✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modale Rapido Creazione Nuovo Negozio */}
      {isCreateModalOpen && (
        <BaseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={
            <span className="flex items-center gap-2 text-base font-bold text-gray-800">
              <StoreIcon className="w-5 h-5 text-blue-600" />
              <span>Nuovo Negozio</span>
            </span>
          }
          formId="create-supplier-form"
          confirmText={isSubmitting ? 'Salvataggio...' : 'Crea Negozio'}
          cancelText="Annulla"
          isConfirmDisabled={isSubmitting || !newSupplierName.trim()}
          maxWidthClass="max-w-sm"
        >
          <form id="create-supplier-form" onSubmit={handleCreateSupplier} className="space-y-3">
            {error && (
              <div className="rounded-xl bg-red-50 p-2.5 text-xs font-medium text-red-600">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Nome Negozio
              </label>

              <input
                type="text"
                autoFocus
                required
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                placeholder="Es. Esselunga, Conad, Coop..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </form>
        </BaseModal>
      )}
    </div>
  );
};

export default ShoppingSupplierSelect;
