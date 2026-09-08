// src/components/shared/shopping/ShoppingRoleSelect.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { DropdownIcon, CloseIcon } from '@/components/shared/utils/Icons';

export interface ShoppingRoleOption {
  code: string;
  label: string;
  dotClass: string;
  description?: string;
}

const ROLES: ShoppingRoleOption[] = [
  { code: 'admin', label: 'Admin', dotClass: 'bg-blue-500', description: 'Gestione completa gruppo e collaboratori' },
  { code: 'editor', label: 'Editor', dotClass: 'bg-green-500', description: 'Modifica e aggiunta articoli nella lista' },
  { code: 'reader', label: 'Reader', dotClass: 'bg-gray-400', description: 'Sola visualizzazione degli articoli' },
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

  const selectedRole = ROLES.find((r) => r.code === value) || ROLES[0];

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`bg-white border border-gray-200 hover:border-blue-500 rounded-xl font-bold uppercase transition-colors outline-none cursor-pointer flex justify-between items-center gap-1.5 shadow-xs ${
            compact ? 'px-2.5 py-1.5 text-xs min-w-[90px]' : 'px-3 py-2 text-xs min-w-[110px]'
          }`}
          title="Modifica ruolo"
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${selectedRole.dotClass}`} />
            <span className="text-gray-700 truncate">{selectedRole.label}</span>
          </div>
          <DropdownIcon isDropdownOpen={isOpen} />
        </button>
      </div>

      {/* MODALE AL CENTRO DELLO SCHERMO CON SFONDO OSCURATO */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[10030] bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn pointer-events-auto"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-5 space-y-4 border border-gray-100 animate-scaleUp pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                  Scegli Ruolo Membro
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                  title="Chiudi"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {ROLES.map((role) => {
                  const isSelected = value === role.code;
                  return (
                    <button
                      key={role.code}
                      type="button"
                      onClick={() => {
                        onChange(role.code);
                        setIsOpen(false);
                      }}
                      className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between border cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/20'
                          : 'bg-gray-50/80 hover:bg-gray-100 border-gray-200/80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 shadow-2xs ${role.dotClass}`} />
                        <div>
                          <span className="text-xs font-black text-gray-900 uppercase block tracking-wide">
                            {role.label}
                          </span>
                          {role.description && (
                            <span className="text-[11px] text-gray-500 font-medium block mt-0.5 leading-snug">
                              {role.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default ShoppingRoleSelect;
