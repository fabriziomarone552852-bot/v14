// src/mobile/components/settings/MobileWeatherCityModal.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Loader2, MapPin } from 'lucide-react';
import { weatherApi } from '@/api/weatherApi';
import type { LocationSearchResult } from '@/types/weather';

export interface MobileWeatherCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCityName: string;
  onSelectLocation: (loc: LocationSearchResult) => void;
}

export const MobileWeatherCityModal: React.FC<MobileWeatherCityModalProps> = ({
  isOpen,
  onClose,
  currentCityName,
  onSelectLocation,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!isOpen || trimmed.length < 2) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      if (cancelled) return;
      setIsSearching(true);
      try {
        const items = await weatherApi.searchLocations(trimmed);
        if (!cancelled) {
          setResults(items);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, isOpen]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
    }
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
    onClose();
  };

  if (!isOpen || typeof document === 'undefined') return null;

  const modalNode = (
    <div
      className="fixed inset-0 z-[10040] flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-xs animate-fadeIn select-none"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm max-h-[80dvh] bg-white rounded-3xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modale */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900">Scegli Città Meteo</h3>
            <p className="text-[11px] text-gray-500">Attuale: {currentCityName}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 flex items-center justify-center transition cursor-pointer"
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>

        {/* Barra di Ricerca */}
        <div className="p-3.5 border-b border-gray-100 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Digita città (es. Foggia, Milano, Roma...)"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-9 pr-9 py-2.5 text-xs font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
            )}
          </div>
        </div>

        {/* Lista Risultati Touch-Friendly */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {query.trim().length < 2 ? (
            <div className="py-6 text-center text-xs text-gray-400 font-medium">
              Scrivi almeno 2 lettere per cercare una località
            </div>
          ) : !isSearching && results.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400 font-medium">
              Nessuna località trovata
            </div>
          ) : (
            results.map((item, idx) => (
              <button
                key={`${item.latitude}-${item.longitude}-${idx}`}
                type="button"
                onClick={() => {
                  onSelectLocation(item);
                  handleClose();
                }}
                className="w-full py-3 px-3.5 rounded-2xl bg-gray-50 hover:bg-blue-50 active:bg-blue-100/70 border border-gray-100 hover:border-blue-200 text-left flex items-start gap-2.5 transition cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-gray-900 truncate">{item.name}</div>
                  <div className="text-[11px] text-gray-500 truncate">{item.display_name}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
};
