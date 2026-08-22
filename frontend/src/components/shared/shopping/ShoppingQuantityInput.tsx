// src/components/shared/shopping/ShoppingQuantityInput.tsx
import React from 'react';

interface ShoppingQuantityInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const ShoppingQuantityInput: React.FC<ShoppingQuantityInputProps> = ({
  value,
  onChange,
  placeholder = 'Qtà',
  disabled = false,
  className = '',
  id,
}) => {
  const handleStep = (direction: 'up' | 'down') => {
    if (disabled) return;
    const currentStr = (value || '').replace(',', '.').trim();
    const currentNum = currentStr ? parseFloat(currentStr) : 0;
    if (isNaN(currentNum)) {
      onChange(direction === 'up' ? '1' : '');
      return;
    }

    let nextNum: number;
    if (direction === 'up') {
      nextNum = currentNum + 1;
    } else {
      nextNum = Math.max(0, currentNum - 1);
    }

    // Arrotonda per evitare artefatti di floating point come 5.500000000000001
    const rounded = Math.round(nextNum * 100) / 100;
    onChange(rounded > 0 ? String(rounded) : '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleStep('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleStep('down');
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          // Permette solo numeri, virgola e punto
          const val = e.target.value.replace(/[^0-9.,]/g, '');
          onChange(val);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-[38px] px-3 py-2 pr-7 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"

      />

      {/* Mini Stepper Buttons */}
      <div className="absolute right-1.5 inset-y-0 flex flex-col justify-center gap-0.5 py-1">
        <button
          type="button"
          tabIndex={-1}
          onClick={() => handleStep('up')}
          disabled={disabled}
          className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition flex items-center justify-center leading-none disabled:opacity-40 cursor-pointer"
          title="Aumenta di 1"
        >
          <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor">
            <path d="M5 2L1 7h8L5 2z" />
          </svg>
        </button>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => handleStep('down')}
          disabled={disabled}
          className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition flex items-center justify-center leading-none disabled:opacity-40 cursor-pointer"
          title="Diminuisci di 1"
        >
          <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor">
            <path d="M5 8L9 3H1l4 5z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ShoppingQuantityInput;
