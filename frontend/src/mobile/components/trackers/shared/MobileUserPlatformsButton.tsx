// src/mobile/components/trackers/shared/MobileUserPlatformsButton.tsx
import React, { useState } from 'react';
import { TvIcon } from '@/components/shared/utils/Icons';
import { useUserStreamingProviders } from '@/hooks/trackers/useUserStreamingProviders';
import { MobileUserStreamingProvidersModal } from './MobileUserStreamingProvidersModal';

export interface MobileUserPlatformsButtonProps {
  variant?: 'catalog-header' | 'showcase-glass';
  onOpenModal?: () => void;
}

export const MobileUserPlatformsButton: React.FC<MobileUserPlatformsButtonProps> = ({
  variant = 'catalog-header',
  onOpenModal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    userProviders,
    userProviderIds,
    randomUserProvider,
    allCatalogProviders,
    isLoadingProviders,
    toggleProvider,
    clearProviders,
  } = useUserStreamingProviders();

  const selectedCount = userProviders.length;

  const handleOpen = () => {
    if (onOpenModal) {
      onOpenModal();
    } else {
      setIsModalOpen(true);
    }
  };

  const logoUrl = randomUserProvider?.logo_path
    ? `https://image.tmdb.org/t/p/w92${randomUserProvider.logo_path}`
    : null;

  return (
    <>
      {variant === 'showcase-glass' ? (
        randomUserProvider ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            className="w-7 h-7 rounded-xl overflow-hidden bg-white/20 backdrop-blur-xs border border-white/35 shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
            title={`Piattaforme disponibili (${randomUserProvider.provider_name})`}
            aria-label={`Piattaforme disponibili (${randomUserProvider.provider_name})`}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={randomUserProvider.provider_name}
                className="w-full h-full object-cover bg-white"
              />
            ) : (
              <TvIcon className="w-3.5 h-3.5 text-white shrink-0" />
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white font-extrabold text-[11px] backdrop-blur-xs border border-white/25 shadow-2xs transition-all active:scale-[0.98] cursor-pointer shrink-0"
            title="Gestisci le tue piattaforme streaming"
          >
            <TvIcon className="w-3.5 h-3.5 text-white shrink-0" />
            <span>Piattaforme</span>
          </button>
        )
      ) : randomUserProvider ? (
        <button
          type="button"
          onClick={handleOpen}
          className="relative flex items-center justify-center shrink-0 transition-all active:scale-95 cursor-pointer"
          title={`Piattaforme disponibili (${selectedCount})`}
          aria-label={`Piattaforme disponibili (${selectedCount})`}
        >
          <span className="w-8 h-8 rounded-xl overflow-hidden bg-white border border-gray-200/90 shadow-xs flex items-center justify-center shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={randomUserProvider.provider_name}
                className="w-full h-full object-cover bg-white"
              />
            ) : (
              <TvIcon className="w-4 h-4 text-blue-600 shrink-0" />
            )}
          </span>
          <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-black leading-none flex items-center justify-center border-2 border-white shadow-xs">
            {selectedCount}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-extrabold bg-gray-100 hover:bg-gray-200/80 text-gray-700 border border-gray-200/90 transition-all active:scale-95 cursor-pointer shadow-2xs shrink-0"
          title="Gestisci le tue piattaforme disponibili"
        >
          <TvIcon className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <span>Piattaforme</span>
        </button>
      )}

      {!onOpenModal && (
        <MobileUserStreamingProvidersModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          allProviders={allCatalogProviders}
          selectedProviderIds={userProviderIds}
          onToggleProvider={toggleProvider}
          onClearAll={clearProviders}
          isLoading={isLoadingProviders}
        />
      )}
    </>
  );
};

export default MobileUserPlatformsButton;
