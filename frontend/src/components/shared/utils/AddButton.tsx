import React from 'react';
import { PlusIcon } from './Icons';

interface AddButtonProps {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  compact?: boolean;
}

export const AddButton: React.FC<AddButtonProps> = ({ 
  label, 
  onClick, 
  className = '',
  compact = false 
}) => (
  <button 
    type="button"
    onClick={onClick} 
    title={label}
    className={`w-full border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 active:scale-95 transition-all flex justify-center items-center font-bold gap-1.5 ${
      compact 
        ? 'py-1 px-2 text-xs rounded-lg' 
        : 'py-2.5 px-3 text-sm rounded-xl gap-2'
    } ${className}`}
  >
    <PlusIcon className={compact ? 'w-3.5 h-3.5 shrink-0' : 'w-4 h-4 shrink-0'} />
    <span className="truncate">{label}</span>
  </button>
);