// src/components/AppUpdateChecker.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { checkAppUpdate, type VersionCheckResult } from '@/services/versionChecker';
import AppUpdateModal from '@/components/modals/AppUpdateModal';

export const AppUpdateChecker: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<VersionCheckResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const runCheck = useCallback(async (ignoreDismissed = false) => {
    // Il check automatico all'avvio viene eseguito sui dispositivi mobili nativi (APK Android)
    if (!Capacitor.isNativePlatform() && !ignoreDismissed) {
      return;
    }

    const res = await checkAppUpdate(ignoreDismissed);
    if (res && res.hasUpdate) {
      setUpdateInfo(res);
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    // Piccolo delay iniziale per permettere a Tailscale e alla rete di stabilizzarsi all'apertura
    const timer = setTimeout(() => {
      runCheck(false);
    }, 2500);

    // Event listener per controlli manuali (es. da Impostazioni Mobile)
    const handleManualCheck = () => {
      runCheck(true);
    };

    window.addEventListener('vita:check-update', handleManualCheck);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('vita:check-update', handleManualCheck);
    };
  }, [runCheck]);

  if (!updateInfo) return null;

  return (
    <AppUpdateModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      currentVersion={updateInfo.currentVersion}
      remoteVersion={updateInfo.remoteVersion}
      driveUrl={updateInfo.driveUrl}
      notes={updateInfo.notes}
    />
  );
};

export default AppUpdateChecker;
