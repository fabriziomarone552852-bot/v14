import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, User, X, Loader2 } from 'lucide-react';
import type { PeopleFilterMode, TMDBPersonSearchItem } from '@/types/people';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchTMDBPeople } from '@/hooks/queries/usePeopleQueries';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { useAutocompleteKeyboard } from '@/hooks/useAutocompleteKeyboard';
import {
  applyPersonSuggestion,
  formatPersonDepartment,
  getActivePersonToken,
  parsePeopleTokens,
  removePersonToken,
} from '@/utils/trackerPeopleUtils';

export interface PeopleAutocompleteInputProps {
  label?: string;
  value: string;
  mode?: PeopleFilterMode;
  onChange: (nextValue: string) => void;
  onModeChange: (nextMode: PeopleFilterMode) => void;
  onSubmitSearch?: () => void;
  usePortal?: boolean;
  showLocalHint?: boolean;
  placeholder?: string;
}

export const PeopleAutocompleteInput: React.FC<PeopleAutocompleteInputProps> = ({
  label = 'Attori / Registi',
  value,
  mode = 'AND',
  onChange,
  onModeChange,
  onSubmitSearch,
  usePortal = true,
  showLocalHint = false,
  placeholder = 'Es. Tarantino, DiCaprio...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeToken = useMemo(() => getActivePersonToken(value), [value]);
  const debouncedToken = useDebounce(activeToken, 250);
  const tokens = useMemo(() => parsePeopleTokens(value), [value]);

  const shouldQuery = isFocused && isOpen && debouncedToken.trim().length >= 2;
  const { data, isFetching } = useSearchTMDBPeople(debouncedToken, shouldQuery);
  const suggestions = useMemo(() => (data?.results || []).slice(0, 8), [data]);

  const isDropdownVisible =
    isOpen && isFocused && activeToken.length >= 2 && (isFetching || suggestions.length > 0);

  const { openUpwards, coords } = useDropdownPosition(triggerRef, {
    threshold: 260,
    isOpen: isDropdownVisible && usePortal,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inContainer = containerRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inContainer && !inDropdown) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPerson = (person: TMDBPersonSearchItem) => {
    const nextValue = applyPersonSuggestion(value, person.name);
    onChange(nextValue);
    setIsOpen(false);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const { highlightedIndex, handleKeyDown, resetHighlight } = useAutocompleteKeyboard({
    items: suggestions,
    isOpen: isDropdownVisible,
    setIsOpen,
    onSelect: handleSelectPerson,
    onEnterWithoutHighlight: onSubmitSearch,
  });

  const handleInputChange = (nextRaw: string) => {
    onChange(nextRaw);
    resetHighlight();
    const nextToken = getActivePersonToken(nextRaw);
    setIsOpen(nextToken.length >= 2);
  };

  const handleClearAll = () => {
    onChange('');
    setIsOpen(false);
    resetHighlight();
    inputRef.current?.focus();
  };

  const handleRemoveToken = (tokenToRemove: string) => {
    onChange(removePersonToken(value, tokenToRemove));
    inputRef.current?.focus();
  };

  const dropdownElement = isDropdownVisible ? (
    <div
      ref={dropdownRef}
      style={
        usePortal
          ? {
              position: 'fixed',
              left: `${coords.left}px`,
              width: `${Math.max(coords.width, 240)}px`,
              ...(openUpwards
                ? { bottom: `${coords.bottom + 4}px` }
                : { top: `${coords.top + 4}px` }),
              zIndex: 10050,
            }
          : undefined
      }
      className={`${
        usePortal ? '' : 'absolute left-0 right-0 top-full mt-1 z-[10050]'
      } bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-h-64 overflow-y-auto custom-scrollbar animate-fadeIn`}
    >
      {isFetching && suggestions.length === 0 ? (
        <div className="px-3 py-3 text-xs text-gray-500 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span>Ricerca persone su TMDB...</span>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {suggestions.map((person, index) => {
            const isHighlighted = index === highlightedIndex;
            const deptLabel = formatPersonDepartment(person.known_for_department);
            const knownFor = (person.known_for_titles || []).slice(0, 2).join(' · ');

            return (
              <li key={person.id}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    // Evita il blur prima che scatti il click su desktop e mobile
                    e.preventDefault();
                    handleSelectPerson(person);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors cursor-pointer ${
                    isHighlighted ? 'bg-blue-50' : 'hover:bg-gray-50 active:bg-blue-50'
                  }`}
                >
                  {person.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                      alt={person.name}
                      className="w-8 h-8 rounded-full object-cover bg-gray-100 shrink-0 border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0 border border-gray-200">
                      <User className="w-4 h-4" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-gray-900 truncate">
                        {person.name}
                      </span>
                      {deptLabel && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 shrink-0">
                          {deptLabel}
                        </span>
                      )}
                    </div>
                    {knownFor && (
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{knownFor}</p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  ) : null;

  return (
    <div ref={containerRef} className="space-y-1.5">
      {/* Intestazione con etichetta e selettore Tutti (AND) / Almeno uno (OR) */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
          {label}
        </label>

        <div
          className="inline-flex items-center rounded-lg bg-gray-100 p-0.5 border border-gray-200"
          role="group"
          aria-label="Modalità filtro persone"
        >
          <button
            type="button"
            onClick={() => onModeChange('AND')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
              mode === 'AND'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Trova titoli in cui sono presenti tutte le persone indicate"
          >
            Tutti (AND)
          </button>
          <button
            type="button"
            onClick={() => onModeChange('OR')}
            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
              mode === 'OR'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Trova titoli con almeno una delle persone indicate"
          >
            Almeno uno (OR)
          </button>
        </div>
      </div>

      {/* Campo di testo con suggerimenti live */}
      <div ref={triggerRef} className="relative">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50/70 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              if (getActivePersonToken(value).length >= 2) {
                setIsOpen(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape' && isDropdownVisible) {
                e.stopPropagation();
              }
              handleKeyDown(e);
            }}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none select-text"
            autoComplete="off"
          />
          {isFetching && activeToken.length >= 2 && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500 shrink-0" />
          )}
          {value && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-0.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200/70 transition-colors cursor-pointer shrink-0"
              aria-label="Svuota filtro attori e registi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {!usePortal && dropdownElement}
      </div>

      {usePortal && dropdownElement && createPortal(dropdownElement, document.body)}

      {/* Chip dei nomi rilevati (separati da virgola) per rimozione rapida con 1 click */}
      {tokens.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {tokens.map((token) => (
            <span
              key={token}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
            >
              <span>{token}</span>
              <button
                type="button"
                onClick={() => handleRemoveToken(token)}
                className="p-0.5 rounded-full hover:bg-blue-200/60 text-blue-600 cursor-pointer"
                aria-label={`Rimuovi ${token}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {showLocalHint && tokens.length > 0 && (
        <p className="text-[11px] text-amber-700 bg-amber-50/80 border border-amber-200/80 rounded-lg px-2.5 py-1">
          Filtra la tua libreria locale. Attiva <strong>Cerca in tutto TMDB</strong> sopra per
          cercare in tutta la filmografia.
        </p>
      )}
    </div>
  );
};

export default PeopleAutocompleteInput;
