// src/components/shared/shopping/ShoppingSupplierSelect.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { PlusIcon, DropdownIcon, StoreIcon, CloseIcon } from '@/components/shared/utils/Icons';
import type { ShoppingSupplierOption } from '@/types/shopping';
import { createShoppingSupplier } from '@/api/shoppingApi';
import BaseModal from '@/components/shared/dialog/BaseModal';

interface ShoppingSupplierSelectProps {
  value: string; // supplierId come stringa, oppure ""
  onChange: (val: string) => void;
  suppliers: ShoppingSupplierOption[];
  onSupplierCreated?: (newSupplier: ShoppingSupplierOption) => void;
  disabled?: boolean;
  className?: string;
  asModal?: boolean;
  hideLabel?: boolean;
}

export const ShoppingSupplierSelect: React.FC<ShoppingSupplierSelectProps> = ({
  value,
  onChange,
  suppliers,
  onSupplierCreated,
  disabled = false,
  className = '',
  asModal = false,
  hideLabel = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ref = useOutsideClick<HTMLDivElement>(() => {
    if (!asModal) setIsOpen(false);
  });
  const { openUpwards } = useDropdownPosition(ref, { isOpen, threshold: 220 });

  const selectedSupplier = suppliers.find((s) => String(s.id) === value);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createShoppingSupplier({ nameNormalized: newSupplierName.trim() });
      if (onSupplierCreated) {
        onSupplierCreated(created);
      }
      onChange(String(created.id));
      setIsCreateModalOpen(false);
      setNewSupplierName('');
      setIsOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore nella creazione del negozio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <>
      <div className={`w-full ${className}`} ref={ref}>
        {/* Header Etichetta con Tasto + a destra (se non nascosto) */}
        {!hideLabel && (
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-gray-600 uppercase">
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
        )}

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

          {/* Modalità Dropdown Standard */}
          {!asModal && isOpen && !disabled && (
            <div
              className={`absolute z-[100] w-full min-w-[200px] bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-fadeIn max-h-56 overflow-y-auto custom-scrollbar ${
                openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
              }`}
            >
              {/* Opzione Nessun Negozio */}
              <div
                onClick={() => handleSelect('')}
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
                    onClick={() => handleSelect(String(s.id))}
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
      </div>

      {/* Modalità Finestra/Modale a Tutto Schermo al Centro */}
      {asModal && isOpen && !disabled &&
        createPortal(
          <div
            className="fixed inset-0 z-[10030] bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn pointer-events-auto"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-5 space-y-4 border border-gray-100 animate-scaleUp pointer-events-auto max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Finestra */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                  <StoreIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                    Scegli Negozio
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setIsCreateModalOpen(true);
                    }}
                    className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>Nuovo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                    title="Chiudi"
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Elenco Negozi */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-1.5 pr-0.5">
                {/* Opzione Nessun Negozio */}
                <button
                  type="button"
                  onClick={() => handleSelect('')}
                  className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between border cursor-pointer active:scale-[0.98] ${
                    !value
                      ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/20 font-bold text-blue-900'
                      : 'bg-gray-50/80 hover:bg-gray-100 border-gray-200/80 text-gray-600 italic font-medium'
                  }`}
                >
                  <span className="text-xs">Nessun negozio specificato</span>
                  {!value && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      ✓
                    </div>
                  )}
                </button>

                {suppliers.map((s) => {
                  const isSelected = String(s.id) === value;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelect(String(s.id))}
                      className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between border cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/20 font-bold text-blue-900'
                          : 'bg-gray-50/80 hover:bg-gray-100 border-gray-200/80 text-gray-800 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <StoreIcon className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-xs font-bold truncate">{s.name}</span>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ml-2">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modale Rapido Creazione Nuovo Negozio */}
      {isCreateModalOpen && (
        <BaseModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          zIndexClass="z-[10050]"
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
    </>
  );
};

export default ShoppingSupplierSelect;
