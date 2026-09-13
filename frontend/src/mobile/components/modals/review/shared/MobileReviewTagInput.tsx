// src/mobile/components/modals/review/shared/MobileReviewTagInput.tsx
import React, { useRef, useEffect } from 'react';
import type { Category } from '@/types/categories';

export interface MobileReviewTagInputProps {
  search: string;
  onSearchChange: (val: string) => void;
  suggestions: Category[];
  nameAlreadyExists: boolean;
  onSelectTag: (id: number) => void;
  onCreateTag: () => void;
  onClose: () => void;
}

export const MobileReviewTagInput: React.FC<MobileReviewTagInputProps> = ({
  search,
  onSearchChange,
  suggestions,
  nameAlreadyExists,
  onSelectTag,
  onCreateTag,
  onClose,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div ref={dropdownRef} className="relative shrink-0">
      <input
        ref={inputRef}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (suggestions.length > 0) {
              onSelectTag(suggestions[0].id);
            } else if (search.trim()) {
              onCreateTag();
            }
          }
          if (e.key === 'Escape') {
            onClose();
          }
        }}
        placeholder="Cerca o crea tag..."
        className="text-xs px-2.5 py-1 rounded-full border border-indigo-400 bg-white focus:ring-2 focus:ring-indigo-300 outline-none w-36 shadow-xs"
      />

      {(suggestions.length > 0 || search.trim()) && (
        <div className="absolute bottom-full left-0 mb-1.5 w-48 max-w-[calc(100vw-32px)] bg-white rounded-xl shadow-2xl border border-gray-200 max-h-40 overflow-y-auto z-50">
          {suggestions.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectTag(tag.id);
              }}
              onClick={() => onSelectTag(tag.id)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 text-gray-700 font-medium truncate block cursor-pointer border-b border-gray-50 last:border-b-0"
            >
              #{tag.category_name}
            </button>
          ))}
          {search.trim() && !nameAlreadyExists && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onCreateTag();
              }}
              onClick={onCreateTag}
              className="w-full text-left px-3 py-2 text-xs hover:bg-green-50 text-green-700 font-bold border-t border-gray-100 truncate block cursor-pointer"
            >
              + Crea &quot;#{search.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
};
