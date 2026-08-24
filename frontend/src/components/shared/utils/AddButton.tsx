// src/components/shared/utils/AddButton.tsx
import React from 'react';
import { PlusIcon } from './Icons';

interface AddButtonProps {
  label?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  compact?: boolean;
  iconOnly?: boolean;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export const AddButton: React.FC<AddButtonProps> = ({ 
  label = '', 
  onClick, 
  className = '',
  compact = false,
  iconOnly = false,
  type = 'button',
  disabled = false,
}) => {
  if (iconOnly) {
    return (
      <button 
        type={type}
        onClick={onClick} 
        disabled={disabled}
        title={label || 'Aggiungi'}
        className={`w-9 h-9 border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/60 active:scale-95 transition-all flex justify-center items-center rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <PlusIcon className="w-4 h-4 shrink-0" />
      </button>
    );
  }

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      title={label}
      className={`w-full border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/60 active:scale-[0.98] transition-all flex justify-center items-center font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        compact 
          ? 'py-2 px-2 text-xs rounded-xl min-h-[38px] gap-1' 
          : 'py-3 px-4 text-sm rounded-xl min-h-[46px] gap-2'
      } ${className}`}
    >
      <PlusIcon className="w-4 h-4 shrink-0" />
      {label && <span className="truncate">{label}</span>}
    </button>
  );
};