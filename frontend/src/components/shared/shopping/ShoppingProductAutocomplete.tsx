// src/components/shared/shopping/ShoppingProductAutocomplete.tsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { ShoppingProductOption } from '@/types/shopping';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { useAutocompleteKeyboard } from '@/hooks/useAutocompleteKeyboard';

interface ShoppingProductAutocompleteProps {
  value: string;
  onChange: (name: string, product?: ShoppingProductOption) => void;
  products?: ShoppingProductOption[];
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  id?: string;
  hideBrand?: boolean;
  usePortal?: boolean;
}

export const ShoppingProductAutocomplete: React.FC<ShoppingProductAutocompleteProps> = ({
  value,
  onChange,
  products = [],
  placeholder = 'Es. Pasta, latte, zucchero...',
  disabled = false,
  autoFocus = false,
  className = '',
  id,
  hideBrand = false,
  usePortal = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { openUpwards, coords: rawCoords } = useDropdownPosition(containerRef, { isOpen, threshold: 220 });

  const coords = useMemo(() => ({
    top: rawCoords.top + 4,
    bottom: rawCoords.bottom + 4,
    left: rawCoords.left,
    width: Math.max(rawCoords.width, 200),
    openUpwards,
  }), [rawCoords, openUpwards]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        resetHighlight();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filtro in tempo reale su tutti i prodotti nel database (case-insensitive substring)
  const suggestions = useMemo(() => {
    const q = (value || '').trim().toLowerCase();
    if (!q || q.length < 1) return [];

    if (hideBrand) {
      const seenNames = new Set<string>();
      const uniqueList: ShoppingProductOption[] = [];
      for (const p of products) {
        const baseName = (p?.nameNormalized || p?.displayName || '').trim().toLowerCase();
        if (baseName && baseName.includes(q) && !seenNames.has(baseName)) {
          seenNames.add(baseName);
          uniqueList.push({
            ...p,
            displayName: p.nameNormalized || p.displayName,
            brandName: null,
            brandId: null,
          });
        }
      }
      return uniqueList.slice(0, 10);
    }

    return products
      .filter((p) => {
        const name = (p?.displayName || p?.nameNormalized || '').toLowerCase();
        return Boolean(name && name.includes(q));
      })
      .slice(0, 10);
  }, [value, products, hideBrand]);

  const exactMatch = useMemo(() => {
    const q = (value || '').trim().toLowerCase();
    if (!q) return false;
    return products.some((p) => {
      const name = (p?.displayName || p?.nameNormalized || '').toLowerCase();
      return name === q;
    });
  }, [value, products]);

  const handleSelect = (product: ShoppingProductOption) => {
    const name = product.displayName || product.nameNormalized || '';
    onChange(name, product);
    setIsOpen(false);
    resetHighlight();
  };

  const handleSelectCustom = () => {
    const trimmed = (value || '').trim();
    if (!trimmed) return;
    onChange(trimmed);
    setIsOpen(false);
    resetHighlight();
  };

  // Navigazione da tastiera unificata tramite hook condiviso
  const { highlightedIndex, setHighlightedIndex, resetHighlight, handleKeyDown } = useAutocompleteKeyboard({
    items: suggestions,
    isOpen,
    setIsOpen,
    onSelect: handleSelect,
    onEnterWithoutHighlight: () => {
      const first = suggestions[0];
      const firstName = (first?.displayName || first?.nameNormalized || '').toLowerCase();
      if (firstName === (value || '').trim().toLowerCase()) {
        handleSelect(first);
      }
    },
  });

  const dropdownMenu = (
    <div
      ref={dropdownRef}
      style={
        usePortal
          ? {
              position: 'fixed',
              top: coords.openUpwards ? 'auto' : `${coords.top}px`,
              bottom: coords.openUpwards ? `${coords.bottom}px` : 'auto',
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 99999,
            }
          : undefined
      }
      className={`${
        usePortal ? '' : 'absolute left-0 right-0 top-full mt-1 z-[9999]'
      } bg-white border border-gray-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto animate-fadeIn divide-y divide-gray-50`}
    >
      {suggestions.map((p, idx) => {
        const isHighlighted = idx === highlightedIndex;
        const productName = p.displayName || p.nameNormalized || '';
        return (
          <button
            key={p.id}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSelect(p)}
            onMouseEnter={() => setHighlightedIndex(idx)}
            className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer ${
              isHighlighted
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-gray-700 hover:bg-blue-50/70 hover:text-blue-700'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="truncate">{productName}</span>
              {!hideBrand && p.brandName && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 shrink-0">
                  {p.brandName}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 font-normal shrink-0">
              Esistente
            </span>
          </button>
        );
      })}

      {(value || '').trim() && !exactMatch && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleSelectCustom}
          className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/60 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>+ Usa &quot;{(value || '').trim()}&quot; (nuovo)</span>
        </button>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        id={id}
        ref={inputRef}
        type="text"
        value={value || ''}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={() => {
          if ((value || '').trim().length >= 1) setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed bg-white shadow-2xs"
        autoComplete="off"
      />

      {isOpen &&
        (value || '').trim().length >= 1 &&
        (suggestions.length > 0 || !exactMatch) &&
        (usePortal ? createPortal(dropdownMenu, document.body) : dropdownMenu)}
    </div>
  );
};

export default ShoppingProductAutocomplete;
