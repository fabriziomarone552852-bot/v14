// src/components/shared/offline/NetworkStatusBadge.tsx
import React, { useState } from 'react';
import { RefreshCw, WifiOff, CloudUpload, AlertCircle } from 'lucide-react';
import { useNetworkStore } from '@/offline/networkManager';
import { OfflineQueueModal } from './OfflineQueueModal';

interface NetworkStatusBadgeProps {
  showWhenOnline?: boolean;
  className?: string;
}

export const NetworkStatusBadge: React.FC<NetworkStatusBadgeProps> = ({
  showWhenOnline = false,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isOnline = useNetworkStore((state) => state.isOnline);
  const isServerReachable = useNetworkStore((state) => state.isServerReachable);
  const syncState = useNetworkStore((state) => state.syncState);
  const pendingCount = useNetworkStore((state) => state.pendingCount);

  const isDisconnected = !isOnline || !isServerReachable;

  // 1. Stato Sincronizzazione in corso
  if (syncState === 'syncing') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 ${className}`}
          title="Sincronizzazione in corso con il server"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          <span className="truncate">Sincro...</span>
        </button>

        <OfflineQueueModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  // 2. Stato Errore o modifiche fallite
  if (syncState === 'error' && pendingCount > 0) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 ${className}`}
          title={`${pendingCount} modifiche con errore di sincronizzazione`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>Errore ({pendingCount})</span>
        </button>

        <OfflineQueueModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  // 3. Stato Disconnesso / Offline
  if (isDisconnected) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 ${className}`}
          title={pendingCount > 0 ? `Offline - ${pendingCount} modifiche salvate in locale` : 'Modalità Offline'}
        >
          <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Offline{pendingCount > 0 ? ` (${pendingCount})` : ''}</span>
        </button>

        <OfflineQueueModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  // 4. Connesso ma con modifiche pendenti ancora da sincronizzare
  if (pendingCount > 0) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 ${className}`}
          title={`${pendingCount} modifiche in attesa di invio`}
        >
          <CloudUpload className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>In coda ({pendingCount})</span>
        </button>

        <OfflineQueueModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  // 5. Online & Sincronizzato
  if (showWhenOnline) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95 ${className}`}
          title="Online - Connesso al server"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">Online</span>
        </button>

        <OfflineQueueModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return null;
};

export default NetworkStatusBadge;
