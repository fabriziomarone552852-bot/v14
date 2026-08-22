// src/components/shared/shopping/ShoppingProductAutocomplete.tsx
import React, { useRef, useEffect, useState, useMemo } from 'react';
import type { ShoppingProductOption } from '@/types/shopping';

interface ShoppingProductAutocompleteProps {
  value: string;
  onChange: (name: string, product?: ShoppingProductOption) => void;
  products?: ShoppingProductOption[];
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  id?: string;
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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Filtro in tempo reale su tutti i prodotti nel database (case-insensitive substring)
  const suggestions = useMemo(() => {
    const q = (value || '').trim().toLowerCase();
    if (!q || q.length < 1) return [];
    return products
      .filter((p) => {
        const name = (p?.displayName || p?.nameNormalized || '').toLowerCase();
        return Boolean(name && name.includes(q));
      })
      .slice(0, 10);
  }, [value, products]);

  // Verifica se il valore attuale corrisponde già esattamente a un prodotto esistente
  const exactMatch = useMemo(() => {
    const q = (value || '').trim().toLowerCase();
    if (!q) return true;
    return products.some((p) => {
      const name = (p?.displayName || p?.nameNormalized || '').toLowerCase();
      return name === q;
    });
  }, [value, products]);

  const handleSelect = (product: ShoppingProductOption) => {
    const name = product.displayName || product.nameNormalized || '';
    onChange(name, product);
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
        const firstName = (first?.displayName || first?.nameNormalized || '').toLowerCase();
        if (firstName === (value || '').trim().toLowerCase()) {
          e.preventDefault();
          handleSelect(first);
        }
      }
    }
  };

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

      {isOpen && (value || '').trim().length >= 1 && (suggestions.length > 0 || !exactMatch) && (
        <div className="absolute z-[9999] left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto animate-fadeIn divide-y divide-gray-50">
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
                <span className="truncate">{productName}</span>
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
      )}
    </div>
  );
};

export default ShoppingProductAutocomplete;



