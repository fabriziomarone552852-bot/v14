// src/components/shared/shopping/ShoppingCurrencySelect.tsx
import React, { useState, useEffect } from 'react';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import type { ConfigOption } from '@/types/shopping';
import { DropdownIcon } from '@/components/shared/utils/Icons';

export const getCurrencySymbol = (opt?: ConfigOption | null): string => {
  if (!opt) return '€';
  const val = (opt.codeValue || opt.codeName || '').toUpperCase();
  if (val.includes('EUR') || val === '€') return '€';
  if (val.includes('USD') || val === '$') return '$';
  if (val.includes('GBP') || val === '£') return '£';
  if (val.includes('CHF')) return 'CHF';
  return opt.codeValue || opt.codeName || '€';
};

interface ShoppingCurrencySelectProps {
  value: string; // currencyId come stringa
  onChange: (val: string) => void;
  currencyOptions: ConfigOption[];
  disabled?: boolean;
}

export const ShoppingCurrencySelect: React.FC<ShoppingCurrencySelectProps> = ({
  value,
  onChange,
  currencyOptions,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);

  const ref = useOutsideClick<HTMLDivElement>(() => setIsOpen(false));

  useEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 180);
    }
  }, [isOpen]);

  const selectedOption = currencyOptions.find((opt) => String(opt.id) === value);
  const selectedSymbol = getCurrencySymbol(selectedOption);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className="h-full px-2.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        title="Cambia valuta"
      >
        <span>{selectedSymbol}</span>
        <DropdownIcon isDropdownOpen={isOpen} />
      </button>

      {isOpen && !disabled && (
        <div
          className={`absolute z-[110] right-0 min-w-[120px] bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-fadeIn max-h-48 overflow-y-auto custom-scrollbar ${
            openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {currencyOptions.map((opt) => {
            const isSelected = String(opt.id) === value;
            const symbol = getCurrencySymbol(opt);
            const label = opt.codeName || opt.codeValue || symbol;

            return (
              <div
                key={opt.id}
                onClick={() => {
                  onChange(String(opt.id));
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors hover:bg-gray-50 flex items-center justify-between gap-2 ${
                  isSelected ? 'text-blue-600 bg-blue-50/50 font-bold' : 'text-gray-700'
                }`}
              >
                <span className="font-bold">{symbol}</span>
                <span className="text-gray-500 text-[11px] truncate">{label}</span>
                {isSelected && <span className="text-blue-600 font-bold ml-auto">✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShoppingCurrencySelect;
