// src/components/shared/shopping/ShoppingBrandAutocomplete.tsx
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ShoppingProductOption, ShoppingSupplierOption } from '@/types/shopping';

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
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [coords, setCoords] = useState<{
    top: number;
    bottom: number;
    left: number;
    width: number;
    openUpwards: boolean;
  }>({
    top: 0,
    bottom: 0,
    left: 0,
    width: 0,
    openUpwards: false,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateCoords = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < 220;
      setCoords({
        top: rect.bottom + 4,
        bottom: window.innerHeight - rect.top + 4,
        left: rect.left,
        width: Math.max(rect.width, 200),
        openUpwards: openUp,
      });
    }
  }, []);

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

    updateCoords();
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen, updateCoords]);

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
      if (p.brandName) {
        set.add(p.brandName.trim().toLowerCase());
      }
    });
    return set;
  }, [productName, products]);

  // Lista brand filtrata e ordinata per rilevanza rispetto al prodotto
  const suggestions = useMemo(() => {
    const q = (value || '').trim().toLowerCase();
    let list = brands;

    if (q) {
      list = list.filter((b) => (b?.name || '').toLowerCase().includes(q));
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
    return brands.some((b) => (b?.name || '').toLowerCase() === q);
  }, [value, brands]);

  const handleSelect = (brand: ShoppingSupplierOption) => {
    onChange(brand.name, brand);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleSelectCustom = () => {
    const trimmed = (value || '').trim();
    if (!trimmed) return;
    onChange(trimmed);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      }
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
      return;
    }

    if (e.key === 'Enter') {
      if (isOpen && suggestions.length > 0 && highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      } else if (isOpen && suggestions.length > 0 && highlightedIndex === -1) {
        const first = suggestions[0];
        const firstName = (first?.name || '').toLowerCase();
        if (firstName === (value || '').trim().toLowerCase()) {
          e.preventDefault();
          handleSelect(first);
        }
      }
    }
  };

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
        const isAssociated = productAssociatedBrandNames.has(b.name.toLowerCase());
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
              <span className="truncate">{b.name}</span>
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
