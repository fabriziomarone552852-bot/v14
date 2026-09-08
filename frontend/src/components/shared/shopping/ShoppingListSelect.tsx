// src/components/shared/shopping/ShoppingListSelect.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { DropdownIcon, ShoppingIcon, UsersIcon, CloseIcon } from '@/components/shared/utils/Icons';
import type { ShoppingListSummary } from '@/types/shopping';

interface ShoppingListSelectProps {
  value: string; // listId come stringa
  onChange: (val: string) => void;
  lists: ShoppingListSummary[];
  disabled?: boolean;
  className?: string;
  asModal?: boolean;
}

export const ShoppingListSelect: React.FC<ShoppingListSelectProps> = ({
  value,
  onChange,
  lists,
  disabled = false,
  className = '',
  asModal = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useOutsideClick<HTMLDivElement>(() => {
    if (!asModal) setIsOpen(false);
  });
  const { openUpwards } = useDropdownPosition(ref, { isOpen, threshold: 220 });

  const selectedList = lists.find((l) => String(l.id) === value) || lists[0];

  const getListBadge = (list?: ShoppingListSummary) => {
    if (!list) return null;
    if (list.isDefault) {
      return (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
          📥 Senza lista
        </span>
      );
    }
    if (list.groupName) {
      return (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
          <UsersIcon className="w-2.5 h-2.5" />
          <span className="truncate max-w-[90px]">{list.groupName}</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
        Private
      </span>
    );
  };

  const handleSelect = (listId: string) => {
    onChange(listId);
    setIsOpen(false);
  };

  return (
    <>
      <div className={`relative w-full ${className}`} ref={ref}>
        <div
          onClick={() => {
            if (!disabled) setIsOpen(!isOpen);
          }}
          className={`w-full px-3 py-2.5 bg-white border border-gray-200 hover:border-blue-500 rounded-xl text-sm font-semibold transition-colors outline-none cursor-pointer flex justify-between items-center shadow-xs ${
            disabled ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          <div className="flex items-center gap-2 truncate min-w-0">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShoppingIcon className="w-3.5 h-3.5" />
            </div>
            <span className="text-gray-800 truncate font-semibold">
              {selectedList ? selectedList.name : 'Seleziona una lista...'}
            </span>
            {getListBadge(selectedList)}
          </div>
          <DropdownIcon isDropdownOpen={isOpen} />
        </div>

        {/* Modalità Dropdown Classica */}
        {!asModal && isOpen && !disabled && (
          <div
            className={`absolute z-[100] w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-fadeIn max-h-56 overflow-y-auto custom-scrollbar ${
              openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
            }`}
          >
            {lists.map((list) => {
              const isSelected = String(list.id) === value;

              return (
                <div
                  key={list.id}
                  onClick={() => handleSelect(String(list.id))}
                  className={`px-3 py-2 text-xs font-semibold cursor-pointer transition-colors hover:bg-gray-50 flex items-center justify-between gap-2 ${
                    isSelected ? 'text-blue-600 bg-blue-50/50 font-bold' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <span className="truncate">{list.name}</span>
                    {getListBadge(list)}
                  </div>
                  {isSelected && <span className="text-blue-600 font-bold">✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modalità Finestra/Modale a Tutto Schermo al Centro */}
      {asModal && isOpen && !disabled &&
        createPortal(
          <div
            className="fixed inset-0 z-[10030] bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn pointer-events-auto"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-5 space-y-4 border border-gray-100 animate-scaleUp pointer-events-auto max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Finestra */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                  Scegli Lista
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

              {/* Elenco Liste */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-1.5 pr-0.5">
                {lists.map((list) => {
                  const isSelected = String(list.id) === value;

                  return (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => handleSelect(String(list.id))}
                      className={`w-full p-3 rounded-2xl text-left transition-all flex items-center justify-between border cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/20 font-bold text-blue-900'
                          : 'bg-gray-50/80 hover:bg-gray-100 border-gray-200/80 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <span className="text-xs font-bold truncate">{list.name}</span>
                        {getListBadge(list)}
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ml-2">
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

export default ShoppingListSelect;
