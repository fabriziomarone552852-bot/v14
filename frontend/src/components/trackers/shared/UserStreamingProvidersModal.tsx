// src/components/trackers/shared/UserStreamingProvidersModal.tsx
import React, { useState, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { CheckCircleIcon, CloseIcon, SearchIcon, TvIcon } from '@/components/shared/utils/Icons';
import type { UserStreamingProvider } from '@/types/auth';

export interface UserStreamingProvidersModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProviders: UserStreamingProvider[];
  selectedProviderIds: Set<number>;
  onToggleProvider: (provider: UserStreamingProvider) => void;
  onClearAll?: () => void;
  isLoading?: boolean;
}

export const UserStreamingProvidersModal: React.FC<UserStreamingProvidersModalProps> = ({
  isOpen,
  onClose,
  allProviders,
  selectedProviderIds,
  onToggleProvider,
  onClearAll,
  isLoading = false,
}) => {
  const [search, setSearch] = useState('');

  // Filtra per nome e sposta sempre in alto le piattaforme selezionate
  const sortedAndFilteredProviders = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q
      ? allProviders.filter((p) => p.provider_name.toLowerCase().includes(q))
      : allProviders;

    return [...base].sort((a, b) => {
      const aSelected = selectedProviderIds.has(a.provider_id) ? 1 : 0;
      const bSelected = selectedProviderIds.has(b.provider_id) ? 1 : 0;
      if (aSelected !== bSelected) {
        return bSelected - aSelected;
      }
      return 0;
    });
  }, [allProviders, search, selectedProviderIds]);

  const handleClose = () => {
    setSearch('');
    onClose();
  };

  const selectedCount = selectedProviderIds.size;

  const headerActions =
    selectedCount > 0 && onClearAll ? (
      <button
        type="button"
        onClick={onClearAll}
        title="Azzera selezione piattaforme"
        aria-label="Azzera selezione"
        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-all active:scale-90 cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    ) : undefined;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Le tue Piattaforme"
      maxWidthClass="max-w-xl"
      headerActions={headerActions}
      footer={null}
    >
      <div className="select-none flex flex-col">
        {/* Barra di ricerca rapida in alto */}
        <div className="relative z-20">
          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca piattaforma (es. Netflix, Prime Video, Disney+)..."
            className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full cursor-pointer"
              title="Pulisci ricerca"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Griglia a 4 colonne ad altezza costante */}
        <div className="relative mt-2.5">
          {/* Sfumatura sottile e discreta in cima che interviene solo allo scorrimento */}
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-3.5 bg-gradient-to-b from-white to-transparent z-10" />

          <div
            className="h-[55vh] overflow-y-auto no-scrollbar pt-3.5"
            style={{
              WebkitMaskImage:
                'linear-gradient(to bottom, transparent 0px, black 12px, black calc(100% - 10px), transparent 100%)',
              maskImage:
                'linear-gradient(to bottom, transparent 0px, black 12px, black calc(100% - 10px), transparent 100%)',
            }}
          >
            {isLoading && sortedAndFilteredProviders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400 italic">
                Caricamento piattaforme in corso...
              </div>
            ) : sortedAndFilteredProviders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                Nessuna piattaforma trovata.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 content-start">
              {sortedAndFilteredProviders.map((p) => {
                const isSelected = selectedProviderIds.has(p.provider_id);
                const logoUrl = p.logo_path
                  ? `https://image.tmdb.org/t/p/w92${p.logo_path}`
                  : null;

                return (
                  <button
                    key={p.provider_id}
                    type="button"
                    onClick={() => onToggleProvider(p)}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-2xl text-center transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'border-2 border-blue-600 bg-blue-50/60 text-blue-900 shadow-sm ring-2 ring-blue-500/15'
                        : 'border-2 border-gray-100 bg-gray-50/70 hover:bg-gray-100 hover:border-gray-200 text-gray-700'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 text-blue-600">
                        <CheckCircleIcon className="w-4 h-4" />
                      </span>
                    )}

                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-black/10 shrink-0 flex items-center justify-center shadow-xs mb-2">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={p.provider_name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <TvIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    <span className="text-xs font-bold leading-tight line-clamp-2 w-full">
                      {p.provider_name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  </BaseModal>
  );
};

export default UserStreamingProvidersModal;
