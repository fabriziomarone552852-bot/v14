import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PlatformAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

export const PlatformAutocomplete: React.FC<PlatformAutocompleteProps> = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, bottom: 0, openUpwards: false });

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes((value || '').toLowerCase()));
  const exactMatch = filteredOptions.some(opt => opt.toLowerCase() === (value || '').trim().toLowerCase());

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node) && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const openUpwards = spaceBelow < 250 && spaceAbove > spaceBelow;
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        bottom: window.innerHeight - rect.top - window.scrollY,
        openUpwards
      });
    }
  }, [isOpen, value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        onChange(filteredOptions[highlightedIndex]);
        setIsOpen(false);
      } else if (!exactMatch && (value || '').trim()) {
        onChange((value || '').trim());
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const dropdownMenu = (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: coords.openUpwards ? 'auto' : `${coords.top}px`,
        bottom: coords.openUpwards ? `${coords.bottom}px` : 'auto',
        left: `${coords.left}px`,
        width: `${coords.width}px`,
        zIndex: 99999,
      }}
      className="bg-white border border-gray-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto animate-fadeIn divide-y divide-gray-50"
    >
      {filteredOptions.map((opt, idx) => {
        const isHighlighted = idx === highlightedIndex;
        return (
          <button
            key={opt}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { onChange(opt); setIsOpen(false); }}
            onMouseEnter={() => setHighlightedIndex(idx)}
            className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer ${
              isHighlighted
                ? 'bg-blue-50 text-blue-700 font-bold'
                : 'text-gray-700 hover:bg-blue-50/70 hover:text-blue-700'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="truncate">{opt}</span>
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
          onClick={() => { onChange((value || '').trim()); setIsOpen(false); }}
          className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/60 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>+ Usa &quot;{(value || '').trim()}&quot; (nuovo)</span>
        </button>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value || ''}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Piattaforma..."
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 hover:border-blue-500 transition-colors bg-white shadow-sm"
        autoComplete="off"
      />
      {isOpen &&
        (filteredOptions.length > 0 || ((value || '').trim() && !exactMatch)) &&
        createPortal(dropdownMenu, document.body)}
    </div>
  );
};
