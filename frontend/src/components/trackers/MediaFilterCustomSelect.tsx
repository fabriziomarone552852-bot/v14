import React, { useState, useEffect } from 'react';
import { DropdownIcon } from '@/components/shared/utils/Icons';
import { useOutsideClick } from '@/hooks/useOutsideClick';

export interface CustomSelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  label: string;
  value: string;
  options: CustomSelectOption[];
  onChange: (val: string) => void;
  allLabel?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  options,
  onChange,
  allLabel = 'Tutti',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const selectedName = value !== 'all' ? options.find((o) => o.value === value)?.label || value : allLabel;
  
  const ref = useOutsideClick<HTMLDivElement>(() => {
    if (isOpen) setIsOpen(false);
  });

  useEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 220); 
    }
  }, [isOpen]);

  return (
    <div ref={ref}>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs transition-colors cursor-pointer outline-none ${
            value !== 'all'
              ? 'border-blue-300 bg-blue-50/50 text-blue-900 font-bold'
              : 'border-gray-200 bg-white text-gray-700 font-normal hover:border-gray-300'
          }`}
        >
          <span className="truncate">{selectedName}</span>
          <DropdownIcon className="w-4 h-4 text-gray-400 shrink-0 ml-2" isDropdownOpen={isOpen} />
        </button>

        {isOpen && (
          <div className={`absolute z-[100] w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 max-h-60 overflow-y-auto custom-scrollbar animate-fadeIn ${
            openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}>
            <button
              type="button"
              onClick={() => { onChange('all'); setIsOpen(false); }}
              className={`w-full px-3 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                value === 'all' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              <span>{allLabel}</span>
            </button>

            {options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className={`w-full px-3 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    isSelected ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;
