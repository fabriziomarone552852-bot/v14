// src/components/archive/common/ArchiveFilterSearchInput.tsx
import React from 'react';
import { SearchIcon, CloseIcon } from '@/components/shared/utils/Icons';

export interface ArchiveFilterSearchInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ArchiveFilterSearchInput: React.FC<ArchiveFilterSearchInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Cerca...',
}) => {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <SearchIcon className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors"
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
