// src/components/shared/shopping/ShoppingSupplierSelect.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { PlusIcon, DropdownIcon, StoreIcon, CloseIcon } from '@/components/shared/utils/Icons';
import type { ShoppingSupplierOption } from '@/types/shopping';
import { ShoppingSupplierCreateModal } from './supplier';

export interface ShoppingSupplierSelectProps {
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

  const ref = useOutsideClick<HTMLDivElement>(() => {
    if (!asModal) setIsOpen(false);
  });
  const { openUpwards } = useDropdownPosition(ref, { isOpen, threshold: 220 });

  const selectedSupplier = suppliers.find((s) => String(s.id) === value);

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
            className={`w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between transition-all cursor-pointer select-none ${
              disabled
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:bg-white hover:border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <StoreIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <span className={`truncate text-sm ${selectedSupplier ? 'font-semibold text-gray-800' : 'text-gray-400'}`} title={selectedSupplier?.name}>
                {selectedSupplier ? selectedSupplier.name : 'Seleziona negozio...'}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-1">
              {selectedSupplier && !disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange('');
                  }}
                  className="p-0.5 text-gray-300 hover:text-gray-500 rounded-md transition cursor-pointer"
                  title="Rimuovi negozio"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              )}
              <DropdownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* Menu a Discesa (Inline Desktop o Relativo) */}
          {isOpen && !asModal && (
            <div
              className={`absolute z-50 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-fadeIn ${
                openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
              }`}
            >
              <div className="max-h-48 overflow-y-auto p-1 space-y-0.5 custom-scrollbar">
                <div
                  onClick={() => handleSelect('')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition ${
                    !value ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Nessun negozio selezionato
                </div>

                {suppliers.map((s) => {
                  const isSelected = String(s.id) === value;
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelect(String(s.id))}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer flex items-center justify-between transition min-w-0 ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate min-w-0 flex-1" title={s.name}>{s.name}</span>
                      {isSelected && <span className="text-blue-600 text-xs shrink-0 ml-1">✓</span>}
                    </div>
                  );
                })}
              </div>

              <div className="p-1.5 border-t border-gray-100 bg-gray-50/70">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsCreateModalOpen(true);
                  }}
                  className="w-full py-1.5 px-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Crea Nuovo Negozio</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modale Bottom Sheet Mobile (se asModal è true) */}
      {isOpen && asModal && (
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center animate-fadeIn"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[80vh] flex flex-col animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-800">Seleziona Negozio</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-2 space-y-1">
                <button
                  type="button"
                  onClick={() => handleSelect('')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    !value ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Nessun negozio selezionato
                </button>
                {suppliers.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelect(String(s.id))}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between min-w-0 ${
                      String(s.id) === value
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-gray-700 hover:bg-gray-50 font-medium'
                    }`}
                  >
                    <span className="truncate min-w-0 flex-1" title={s.name}>{s.name}</span>
                    {String(s.id) === value && <span className="text-blue-600 shrink-0 ml-1">✓</span>}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsCreateModalOpen(true);
                  }}
                  className="w-full py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Nuovo Negozio</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      )}

      {/* Modale Creazione Negozio */}
      <ShoppingSupplierCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSupplierCreated={onSupplierCreated}
        onSelectSupplier={(newId) => onChange(newId)}
      />
    </>
  );
};

export default ShoppingSupplierSelect;
