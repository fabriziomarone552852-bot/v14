// src/components/shared/shopping/ShoppingBrandAutocomplete.tsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { ShoppingProductOption, ShoppingSupplierOption } from '@/types/shopping';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { useAutocompleteKeyboard } from '@/hooks/useAutocompleteKeyboard';

interface ShoppingBrandAutocompleteProps {
  value: string;
  onChange: (brandName: string, brand?: ShoppingSupplierOption) => void;
  brands?: ShoppingSupplierOption[];
  productName?: string;
  products?: ShoppingProductOption[];
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  id?: string;
  usePortal?: boolean;
}

export const ShoppingBrandAutocomplete: React.FC<ShoppingBrandAutocompleteProps> = ({
  value,
  onChange,
  brands = [],
  productName = '',
  products = [],
  placeholder = 'Es. Barilla, De Cecco, Mutti...',
  disabled = false,
  autoFocus = false,
  className = '',
  id,
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
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Brand precedentemente associati a questo prodotto
  const productAssociatedBrandNames = useMemo(() => {
    const pName = (productName || '').trim().toLowerCase();
    if (!pName) return new Set<string>();

    const matching = products.filter((p) => {
      const name = (p?.displayName || p?.nameNormalized || '').toLowerCase();
      return name === pName;
    });

    const set = new Set<string>();
    matching.forEach((p) => {
      if (p?.brandName) {
        set.add(p.brandName.trim().toLowerCase());
      }
    });
    return set;
  }, [productName, products]);

  // Lista brand filtrata e ordinata per rilevanza rispetto al prodotto
  const suggestions = useMemo(() => {
    const q = (value || '').trim().toLowerCase();
    let list = brands.filter((b) => Boolean(b && b.name));

    if (q) {
      list = list.filter((b) => {
        const name = (b?.name || '').toLowerCase();
        return name.includes(q);
      });
    }

    return [...list].sort((a, b) => {
      const aName = (a?.name || '').toLowerCase();
      const bName = (b?.name || '').toLowerCase();
      const aAssoc = productAssociatedBrandNames.has(aName);
      const bAssoc = productAssociatedBrandNames.has(bName);

      if (aAssoc && !bAssoc) return -1;
      if (!aAssoc && bAssoc) return 1;
      return aName.localeCompare(bName);
    }).slice(0, 10);
  }, [value, brands, productAssociatedBrandNames]);

  const exactMatch = useMemo(() => {
    const q = (value || '').trim().toLowerCase();
    if (!q) return false;
    return brands.some((b) => {
      const name = (b?.name || '').toLowerCase();
      return name === q;
    });
  }, [value, brands]);

  const handleSelect = (brand: ShoppingSupplierOption) => {
    const brandName = brand?.name || '';
    onChange(brandName, brand);
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
      const firstName = (first?.name || '').toLowerCase();
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
      {suggestions.map((b, idx) => {
        const isHighlighted = idx === highlightedIndex;
        const brandName = b?.name || '';
        const isAssociated = brandName ? productAssociatedBrandNames.has(brandName.toLowerCase()) : false;
        return (
          <button
            key={b.id}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSelect(b)}
            onMouseEnter={() => setHighlightedIndex(idx)}
            className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer ${
              isHighlighted
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-gray-700 hover:bg-blue-50/70 hover:text-blue-700'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="truncate">{brandName}</span>
              {isAssociated && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700 shrink-0">
                  Consigliato
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 font-normal shrink-0">
              Brand
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
          <span>+ Usa &quot;{(value || '').trim()}&quot; (nuovo brand)</span>
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
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed bg-white shadow-2xs"
        autoComplete="off"
      />

      {isOpen &&
        (suggestions.length > 0 || ((value || '').trim().length >= 1 && !exactMatch)) &&
        (usePortal ? createPortal(dropdownMenu, document.body) : dropdownMenu)}
    </div>
  );
};

export default ShoppingBrandAutocomplete;
