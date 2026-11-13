// src/mobile/components/trackers/shared/MobileUserStreamingProvidersModal.tsx
import React, { useState, useMemo } from 'react';
import { SelectModalDialog } from '@/components/shared/form/SelectModalDialog';
import { CheckCircleIcon, SearchIcon, TvIcon } from '@/components/shared/utils/Icons';
import type { UserStreamingProvider } from '@/types/auth';

export interface MobileUserStreamingProvidersModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProviders: UserStreamingProvider[];
  selectedProviderIds: Set<number>;
  onToggleProvider: (provider: UserStreamingProvider) => void;
  onClearAll?: () => void;
  isLoading?: boolean;
}

export const MobileUserStreamingProvidersModal: React.FC<
  MobileUserStreamingProvidersModalProps
> = ({
  isOpen,
  onClose,
  allProviders,
  selectedProviderIds,
  onToggleProvider,
  onClearAll,
  isLoading = false,
}) => {
  const [search, setSearch] = useState('');

  const filteredProviders = useMemo(() => {
    if (!search.trim()) return allProviders;
    const q = search.trim().toLowerCase();
    return allProviders.filter((p) => p.provider_name.toLowerCase().includes(q));
  }, [allProviders, search]);

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  const selectedCount = selectedProviderIds.size;

  return (
    <SelectModalDialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Le tue Piattaforme"
      maxWidthClass="max-w-sm"
      zIndex={10060}
    >
      <div className="space-y-3 py-1 select-none">
        {/* Barra di ricerca rapida piattaforma */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca piattaforma (es. Netflix, Prime, Disney+)..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
          />
          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Riga contatore + eventuale deseleziona tutte */}
        <div className="flex items-center justify-between px-1 text-[11px]">
          <span className="font-bold text-gray-500">
            {selectedCount === 0
              ? 'Nessuna piattaforma selezionata'
              : `${selectedCount} piattaform${selectedCount === 1 ? 'a attiva' : 'e attive'}`}
          </span>
          {selectedCount > 0 && onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="font-extrabold text-red-500 hover:text-red-600 active:scale-95 transition-all cursor-pointer"
            >
              Azzera
            </button>
          )}
        </div>

        {/* Elenco Piattaforme con logo ufficiale TMDB */}
        <div className="space-y-1.5 max-h-[52vh] overflow-y-auto custom-scrollbar pr-0.5">
          {isLoading && filteredProviders.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400 italic">
              Caricamento piattaforme in corso...
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400">
              Nessuna piattaforma trovata.
            </div>
          ) : (
            filteredProviders.map((p) => {
              const isSelected = selectedProviderIds.has(p.provider_id);
              const logoUrl = p.logo_path
                ? `https://image.tmdb.org/t/p/w92${p.logo_path}`
                : null;

              return (
                <button
                  key={p.provider_id}
                  type="button"
                  onClick={() => onToggleProvider(p)}
                  className={`w-full py-2.5 px-3 rounded-2xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-white border border-black/10 shrink-0 flex items-center justify-center shadow-2xs">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <TvIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <span className="font-bold truncate text-left">
                      {p.provider_name}
                    </span>
                  </div>

                  {isSelected && (
                    <CheckCircleIcon className="w-4 h-4 text-white shrink-0 ml-2" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </SelectModalDialog>
  );
};

export default MobileUserStreamingProvidersModal;
