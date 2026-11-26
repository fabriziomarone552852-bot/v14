// src/components/archive/shopping/ShoppingArchiveViewSelect.tsx
import React, { useRef, useState } from 'react';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { PortalDropdownMenu, SelectModalDialog } from '@/components/shared/form';
import { CheckCircleIcon, DropdownIcon } from '@/components/shared/utils/Icons';
import type { ShoppingArchiveTab } from './useShoppingArchivePageLogic';

export interface ShoppingArchiveViewOption {
  id: ShoppingArchiveTab;
  label: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  badgeBg: string;
}

interface ShoppingArchiveViewSelectProps {
  options: ShoppingArchiveViewOption[];
  activeTab: ShoppingArchiveTab;
  onChange: (tab: ShoppingArchiveTab) => void;
  isMobile: boolean;
}

export const ShoppingArchiveViewSelect: React.FC<ShoppingArchiveViewSelectProps> = ({
  options,
  activeTab,
  onChange,
  isMobile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const containerRef = useOutsideClick<HTMLDivElement>((e: MouseEvent | TouchEvent) => {
    if (!isMobile) {
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
    }
  });

  const { openUpwards, coords } = useDropdownPosition(containerRef, {
    isOpen: isOpen && !isMobile,
    threshold: 240,
  });

  const activeOption = options.find((opt) => opt.id === activeTab) ?? options[0];

  const handleSelect = (tab: ShoppingArchiveTab) => {
    onChange(tab);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="w-full sm:w-64 relative">
      {/* Trigger Selettore Vista */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-100 border border-slate-200/90 text-xs font-extrabold text-slate-800 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-slate-600 shrink-0">{activeOption.icon}</span>
          <span className="uppercase tracking-wider truncate">{activeOption.label}</span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${activeOption.badgeBg}`}
          >
            {activeOption.count}
          </span>
        </div>
        <DropdownIcon
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Desktop: Dropdown Portal */}
      <PortalDropdownMenu
        isOpen={isOpen && !isMobile}
        coords={coords}
        openUpwards={openUpwards}
        dropdownRef={dropdownRef}
        zIndex={10030}
      >
        <div className="p-1.5 space-y-1">
          {options.map((opt) => {
            const isSelected = opt.id === activeTab;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 text-blue-800 font-extrabold'
                    : 'text-slate-700 hover:bg-slate-50 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0">{opt.icon}</span>
                  <span className="truncate">{opt.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${opt.badgeBg}`}
                  >
                    {opt.count}
                  </span>
                  {isSelected && <CheckCircleIcon className="w-3.5 h-3.5 text-blue-600" />}
                </div>
              </button>
            );
          })}
        </div>
      </PortalDropdownMenu>

      {/* Mobile: Modale Centrale (Regola d'Oro Mobile UI) */}
      <SelectModalDialog
        isOpen={isOpen && isMobile}
        onClose={() => setIsOpen(false)}
        title="Seleziona Sezione Spesa"
        maxWidthClass="max-w-sm"
        zIndex={10040}
      >
        <div className="space-y-1.5 py-1">
          {options.map((opt) => {
            const isSelected = opt.id === activeTab;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt.id)}
                className={`w-full py-3 px-3.5 rounded-2xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-800 active:scale-[0.99]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={isSelected ? 'text-white shrink-0' : 'text-slate-500 shrink-0'}>
                    {opt.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold uppercase tracking-wider truncate">
                      {opt.label}
                    </div>
                    <div
                      className={`text-[11px] truncate mt-0.5 ${
                        isSelected ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {opt.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-white/20 text-white border-white/30'
                        : opt.badgeBg
                    }`}
                  >
                    {opt.count}
                  </span>
                  {isSelected && <CheckCircleIcon className="w-4 h-4 text-white shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </SelectModalDialog>
    </div>
  );
};

export default ShoppingArchiveViewSelect;
