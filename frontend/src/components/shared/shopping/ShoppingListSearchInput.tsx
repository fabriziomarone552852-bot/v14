// src/components/shared/shopping/ShoppingListSearchInput.tsx
import React from 'react';
import { SearchIcon, CloseIcon } from '@/components/shared/utils/Icons';

export interface ShoppingListSearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const ShoppingListSearchInput: React.FC<ShoppingListSearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Cerca prodotto nella lista...',
}) => {
  return (
    <div className="shrink-0 w-full">
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <SearchIcon className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 bg-gray-50 hover:bg-gray-100/80 focus:bg-white text-xs font-medium text-gray-800 placeholder-gray-400 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
            title="Azzera ricerca"
          >
            <CloseIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
