// src/hooks/useSystemBroadcast.ts
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchActiveBroadcast } from '@/api/broadcastApi';
import type { SystemBroadcastResponse } from '@/types/broadcast';

const STORAGE_KEY_PREFIX = 'vita_dismissed_broadcast_';

export function useSystemBroadcast() {
  const { isAuthenticated } = useAuth();
  const [locallyDismissedId, setLocallyDismissedId] = useState<number | null>(null);

  const { data: activeBroadcast = null } = useQuery<SystemBroadcastResponse | null>({
    queryKey: ['systemBroadcast', 'active'],
    queryFn: fetchActiveBroadcast,
    enabled: Boolean(isAuthenticated),
    refetchInterval: 15000, // Polling a 15s per ricezione tempestiva degli avvisi di emergenza
    refetchOnWindowFocus: true,
  });

  const isDismissed = Boolean(
    activeBroadcast &&
      (locallyDismissedId === activeBroadcast.id ||
        localStorage.getItem(`${STORAGE_KEY_PREFIX}${activeBroadcast.id}`) === 'true')
  );

  const shouldShowPopup = Boolean(
    activeBroadcast &&
      activeBroadcast.is_active &&
      activeBroadcast.show_popup &&
      !isDismissed
  );

  const dismiss = useCallback(() => {
    if (activeBroadcast) {
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${activeBroadcast.id}`, 'true');
      } catch {
        // Ignora eventuali restrizioni di storage privato
      }
      setLocallyDismissedId(activeBroadcast.id);
    }
  }, [activeBroadcast]);

  return {
    activeBroadcast,
    shouldShowPopup,
    dismiss,
  };
}
