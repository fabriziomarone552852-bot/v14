// src/components/shared/form/LocationAutocompleteInput.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAutocompleteKeyboard } from '@/hooks/useAutocompleteKeyboard';
import { LocationIcon, ExternalLinkIcon, LoadingIcon } from '@/components/shared/utils/Icons';
import { loadGoogleMaps } from '@/utils/googleMapsLoader';
import { openInGoogleMaps } from '@/utils/mapUtils';
import { fetchGooglePlacesSuggestions, fetchPhotonSuggestions, type LocationSuggestion } from '@/api/geocodingApi';

export type { LocationSuggestion } from '@/api/geocodingApi';

interface LocationAutocompleteInputProps {
  label?: string;
  placeholder?: string;
  value?: string | null;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export const LocationAutocompleteInput: React.FC<LocationAutocompleteInputProps> = ({
  label = 'Luogo',
  placeholder = 'Es. Via Roma 10, Milano o Ufficio...',
  value,
  onChange,
  className = '',
  disabled = false,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Initialize Google Maps on mount
  useEffect(() => {
    loadGoogleMaps();
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Fetch predictions from Google Places (New API) or fallback to OSM
  const fetchPredictions = useCallback(
    async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed || trimmed.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const googleSuggestions = await fetchGooglePlacesSuggestions(trimmed);
      if (googleSuggestions.length > 0) {
        setSuggestions(googleSuggestions);
        setIsOpen(true);
        setIsLoading(false);
        return;
      }

      const osmResults = await fetchPhotonSuggestions(trimmed);
      setSuggestions(osmResults);
      setIsOpen(osmResults.length > 0);
      setIsLoading(false);
    },
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    onChange(text);
    setHighlightedIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchPredictions(text);
    }, 280);
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.fullText);
    onChange(suggestion.fullText);
    setSuggestions([]);
    setIsOpen(false);
    resetHighlight();
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
  };

  // Navigazione da tastiera unificata tramite hook condiviso
  const { highlightedIndex, setHighlightedIndex, resetHighlight, handleKeyDown } = useAutocompleteKeyboard({
    items: suggestions,
    isOpen,
    setIsOpen,
    onSelect: handleSelectSuggestion,
  });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold text-gray-500 uppercase">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>

          {inputValue.trim() && (
            <button
              type="button"
              onClick={() => openInGoogleMaps(inputValue)}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              title="Apri e verifica su Google Maps"
            >
              <ExternalLinkIcon className="w-3 h-3" />
              <span>Verifica su Maps</span>
            </button>
          )}
        </div>
      )}

      <div className="relative flex items-center">
        {/* Left Location Icon */}
        <div className="absolute left-3 text-gray-400 pointer-events-none flex items-center">
          {isLoading ? (
            <LoadingIcon className="w-4 h-4 text-blue-500 animate-spin" />
          ) : (
            <LocationIcon className="w-4 h-4" />
          )}
        </div>

        {/* Input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${className}`}
        />

        {/* Right Clear Button */}
        {inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            title="Cancella luogo"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-60 overflow-y-auto divide-y divide-gray-100">
          {suggestions.map((suggestion, index) => {
            const isHighlighted = index === highlightedIndex;
            return (
              <div
                key={suggestion.id}
                onClick={() => handleSelectSuggestion(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-3 py-2.5 flex items-start gap-2.5 cursor-pointer transition-colors ${
                  isHighlighted ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-gray-50 text-gray-800'
                }`}
              >
                <div className="mt-0.5 text-blue-500 shrink-0">
                  <LocationIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate leading-snug">
                    {suggestion.mainText}
                  </p>
                  {suggestion.secondaryText && (
                    <p className="text-[11px] text-gray-500 truncate leading-tight">
                      {suggestion.secondaryText}
                    </p>
                  )}
                </div>
                {suggestion.source === 'google' && (
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider self-center px-1.5 py-0.5 bg-gray-100 rounded">
                    Maps
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LocationAutocompleteInput;
