// src/mobile/hooks/useIsMobile.ts
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const useIsMobile = (): boolean => {
  const checkIsMobile = (): boolean => {
    if (Capacitor.isNativePlatform()) return true;
    if (typeof window === 'undefined') return false;

    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'mobile') return true;
    if (params.get('mode') === 'desktop') return false;

    const stored = localStorage.getItem('smartagenda_view_mode');
    if (stored === 'mobile') return true;
    if (stored === 'desktop') return false;

    return window.innerWidth < 768;
  };

  const [isMobile, setIsMobile] = useState<boolean>(checkIsMobile);

  useEffect(() => {
    const handleCheck = () => setIsMobile(checkIsMobile());
    window.addEventListener('resize', handleCheck);
    window.addEventListener('storage', handleCheck);
    return () => {
      window.removeEventListener('resize', handleCheck);
      window.removeEventListener('storage', handleCheck);
    };
  }, []);

  return isMobile;
};

export default useIsMobile;
