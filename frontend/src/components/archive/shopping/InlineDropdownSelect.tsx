import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DropdownIcon } from '@/components/shared/utils/Icons';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import type { DropdownOption } from './QuickPriceTypes';

export interface InlineDropdownSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  className?: string;
  id?: string;
}

export const InlineDropdownSelect: React.FC<InlineDropdownSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Seleziona...',
  className = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { openUpwards, coords } = useDropdownPosition(buttonRef, {
    isOpen,
    threshold: 200,
  });

  const wrapperRef = useOutsideClick<HTMLDivElement>((e: MouseEvent | TouchEvent) => {
    const target = e.target as Node;
    if (
      (buttonRef.current && buttonRef.current.contains(target)) ||
      (dropdownRef.current && dropdownRef.current.contains(target))
    ) {
      return;
    }
    if (isOpen) setIsOpen(false);
  });

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const dropdownMenu = (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: openUpwards ? 'auto' : `${coords.top + 4}px`,
        bottom: openUpwards ? `${coords.bottom + 4}px` : 'auto',
        left: `${coords.left}px`,
        width: `${Math.max(coords.width, 140)}px`,
        zIndex: 99999,
      }}
      className="bg-white border border-gray-100 rounded-xl shadow-2xl py-1 animate-fadeIn max-h-48 overflow-y-auto divide-y divide-gray-50"
    >
      {options.length === 0 ? (
        <div className="px-3 py-2 text-xs text-gray-400">Nessuna opzione</div>
      ) : (
        options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`px-3 py-2 text-xs cursor-pointer transition-colors flex items-center justify-between ${
                isSelected
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 ml-1" />
              )}
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        id={id}
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-2.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold bg-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition-colors text-left"
      >
        <span className={`truncate ${value ? 'text-slate-800' : 'text-slate-400'}`}>
          {displayLabel}
        </span>
        <DropdownIcon isDropdownOpen={isOpen} className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
      </button>

      {isOpen && createPortal(dropdownMenu, document.body)}
    </div>
  );
};
