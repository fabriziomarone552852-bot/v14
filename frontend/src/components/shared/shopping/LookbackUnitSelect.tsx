import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { DropdownIcon } from '@/components/shared/utils/Icons';

export type LookbackUnit = 'days' | 'months' | 'years';

interface LookbackUnitSelectProps {
  value: LookbackUnit;
  onChange: (val: LookbackUnit) => void;
  className?: string;
}

const unitLabels: Record<LookbackUnit, string> = {
  days: 'Giorni',
  months: 'Mesi',
  years: 'Anni',
};

export const LookbackUnitSelect: React.FC<LookbackUnitSelectProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const { openUpwards, coords } = useDropdownPosition(buttonRef, {
    isOpen,
    threshold: 150,
  });

  const dropdownRef = useOutsideClick<HTMLDivElement>((e: MouseEvent | TouchEvent) => {
    if (buttonRef.current && buttonRef.current.contains(e.target as Node)) {
      return;
    }
    setIsOpen(false);
  });

  const options: LookbackUnit[] = ['days', 'months', 'years'];

  return (
    <div className={`relative ${className}`}>
      <div
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-500 rounded-lg text-xs font-semibold text-slate-700 transition-colors outline-none cursor-pointer flex justify-between items-center shadow-2xs"
      >
        <span className="truncate">{unitLabels[value] || 'Seleziona...'}</span>
        <DropdownIcon isDropdownOpen={isOpen} />
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: openUpwards ? 'auto' : `${coords.top + 4}px`,
              bottom: openUpwards ? `${coords.bottom + 4}px` : 'auto',
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }}
            className="bg-white border border-slate-100 rounded-xl shadow-2xl py-1 animate-fadeIn overflow-hidden"
          >
            {options.map((opt) => {
              const isSelected = value === opt;
              return (
                <div
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 text-xs font-semibold cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'text-blue-700 bg-blue-50/70 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>{unitLabels[opt]}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};

export default LookbackUnitSelect;
