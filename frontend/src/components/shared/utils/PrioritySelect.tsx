import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { DropdownIcon, CloseIcon, CheckCircleIcon } from './Icons'; 

interface PrioritySelectProps {
  value: 'Alta' | 'Media' | 'Bassa';
  onChange: (val: 'Alta' | 'Media' | 'Bassa') => void;
  overlay?: boolean; // Apre il menu come modale centrato in overlay sullo schermo
}

const PrioritySelect: React.FC<PrioritySelectProps> = ({ 
  value, 
  onChange,
  overlay = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  
  const ref = useOutsideClick<HTMLDivElement>(() => {
    if (overlay) return;
    if (isOpen) setIsOpen(false);
  });

  useEffect(() => {
    if (isOpen && !overlay && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 150); 
    }
  }, [isOpen, overlay, ref]);

  const dotStyles = { Alta: 'bg-red-500', Media: 'bg-orange-500', Bassa: 'bg-yellow-500' };

  const standardDropdown = (
    <div className={`absolute z-[100] w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-fadeIn ${
      openUpwards ? 'bottom-full mb-2' : 'top-full mt-1'
    }`}>
      {(['Bassa', 'Media', 'Alta'] as const).map((pri) => (
        <div 
          key={pri}
          onClick={() => { onChange(pri); setIsOpen(false); }}
          className={`px-3 py-2 text-sm font-bold uppercase cursor-pointer transition-colors hover:bg-gray-50 flex items-center justify-between ${
            value === pri ? 'text-gray-900 bg-gray-50' : 'text-gray-500'
          }`}
        >
          {pri}
          <span className={`w-2 h-2 rounded-full shadow-xs ${dotStyles[pri]}`}></span>
        </div>
      ))}
    </div>
  );

  const overlayDropdown = (
    <div
      className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn pointer-events-auto select-none"
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setIsOpen(false);
      }}
      aria-hidden="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 max-w-[90vw] animate-fadeIn max-h-[75vh] flex flex-col pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 shrink-0">
          <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            Seleziona Priorità
          </h4>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="py-2 space-y-1">
          {(['Bassa', 'Media', 'Alta'] as const).map((pri) => {
            const isSelected = value === pri;
            return (
              <div
                key={pri}
                onClick={() => {
                  onChange(pri);
                  setIsOpen(false);
                }}
                className={`px-3 py-2.5 rounded-xl text-sm font-bold uppercase cursor-pointer flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-blue-900'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-3.5 h-3.5 rounded-full shadow-xs ${dotStyles[pri]}`} />
                  <span>{pri}</span>
                </div>
                {isSelected && <CheckCircleIcon className="w-4 h-4 text-blue-600 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-white border border-gray-200 hover:border-blue-500 rounded-xl text-sm font-bold uppercase transition-colors outline-none cursor-pointer flex justify-between items-center shadow-xs"
      >
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${dotStyles[value]}`}></span>
          <span className="text-gray-700">{value}</span>
        </div>
        <DropdownIcon isDropdownOpen={isOpen} />
      </div>

      {isOpen && (overlay ? createPortal(overlayDropdown, document.body) : standardDropdown)}
    </div>
  );
};

export default PrioritySelect;