// src/components/shared/shopping/ShoppingRoleSelect.tsx
import React, { useState, useEffect } from 'react';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { DropdownIcon } from '@/components/shared/utils/Icons';

export interface ShoppingRoleOption {
  code: string;
  label: string;
  dotClass: string;
  description?: string;
}

const ROLES: ShoppingRoleOption[] = [
  { code: 'editor', label: 'Editor', dotClass: 'bg-green-500', description: 'Modifica e aggiunta articoli' },
  { code: 'admin', label: 'Admin', dotClass: 'bg-blue-500', description: 'Gestione gruppo e collaboratori' },
  { code: 'reader', label: 'Reader', dotClass: 'bg-gray-400', description: 'Sola visualizzazione' },
];


interface ShoppingRoleSelectProps {
  value: string;
  onChange: (roleCode: string) => void;
  className?: string;
  compact?: boolean;
}

export const ShoppingRoleSelect: React.FC<ShoppingRoleSelectProps> = ({
  value,
  onChange,
  className = '',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);

  const ref = useOutsideClick<HTMLDivElement>(() => setIsOpen(false));

  useEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 160);
    }
  }, [isOpen]);

  const selectedRole = ROLES.find((r) => r.code === value) || ROLES[0];

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border border-gray-200 hover:border-blue-500 rounded-xl font-bold uppercase transition-colors outline-none cursor-pointer flex justify-between items-center shadow-xs ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${selectedRole.dotClass}`}></span>
          <span className="text-gray-700 truncate">{selectedRole.label}</span>
        </div>
        <DropdownIcon isDropdownOpen={isOpen} />
      </div>

      {isOpen && (
        <div
          className={`absolute z-[100] w-full min-w-[150px] bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-fadeIn ${
            openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {ROLES.map((role) => (
            <div
              key={role.code}
              onClick={() => {
                onChange(role.code);
                setIsOpen(false);
              }}
              className={`px-3 py-2 text-xs font-bold uppercase cursor-pointer transition-colors hover:bg-gray-50 flex items-center justify-between gap-2 ${
                value === role.code ? 'text-gray-900 bg-gray-50' : 'text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 shadow-2xs ${role.dotClass}`}></span>
                <span>{role.label}</span>
              </div>
              {value === role.code && (
                <span className="text-blue-600 text-[10px] font-bold">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShoppingRoleSelect;
