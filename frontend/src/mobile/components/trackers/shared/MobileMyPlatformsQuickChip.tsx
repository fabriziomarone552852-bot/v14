// src/mobile/components/trackers/shared/MobileMyPlatformsQuickChip.tsx
import React, { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserStreamingProviders } from '@/hooks/trackers/useUserStreamingProviders';
import {
  buildMyPlatformsArray,
  isMyPlatformsArray,
} from '@/utils/platformFilterUtils';
import { MobileUserStreamingProvidersModal } from './MobileUserStreamingProvidersModal';

export interface MobileMyPlatformsQuickChipProps {
  currentValues: readonly string[];
  availableOptions?: ReadonlyArray<{ value: string; label: string }>;
  onSelectValues: (nextValues: string[]) => void;
}

export const MobileMyPlatformsQuickChip: React.FC<MobileMyPlatformsQuickChipProps> = ({
  currentValues,
  availableOptions,
  onSelectValues,
}) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const applyOnCloseRef = useRef(false);

  const {
    userProviders,
    userProviderIds,
    allCatalogProviders,
    isLoadingProviders,
    toggleProvider,
    clearProviders,
  } = useUserStreamingProviders();

  const isActive = isMyPlatformsArray(currentValues, userProviders);

  const handleClick = () => {
    if (userProviders.length === 0) {
      applyOnCloseRef.current = true;
      setIsModalOpen(true);
      return;
    }

    if (isActive) {
      onSelectValues([]);
    } else {
      onSelectValues(buildMyPlatformsArray(userProviders, availableOptions));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (applyOnCloseRef.current) {
      applyOnCloseRef.current = false;
      const latestProviders = user?.streaming_providers ?? [];
      if (latestProviders.length > 0) {
        onSelectValues(buildMyPlatformsArray(latestProviders, availableOptions));
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`h-[18px] px-1.5 rounded-md text-[10px] leading-none font-extrabold transition-all cursor-pointer flex items-center justify-center border shrink-0 ${
          isActive
            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs active:scale-95'
            : 'bg-blue-50/90 text-blue-600 border-blue-200/80 hover:bg-blue-100 active:scale-95'
        }`}
        title={
          isActive
            ? 'Rimuovi filtro sulle tue piattaforme'
            : 'Seleziona automaticamente le tue piattaforme'
        }
      >
        <span>Le mie</span>
      </button>

      <MobileUserStreamingProvidersModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        allProviders={allCatalogProviders}
        selectedProviderIds={userProviderIds}
        onToggleProvider={toggleProvider}
        onClearAll={clearProviders}
        isLoading={isLoadingProviders}
      />
    </>
  );
};

export default MobileMyPlatformsQuickChip;
