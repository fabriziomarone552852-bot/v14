// src/components/archive/common/ArchiveFilterCategorySelect.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { DropdownIcon, CloseIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';
import type { Category } from '@/types';

export interface ArchiveFilterCategorySelectProps {
  label?: string;
  categories: Category[];
  selectedCategoryId: string;
  onChange: (categoryId: string) => void;
  allLabel?: string;
  overlay?: boolean;
}

export const ArchiveFilterCategorySelect: React.FC<ArchiveFilterCategorySelectProps> = ({
  label = 'Categoria',
  categories,
  selectedCategoryId,
  onChange,
  allLabel = 'Tutte le categorie',
  overlay = true,
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
      setOpenUpwards(spaceBelow < 200);
    }
  }, [isOpen, overlay, ref]);

  const selectedCategory = categories.find((c) => String(c.id) === selectedCategoryId);
  const selectedCategoryColor = selectedCategory?.colore || '#9CA3AF';
  const selectedCategoryName = selectedCategory ? selectedCategory.category_name : allLabel;

  const standardDropdown = (
    <div
      className={`absolute left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto custom-scrollbar p-1 ${
        openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
      }`}
    >
      <button
        type="button"
        onClick={() => {
          onChange('');
          setIsOpen(false);
        }}
        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
          !selectedCategoryId
            ? 'bg-blue-50 text-blue-700 font-bold'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span>{allLabel}</span>
      </button>

      {categories.map((c) => {
        const isSelected = String(c.id) === selectedCategoryId;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              onChange(String(c.id));
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              isSelected
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: c.colore || '#9CA3AF' }}
            />
            <span className="truncate">{c.category_name}</span>
          </button>
        );
      })}
    </div>
  );

  const overlayDropdown = (
    <div
      className="fixed inset-0 z-[10050] bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn pointer-events-auto select-none"
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
            {label || 'Seleziona Categoria'}
          </h4>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-2 space-y-1 custom-scrollbar">
          {/* Opzione Tutte le Categorie */}
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
              !selectedCategoryId ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <span>{allLabel}</span>
            {!selectedCategoryId && <CheckCircleIcon className="w-4 h-4 text-blue-600 shrink-0" />}
          </button>

          {categories.map((c) => {
            const isSelected = String(c.id) === selectedCategoryId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(String(c.id));
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                  isSelected ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: c.colore || '#9CA3AF' }}
                  />
                  <span className="truncate">{c.category_name}</span>
                </div>
                {isSelected && <CheckCircleIcon className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
        {label}
      </label>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs transition-colors cursor-pointer ${
            selectedCategoryId
              ? 'border-blue-300 bg-blue-50/50 text-blue-900 font-bold'
              : 'border-gray-200 bg-white text-gray-700 font-normal hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedCategoryId && (
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: selectedCategoryColor }}
              />
            )}
            <span className="truncate">{selectedCategoryName}</span>
          </div>
          <DropdownIcon className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
        </button>

        {isOpen && (overlay ? createPortal(overlayDropdown, document.body) : standardDropdown)}
      </div>
    </div>
  );
};
