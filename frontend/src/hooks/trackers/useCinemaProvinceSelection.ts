// src/hooks/trackers/useCinemaProvinceSelection.ts
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  useCinemaProvinces,
  useProvinceCinemaData,
} from '@/hooks/queries/useCinemaQueries';

const PROVINCE_STORAGE_KEY = 'vita_cinema_province';
const PROVINCE_CHANGE_EVENT = 'vita-cinema-province-changed';

export const useCinemaProvinceSelection = (
  onProvinceChanged?: () => void,
  enabled: boolean = true
) => {
  const [selectedProvinceSlug, setSelectedProvinceSlug] = useState<string>(() => {
    return localStorage.getItem(PROVINCE_STORAGE_KEY) || 'milano';
  });
  const [isProvinceModalOpen, setIsProvinceModalOpen] = useState(false);

  const { data: provinces = [] } = useCinemaProvinces(enabled);
  const { data: provinceData, isLoading: isLoadingCinema } = useProvinceCinemaData(
    selectedProvinceSlug,
    enabled
  );

  const currentProvince = useMemo(() => {
    return (
      provinces.find((p) => p.slug === selectedProvinceSlug) || {
        name: provinceData?.province_name || selectedProvinceSlug.toUpperCase(),
        slug: selectedProvinceSlug,
      }
    );
  }, [provinces, selectedProvinceSlug, provinceData]);

  // Sincronizza eventuali cambi provincia effettuati in altre viste/modali (es. dettaglio film <-> homepage)
  useEffect(() => {
    const handleSync = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail && custom.detail !== selectedProvinceSlug) {
        setSelectedProvinceSlug(custom.detail);
        onProvinceChanged?.();
      }
    };
    window.addEventListener(PROVINCE_CHANGE_EVENT, handleSync);
    return () => {
      window.removeEventListener(PROVINCE_CHANGE_EVENT, handleSync);
    };
  }, [selectedProvinceSlug, onProvinceChanged]);

  const handleSelectProvince = useCallback(
    (slug: string) => {
      setSelectedProvinceSlug(slug);
      localStorage.setItem(PROVINCE_STORAGE_KEY, slug);
      window.dispatchEvent(new CustomEvent<string>(PROVINCE_CHANGE_EVENT, { detail: slug }));
      onProvinceChanged?.();
    },
    [onProvinceChanged]
  );

  return {
    provinces,
    selectedProvinceSlug,
    provinceData,
    isLoadingCinema,
    currentProvince,
    isProvinceModalOpen,
    setIsProvinceModalOpen,
    handleSelectProvince,
  };
};
