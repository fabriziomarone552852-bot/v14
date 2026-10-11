import React, { useState, useMemo } from 'react';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { DropdownIcon } from '@/components/shared/utils/Icons';
import { SelectModalDialog } from '@/components/shared/form';
import type { ConfigOption } from '@/types/shopping';

import {
  getUnitDisplayName,
  sortShoppingUnitOptions,
} from '@/utils/shoppingUnitUtils';
export type { UnitDefinition } from '@/utils/shoppingUnitUtils';
export {
  UNIT_DICTIONARY,
  CANONICAL_UNIT_KEYS,
  ORDERED_UNIT_KEYS,
  getUnitDisplayName,
  formatUnitForQuantity,
  sortShoppingUnitOptions,
} from '@/utils/shoppingUnitUtils';

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

  const { canonicalOptions, commonOptions } = useMemo(() => {
    return sortShoppingUnitOptions(unitOptions);
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

            {/* Gruppo 1: Unità Canoniche (Pesi/Masse, Liquidi/Volumi, Lunghezze) */}
            {canonicalOptions.map((opt) => {
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

            {/* Linea di confine tra gruppi canonici e gruppo comune */}
            {canonicalOptions.length > 0 && commonOptions.length > 0 && (
              <div className="my-1 border-t border-gray-200/80" />
            )}

            {/* Gruppo 2: Unità Comuni in ordine alfabetico */}
            {commonOptions.map((opt) => {
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
      <SelectModalDialog
        isOpen={asModal && isOpen && !disabled}
        onClose={() => setIsOpen(false)}
        title="Unità di Misura"
      >
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

        {/* Gruppo 1: Unità Canoniche */}
        {canonicalOptions.map((opt) => {
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

        {/* Linea di confine tra gruppi canonici e gruppo comune */}
        {canonicalOptions.length > 0 && commonOptions.length > 0 && (
          <div className="my-2 border-t border-gray-200" />
        )}

        {/* Gruppo 2: Unità Comuni in ordine alfabetico */}
        {commonOptions.map((opt) => {
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
      </SelectModalDialog>
    </>
  );
};

export default ShoppingUnitSelect;
