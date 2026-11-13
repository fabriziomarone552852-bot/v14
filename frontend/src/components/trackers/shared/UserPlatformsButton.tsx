// src/components/trackers/shared/UserPlatformsButton.tsx
import React, { useState } from 'react';
import { TvIcon } from '@/components/shared/utils/Icons';
import { useUserStreamingProviders } from '@/hooks/trackers/useUserStreamingProviders';
import { UserStreamingProvidersModal } from './UserStreamingProvidersModal';

export const UserPlatformsButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    userProviders,
    userProviderIds,
    allCatalogProviders,
    isLoadingProviders,
    toggleProvider,
    clearProviders,
  } = useUserStreamingProviders();

  const selectedCount = userProviders.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-3.5 py-2 border border-gray-300 hover:border-blue-400 rounded-xl leading-5 bg-white/95 backdrop-blur-md shadow-sm text-gray-700 hover:text-blue-600 text-sm font-bold transition-all cursor-pointer active:scale-95 shrink-0 select-none"
        title="Gestisci le tue piattaforme streaming"
      >
        <TvIcon className="w-4 h-4 text-blue-600 shrink-0" />
        <span>Piattaforme</span>
        {selectedCount > 0 && (
          <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-black leading-none flex items-center justify-center shadow-2xs">
            {selectedCount}
          </span>
        )}
      </button>

      <UserStreamingProvidersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        allProviders={allCatalogProviders}
        selectedProviderIds={userProviderIds}
        onToggleProvider={toggleProvider}
        onClearAll={clearProviders}
        isLoading={isLoadingProviders}
      />
    </>
  );
};

export default UserPlatformsButton;
