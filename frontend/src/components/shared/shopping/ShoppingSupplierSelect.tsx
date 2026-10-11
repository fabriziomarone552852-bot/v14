// src/components/shared/shopping/ShoppingSupplierSelect.tsx
import React, { useState, useRef } from 'react';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { PlusIcon, DropdownIcon, StoreIcon, CloseIcon } from '@/components/shared/utils/Icons';
import { PortalDropdownMenu, SelectModalDialog } from '@/components/shared/form';
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
  usePortal?: boolean;
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
  usePortal = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const ref = useOutsideClick<HTMLDivElement>((e: MouseEvent | TouchEvent) => {
    if (!asModal) {
      if (usePortal && dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
    }
  });

  const { openUpwards, coords } = useDropdownPosition(ref, { isOpen, threshold: 220 });

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

          {/* Menu a Discesa (Portal Overlay o Relativo) */}
          <PortalDropdownMenu
            isOpen={isOpen && !asModal}
            coords={coords}
            openUpwards={openUpwards}
            dropdownRef={dropdownRef}
            usePortal={usePortal}
            zIndex={10030}
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
                    <span className="truncate min-w-0 flex-1" title={s.name}>
                      {s.name}
                    </span>
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
          </PortalDropdownMenu>
        </div>
      </div>

      {/* Modale Overlay Centrato Mobile (se asModal è true) */}
      <SelectModalDialog
        isOpen={isOpen && asModal}
        onClose={() => setIsOpen(false)}
        title="Seleziona Negozio"
        maxWidthClass="max-w-sm sm:max-w-md"
        zIndex={20000}
        footerSlot={
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsCreateModalOpen(true);
            }}
            className="w-full py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Nuovo Negozio</span>
          </button>
        }
      >
        <button
          type="button"
          onClick={() => handleSelect('')}
          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
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
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between min-w-0 transition ${
              String(s.id) === value
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-gray-700 hover:bg-gray-50 font-medium'
            }`}
          >
            <span className="truncate min-w-0 flex-1" title={s.name}>{s.name}</span>
            {String(s.id) === value && <span className="text-blue-600 shrink-0 ml-1">✓</span>}
          </button>
        ))}
      </SelectModalDialog>

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
