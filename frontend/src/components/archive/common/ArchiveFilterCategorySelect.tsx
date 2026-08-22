// src/components/archive/common/ArchiveFilterCategorySelect.tsx
import React, { useState, useEffect } from 'react';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { DropdownIcon } from '@/components/shared/utils/Icons';
import type { Category } from '@/types';

export interface ArchiveFilterCategorySelectProps {
  label?: string;
  categories: Category[];
  selectedCategoryId: string;
  onChange: (categoryId: string) => void;
  allLabel?: string;
}

export const ArchiveFilterCategorySelect: React.FC<ArchiveFilterCategorySelectProps> = ({
  label = 'Categoria',
  categories,
  selectedCategoryId,
  onChange,
  allLabel = 'Tutte le categorie',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);

  const ref = useOutsideClick<HTMLDivElement>(() => setIsOpen(false));

  useEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 200);
    }
  }, [isOpen, ref]);

  const selectedCategory = categories.find((c) => String(c.id) === selectedCategoryId);
  const selectedCategoryColor = selectedCategory?.colore || '#9CA3AF';
  const selectedCategoryName = selectedCategory ? selectedCategory.category_name : allLabel;

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

        {isOpen && (
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
        )}
      </div>
    </div>
  );
};
