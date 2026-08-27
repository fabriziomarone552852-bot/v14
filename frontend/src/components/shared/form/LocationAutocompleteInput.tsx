// src/components/shared/form/LocationAutocompleteInput.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LocationIcon, ExternalLinkIcon, LoadingIcon } from '@/components/shared/utils/Icons';
import { loadGoogleMaps } from '@/utils/googleMapsLoader';
import { openInGoogleMaps } from '@/utils/mapUtils';

export interface LocationSuggestion {
  id: string;
  mainText: string;
  secondaryText?: string;
  fullText: string;
  source: 'google' | 'osm';
}

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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Initialize Google Maps on mount
  useEffect(() => {
    loadGoogleMaps();
  }, []);

  // Fetch fallback suggestions from Photon / Nominatim (OpenStreetMap)
  const fetchFallbackSuggestions = useCallback(async (query: string): Promise<LocationSuggestion[]> => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    try {
      // 1. Try Photon (fast search)
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=5`
      );
      if (response.ok) {
        const data = await response.json();
        const features: any[] = data.features || [];
        if (features.length > 0) {
          return features.map((f: any): LocationSuggestion => {
            const p = f.properties || {};
            const streetAndNum = [p.street, p.housenumber].filter(Boolean).join(' ');
            const main = p.name || streetAndNum || p.city || trimmed;
            const secondaryParts = [
              streetAndNum && streetAndNum !== main ? streetAndNum : null,
              p.city || p.town || p.village,
              p.state,
              p.country,
            ].filter(Boolean);

            const fullParts = [
              p.name,
              streetAndNum && streetAndNum !== p.name ? streetAndNum : null,
              p.city || p.town || p.village,
              p.state,
              p.country,
            ].filter(Boolean);

            const uniqueFull = fullParts.filter((v, idx, arr) => arr.indexOf(v) === idx).join(', ');

            return {
              id: `osm-${p.osm_id || Math.random()}`,
              mainText: main,
              secondaryText: secondaryParts.join(', '),
              fullText: uniqueFull || main,
              source: 'osm',
            };
          });
        }
      }
    } catch {
      // Fall through to Nominatim
    }

    try {
      // 2. OpenStreetMap Nominatim
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&addressdetails=1&limit=5&accept-language=it`
      );
      if (nomRes.ok) {
        const items: any[] = await nomRes.json();
        return items.map((item) => {
          const parts = (item.display_name || '').split(',');
          const main = parts[0] || trimmed;
          const secondary = parts.slice(1, 4).join(',').trim();
          return {
            id: `nom-${item.place_id || Math.random()}`,
            mainText: main,
            secondaryText: secondary,
            fullText: item.display_name,
            source: 'osm',
          };
        });
      }
    } catch {
      // Empty
    }

    return [];
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

      // 1. Try modern Google Places AutocompleteSuggestion (New Places API)
      const placesLib = window.google?.maps?.places as any;
      if (placesLib?.AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
        try {
          const response = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: trimmed,
          });
          const suggestionsList = response?.suggestions || [];
          if (suggestionsList.length > 0) {
            const formatted: LocationSuggestion[] = suggestionsList
              .filter((s: any) => s.placePrediction)
              .map((s: any) => {
                const p = s.placePrediction;
                const main = p.mainText?.text || p.text?.text || trimmed;
                const secondary = p.secondaryText?.text || '';
                const full = p.text?.text || (secondary ? `${main}, ${secondary}` : main);
                return {
                  id: p.placeId || `google-${Math.random()}`,
                  mainText: main,
                  secondaryText: secondary,
                  fullText: full,
                  source: 'google',
                };
              });

            if (formatted.length > 0) {
              setSuggestions(formatted);
              setIsOpen(true);
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // Google Places API error (e.g. 403 Forbidden or API not enabled) -> silently fall back
        }
      }

      // 2. OpenStreetMap / Photon Fallback
      const osmResults = await fetchFallbackSuggestions(trimmed);
      setSuggestions(osmResults);
      setIsOpen(osmResults.length > 0);
      setIsLoading(false);
    },
    [fetchFallbackSuggestions]
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
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

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
