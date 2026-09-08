// src/components/shared/shopping/ShoppingUnitSelect.tsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { DropdownIcon, CloseIcon } from '@/components/shared/utils/Icons';
import type { ConfigOption } from '@/types/shopping';

import { UNIT_DICTIONARY, ORDERED_UNIT_KEYS, getUnitDisplayName } from '@/utils/shoppingUnitUtils';
export type { UnitDefinition } from '@/utils/shoppingUnitUtils';
export { UNIT_DICTIONARY, ORDERED_UNIT_KEYS, getUnitDisplayName, formatUnitForQuantity } from '@/utils/shoppingUnitUtils';

interface ShoppingUnitSelectProps {
  value: string; // unitId come stringa, oppure ""
  onChange: (val: string) => void;
  unitOptions: ConfigOption[];
  disabled?: boolean;
  className?: string;
  compact?: boolean;
  asModal?: boolean;
}

import { useDropdownPosition } from '@/hooks/useDropdownPosition';

export const ShoppingUnitSelect: React.FC<ShoppingUnitSelectProps> = ({
  value,
  onChange,
  unitOptions,
  disabled = false,
  className = '',
  compact = false,
  asModal = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const ref = useOutsideClick<HTMLDivElement>(() => {
    if (!asModal) setIsOpen(false);
  });
  const { openUpwards } = useDropdownPosition(ref, { isOpen, threshold: 220 });

  const sortedOptions = useMemo(() => {
    return [...unitOptions].sort((a, b) => {
      const valA = (a.codeValue || a.codeName || '').toLowerCase().replace(/^unit\./i, '').trim();
      const valB = (b.codeValue || b.codeName || '').toLowerCase().replace(/^unit\./i, '').trim();
      const keyA = UNIT_DICTIONARY[valA]?.singular || valA;
      const keyB = UNIT_DICTIONARY[valB]?.singular || valB;
      const idxA = ORDERED_UNIT_KEYS.indexOf(keyA);
      const idxB = ORDERED_UNIT_KEYS.indexOf(keyB);
      const posA = idxA === -1 ? 999 : idxA;
      const posB = idxB === -1 ? 999 : idxB;
      return posA - posB;
    });
  }, [unitOptions]);

  const selectedOption = unitOptions.find((opt) => String(opt.id) === value);
  const selectedLabel = selectedOption ? getUnitDisplayName(selectedOption) : 'Unità';

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <>
      <div className={`relative ${className}`} ref={ref}>
        <div
          onClick={() => {
            if (!disabled) setIsOpen(!isOpen);
          }}
          className={`w-full bg-white border border-gray-200 hover:border-blue-500 rounded-xl text-xs font-semibold transition-colors outline-none cursor-pointer flex justify-between items-center gap-1 shadow-xs ${
            compact ? 'h-[34px] px-2 py-1.5 min-w-[70px]' : 'h-[38px] px-3 py-2'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          title="Seleziona unità di misura"
        >
          <span className="truncate text-gray-700 capitalize">{selectedLabel}</span>
          <DropdownIcon isDropdownOpen={isOpen} />
        </div>

        {/* Modalità Dropdown Classica */}
        {!asModal && isOpen && !disabled && (
          <div
            className={`absolute z-[100] w-full min-w-[160px] bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-fadeIn max-h-56 overflow-y-auto custom-scrollbar ${
              openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
            }`}
          >
            {/* Opzione vuota / Nessuna unità */}
            <div
              onClick={() => handleSelect('')}
              className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors hover:bg-gray-50 flex items-center justify-between ${
                !value ? 'text-blue-600 bg-blue-50/50 font-bold' : 'text-gray-500 italic'
              }`}
            >
              <span>Nessuna unità</span>
              {!value && <span className="text-blue-600 font-bold">✓</span>}
            </div>

            {sortedOptions.map((opt) => {
              const isSelected = String(opt.id) === value;
              const displayName = getUnitDisplayName(opt);

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(String(opt.id))}
                  className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors hover:bg-gray-50 flex items-center justify-between ${
                    isSelected ? 'text-blue-600 bg-blue-50/50 font-bold' : 'text-gray-700'
                  }`}
                >
                  <span className="capitalize">{displayName}</span>
                  {isSelected && <span className="text-blue-600 font-bold">✓</span>}
                </div>
              );
            })}
          </div>
        )}
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
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                  Unità di Misura
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                  title="Chiudi"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Elenco Unità di Misura con Nomi Estesi */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-1.5 pr-0.5">
                {/* Opzione Nessuna Unità */}
                <button
                  type="button"
                  onClick={() => handleSelect('')}
                  className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between border cursor-pointer active:scale-[0.98] ${
                    !value
                      ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/20 font-bold text-blue-900'
                      : 'bg-gray-50/80 hover:bg-gray-100 border-gray-200/80 text-gray-600 italic font-medium'
                  }`}
                >
                  <span className="text-xs">Nessuna unità</span>
                  {!value && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      ✓
                    </div>
                  )}
                </button>

                {sortedOptions.map((opt) => {
                  const isSelected = String(opt.id) === value;
                  const displayName = getUnitDisplayName(opt);

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelect(String(opt.id))}
                      className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between border cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/20 font-bold text-blue-900'
                          : 'bg-gray-50/80 hover:bg-gray-100 border-gray-200/80 text-gray-800 font-medium'
                      }`}
                    >
                      <span className="text-xs capitalize">{displayName}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
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
    </>
  );
};

export default ShoppingUnitSelect;
