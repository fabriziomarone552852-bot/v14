// src/components/shared/shopping/ShoppingUnitSelect.tsx
import React, { useState, useMemo } from 'react';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { DropdownIcon } from '@/components/shared/utils/Icons';
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
}

import { useDropdownPosition } from '@/hooks/useDropdownPosition';

export const ShoppingUnitSelect: React.FC<ShoppingUnitSelectProps> = ({
  value,
  onChange,
  unitOptions,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const ref = useOutsideClick<HTMLDivElement>(() => setIsOpen(false));
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

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full h-[38px] px-3 py-2 bg-white border border-gray-200 hover:border-blue-500 rounded-xl text-xs font-semibold transition-colors outline-none cursor-pointer flex justify-between items-center shadow-xs ${

          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        <span className="truncate text-gray-700 capitalize">{selectedLabel}</span>
        <DropdownIcon isDropdownOpen={isOpen} />
      </div>

      {isOpen && !disabled && (
        <div
          className={`absolute z-[100] w-full min-w-[160px] bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-fadeIn max-h-56 overflow-y-auto custom-scrollbar ${
            openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {/* Opzione vuota / Nessuna unità */}
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
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
                onClick={() => {
                  onChange(String(opt.id));
                  setIsOpen(false);
                }}
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
  );
};

export default ShoppingUnitSelect;
