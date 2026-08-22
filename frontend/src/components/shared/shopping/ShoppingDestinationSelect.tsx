// src/components/shared/shopping/ShoppingDestinationSelect.tsx
import React, { useState, useEffect } from 'react';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { DropdownIcon, LockIcon } from '@/components/shared/utils/Icons';
import type { ShoppingGroupSummary } from '@/types/shopping';

interface ShoppingDestinationSelectProps {
  value: string; // "" = Personale, oppure String(groupId)
  onChange: (val: string) => void;
  groups: ShoppingGroupSummary[];
  className?: string;
}

export const ShoppingDestinationSelect: React.FC<ShoppingDestinationSelectProps> = ({
  value,
  onChange,
  groups,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);

  const ref = useOutsideClick<HTMLDivElement>(() => setIsOpen(false));

  useEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 180);
    }
  }, [isOpen]);

  const selectedGroup = groups.find((g) => String(g.id) === value);
  const isPersonal = !value || !selectedGroup;

  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-white border border-gray-200 hover:border-blue-500 rounded-xl text-sm font-semibold transition-colors outline-none cursor-pointer flex justify-between items-center shadow-xs"
      >
        <div className="flex items-center gap-2 truncate">
          {isPersonal ? (
            <>
              <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <LockIcon className="w-3 h-3" />
              </div>
              <span className="text-gray-800 truncate">Privata</span>
            </>
          ) : (
            <>
              <span className="text-sm shrink-0">{selectedGroup?.icon?.trim() || '👥'}</span>
              <span className="text-gray-800 truncate">{selectedGroup?.name}</span>
            </>
          )}
        </div>
        <DropdownIcon isDropdownOpen={isOpen} />
      </div>

      {isOpen && (
        <div
          className={`absolute z-[100] w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-fadeIn max-h-56 overflow-y-auto custom-scrollbar ${
            openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {/* Opzione Personale */}
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className={`px-3 py-2 text-xs font-semibold cursor-pointer transition-colors hover:bg-gray-50 flex items-center justify-between gap-2 ${
              isPersonal ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <LockIcon className="w-3 h-3" />
              </div>
              <span className="truncate">Privata</span>
            </div>
            {isPersonal && <span className="text-blue-600 font-bold">✓</span>}
          </div>

          {/* Opzioni Gruppi */}
          {groups.map((group) => {
            const isSelected = String(group.id) === value;
            const icon = group.icon?.trim() || '👥';

            return (
              <div
                key={group.id}
                onClick={() => {
                  onChange(String(group.id));
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-xs font-semibold cursor-pointer transition-colors hover:bg-gray-50 flex items-center justify-between gap-2 ${
                  isSelected ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm shrink-0">{icon}</span>
                  <span className="truncate">{group.name}</span>
                </div>
                {isSelected && <span className="text-blue-600 font-bold">✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShoppingDestinationSelect;
