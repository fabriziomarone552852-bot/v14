// src/mobile/components/modals/password/MobilePasswordFieldItem.tsx
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface MobilePasswordFieldItemProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  showPassword: boolean;
  onToggleShow: () => void;
  placeholder: string;
  autoComplete?: string;
  disabled?: boolean;
  isError?: boolean;
  children?: React.ReactNode;
}

export const MobilePasswordFieldItem: React.FC<MobilePasswordFieldItemProps> = ({
  label,
  value,
  onChange,
  showPassword,
  onToggleShow,
  placeholder,
  autoComplete,
  disabled = false,
  isError = false,
  children,
}) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-gray-900 text-sm shadow-xs transition focus:outline-none focus:ring-2 bg-white ${
            isError
              ? 'border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-100'
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
          }`}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {children}
    </div>
  );
};
