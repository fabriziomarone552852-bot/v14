// src/components/AppUpdateChecker.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { checkAppUpdate, type VersionCheckResult } from '@/services/versionChecker';
import AppUpdateModal from '@/components/modals/AppUpdateModal';

export const AppUpdateChecker: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<VersionCheckResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const hasCheckedRef = React.useRef(false);

  const runCheck = useCallback(async (ignoreDismissed = false): Promise<boolean> => {
    // Il check automatico all'avvio viene eseguito sui dispositivi mobili nativi (APK Android)
    if (!Capacitor.isNativePlatform() && !ignoreDismissed) {
      return false;
    }

    const res = await checkAppUpdate(ignoreDismissed);
    if (res) {
      hasCheckedRef.current = true;
      if (res.hasUpdate) {
        setUpdateInfo(res);
        setIsOpen(true);
      }
      return true; // Risposta ricevuta dal server
    }
    return false; // Server non ancora raggiungibile (Tailscale in avvio o offline)
  }, []);

  useEffect(() => {
    const timeouts: Array<ReturnType<typeof setTimeout>> = [];

    // Retry progressivo: Tailscale impiega mediamente 4-8 secondi per stabilire il tunnel locale
    // Tentativo 1: dopo 3 secondi
    timeouts.push(
      setTimeout(async () => {
        const ok = await runCheck(false);
        // Tentativo 2: dopo 8 secondi complessivi se il primo è fallito
        if (!ok && !hasCheckedRef.current) {
          timeouts.push(
            setTimeout(async () => {
              const ok2 = await runCheck(false);
              // Tentativo 3: dopo 18 secondi se la rete era ancora lenta
              if (!ok2 && !hasCheckedRef.current) {
                timeouts.push(setTimeout(() => runCheck(false), 10000));
              }
            }, 5000)
          );
        }
      }, 3000)
    );

    // Event listener per controlli manuali (es. da Impostazioni Mobile)
    const handleManualCheck = () => {
      runCheck(true);
    };

    window.addEventListener('vita:check-update', handleManualCheck);

    return () => {
      timeouts.forEach(clearTimeout);
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
