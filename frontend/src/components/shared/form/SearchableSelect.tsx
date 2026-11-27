// src/components/shared/form/SearchableSelect.tsx
/**
 * SearchableSelect — selettore custom con ricerca testuale integrata.
 *
 * Desktop: dropdown portal con campo di ricerca, lista scrollabile con rotella
 *          del mouse, navigazione tastiera (ArrowUp/Down/Enter/Escape).
 * Mobile:  delega a SelectModalDialog (modale centrata con backdrop).
 *
 * Sostituisce <select> nativi per liste dinamiche o lunghe nel dominio Shopping.
 */
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { SelectModalDialog } from './SelectModalDialog';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';

// ─── Tipi pubblici ────────────────────────────────────────────────────────────

export interface SearchableSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  /** Valore attualmente selezionato. */
  value: string | number;
  /** Callback al cambio selezione. */
  onChange: (value: string | number) => void;
  /** Lista delle opzioni. */
  options: SearchableSelectOption[];
  /** Testo del placeholder quando nessuna opzione è selezionata. */
  placeholder?: string;
  /** Disabilita l'intero componente. */
  disabled?: boolean;
  /** Classi CSS aggiuntive per il trigger. */
  className?: string;
  /** Titolo del modale su mobile. */
  mobileTitle?: string;
  /** Soglia px spazio sotto il trigger per aprire verso il basso (default: 240). */
  dropdownThreshold?: number;
  /** z-index del dropdown/modale (default: 10030). */
  zIndex?: number;
  /** Placeholder del campo di ricerca (default: "Cerca..."). */
  searchPlaceholder?: string;
  /** Altezza max della lista dropdown desktop in px (default: 260). */
  maxListHeight?: number;
  /** id html per accessibilità (htmlFor su label). */
  id?: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = '— Seleziona —',
  disabled = false,
  className = '',
  mobileTitle = 'Seleziona',
  dropdownThreshold = 240,
  zIndex = 10030,
  searchPlaceholder = 'Cerca...',
  maxListHeight = 260,
  id,
}) => {
  const isMobile = useIsMobile();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const generatedId = useId();
  const triggerId = id ?? generatedId;

  const { openUpwards, coords } = useDropdownPosition(triggerRef, {
    threshold: dropdownThreshold,
    isOpen,
  });

  const { handleScroll, scrollbarClass } = useFadeScrollbar();

  // Opzione attualmente selezionata
  const selectedOption = useMemo(
    () => options.find((o) => String(o.value) === String(value)) ?? null,
    [options, value]
  );

  // Lista filtrata per la ricerca
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  // ── Apertura / chiusura ────────────────────────────────────────────────────

  const open = useCallback(() => {
    if (disabled) return;
    setSearch('');
    setHighlightedIndex(0);
    setIsOpen(true);
  }, [disabled]);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearch('');
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  // ── Focus sul campo di ricerca appena si apre (solo desktop) ──────────────

  useEffect(() => {
    if (isOpen && !isMobile) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [isOpen, isMobile]);

  // ── Chiudi cliccando fuori (desktop) ──────────────────────────────────────

  useEffect(() => {
    if (!isOpen || isMobile) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      )
        return;
      close();
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen, isMobile, close]);

  // ── Navigazione tastiera (desktop) ────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          open();
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        triggerRef.current?.focus();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const opt = filtered[highlightedIndex];
        if (opt && !opt.disabled) {
          onChange(opt.value);
          close();
          triggerRef.current?.focus();
        }
      }
    },
    [isOpen, open, close, filtered, highlightedIndex, onChange]
  );

  // ── Scroll automatico elemento evidenziato in vista ───────────────────────

  useEffect(() => {
    if (!isOpen || isMobile) return;
    const listEl = listRef.current;
    if (!listEl) return;
    const item = listEl.children[highlightedIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, isOpen, isMobile]);

  // ── Selezione opzione ─────────────────────────────────────────────────────

  const handleSelect = useCallback(
    (opt: SearchableSelectOption) => {
      if (opt.disabled) return;
      onChange(opt.value);
      close();
      if (!isMobile) triggerRef.current?.focus();
    },
    [onChange, close, isMobile]
  );

  // ── Stile trigger ─────────────────────────────────────────────────────────

  const triggerBase =
    'w-full flex items-center justify-between gap-2 text-left text-xs ' +
    'rounded-xl border bg-slate-50 outline-none transition ' +
    'focus:bg-white px-3 py-1.5 ';

  const triggerClass =
    triggerBase +
    (disabled
      ? 'opacity-50 cursor-not-allowed border-slate-200 text-slate-400'
      : isOpen
      ? 'border-sky-500 bg-white cursor-pointer'
      : 'border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300 cursor-pointer') +
    ' ' +
    className;

  // ── Contenuto lista (condiviso desktop/mobile) ────────────────────────────

  const listContent = (
    <>
      {/* Campo di ricerca */}
      <div className="px-2 pt-2 pb-1 shrink-0">
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setHighlightedIndex(0);
          }}
          placeholder={searchPlaceholder}
          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-sky-400 focus:bg-white transition"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            // Evita che ArrowUp/Down/Enter sull'input scappino fuori
            if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
              handleKeyDown(e);
            }
          }}
        />
      </div>

      {/* Lista opzioni */}
      <ul
        ref={listRef}
        role="listbox"
        style={{ maxHeight: `${maxListHeight}px` }}
        className={`overflow-y-auto py-1 ${scrollbarClass}`}
        onScroll={handleScroll}
      >
        {filtered.length === 0 ? (
          <li className="px-4 py-3 text-xs text-slate-400 text-center">
            Nessun risultato
          </li>
        ) : (
          filtered.map((opt, idx) => {
            const isSelected = String(opt.value) === String(value);
            const isHighlighted = idx === highlightedIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => handleSelect(opt)}
                className={[
                  'flex items-center justify-between gap-2 px-3 py-2 text-xs cursor-pointer select-none transition-colors',
                  opt.disabled
                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                    : isHighlighted
                    ? 'bg-sky-50 text-sky-800'
                    : isSelected
                    ? 'bg-sky-100/70 text-sky-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <span className="text-sky-500 shrink-0 text-[10px]">✓</span>
                )}
              </li>
            );
          })
        )}
      </ul>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full">
      {/* Trigger */}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={triggerClass}
      >
        <span className={`truncate ${!selectedOption ? 'text-slate-400' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* DESKTOP: dropdown portal ───────────────────────────────────────────── */}
      {!isMobile &&
        isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: openUpwards ? undefined : `${coords.top + 4}px`,
              bottom: openUpwards ? `${coords.bottom + 4}px` : undefined,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex,
            }}
            className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fadeIn flex flex-col"
          >
            {listContent}
          </div>,
          document.body
        )}

      {/* MOBILE: SelectModalDialog ────────────────────────────────────────── */}
      {isMobile && (
        <SelectModalDialog
          isOpen={isOpen}
          onClose={close}
          title={mobileTitle}
        >
          {listContent}
        </SelectModalDialog>
      )}
    </div>
  );
};

export default SearchableSelect;
