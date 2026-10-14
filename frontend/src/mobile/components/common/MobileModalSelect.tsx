// src/mobile/components/common/MobileModalSelect.tsx
import React, { useState } from 'react';
import { SelectModalDialog } from '@/components/shared/form/SelectModalDialog';
import { DropdownIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';

export interface MobileModalSelectOption {
  value: string;
  label: string;
}

export interface MobileModalSelectProps {
  label: string;
  title?: string;
  value: string;
  options: MobileModalSelectOption[];
  onChange: (val: string) => void;
  allLabel?: string;
  showAllOption?: boolean;
  disabled?: boolean;
}

/**
 * Standard Mobile UI per selezioni:
 * Sostituisce i dropdown a tendina inline con un selettore touch-friendly
 * che apre una finestra modale centrata (SelectModalDialog) con sfondo oscurato.
 */
export const MobileModalSelect: React.FC<MobileModalSelectProps> = ({
  label,
  title,
  value,
  options,
  onChange,
  allLabel = 'Tutti',
  showAllOption = true,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((o) => o.value === value);
  const selectedName = selectedOption
    ? selectedOption.label
    : value === 'all'
    ? allLabel
    : value;

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
        {label}
      </label>

      {/* Trigger Pulsante Mobile */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs transition-colors cursor-pointer outline-none ${
          value !== 'all'
            ? 'border-blue-300 bg-blue-50/50 text-blue-900 font-bold'
            : 'border-gray-200 bg-white text-gray-700 font-normal hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="truncate">{selectedName}</span>
        <DropdownIcon className="w-4 h-4 text-gray-400 shrink-0 ml-2" isDropdownOpen={isOpen} />
      </button>

      {/* Modale Centrale di Selezione */}
      <SelectModalDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title || `Scegli ${label}`}
        maxWidthClass="max-w-sm"
        zIndex={10040}
      >
        <div className="space-y-1.5 py-1">
          {/* Opzione Globale "Tutti" se allLabel specificato e showAllOption è true */}
          {showAllOption && allLabel && (
            <button
              type="button"
              onClick={() => handleSelect('all')}
              className={`w-full py-3 px-3.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                value === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]'
              }`}
            >
              <span>{allLabel}</span>
              {value === 'all' && (
                <CheckCircleIcon className="w-4 h-4 text-white shrink-0" />
              )}
            </button>
          )}

          {/* Elenco Opzioni */}
          {options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full py-3 px-3.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]'
                }`}
              >
                <span className="truncate mr-2">{opt.label}</span>
                {isSelected && (
                  <CheckCircleIcon className="w-4 h-4 text-white shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </SelectModalDialog>
    </div>
  );
};

export default MobileModalSelect;
