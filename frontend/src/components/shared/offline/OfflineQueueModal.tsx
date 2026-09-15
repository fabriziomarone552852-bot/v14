// src/components/shared/offline/OfflineQueueModal.tsx
import React, { useState } from 'react';
import {
  RefreshCw,
  Trash2,
  AlertCircle,
  Clock,
  WifiOff,
  CheckCircle2,
  CloudUpload,
} from 'lucide-react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import MobileBaseModal from '@/mobile/components/modals/MobileBaseModal';
import { useIsMobile } from '@/mobile/hooks/useIsMobile';
import { useOutboxStore } from '@/offline/outboxStore';
import { useNetworkStore } from '@/offline/networkManager';
import { processOutboxQueue } from '@/offline/syncEngine';
import type { OutboxItem } from '@/offline/types';

interface OfflineQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineQueueModal: React.FC<OfflineQueueModalProps> = ({ isOpen, onClose }) => {
  const isMobile = useIsMobile();
  const items = useOutboxStore((state) => state.items);
  const clearQueue = useOutboxStore((state) => state.clear);
  const dequeueItem = useOutboxStore((state) => state.dequeue);
  const syncState = useNetworkStore((state) => state.syncState);
  const isOnline = useNetworkStore((state) => state.isOnline);
  const isServerReachable = useNetworkStore((state) => state.isServerReachable);
  const lastSyncedAt = useNetworkStore((state) => state.lastSyncedAt);

  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setIsManualSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await processOutboxQueue();
      if (result.succeeded > 0) {
        setSyncFeedback(`Sincronizzati con successo ${result.succeeded} elementi!`);
      } else if (result.failed > 0) {
        setSyncFeedback(`Si sono verificati ${result.failed} errori durante la sincronizzazione.`);
      } else if (result.processed === 0) {
        setSyncFeedback('Nessun elemento da sincronizzare.');
      }
    } catch {
      setSyncFeedback('Impossibile completare la sincronizzazione.');
    } finally {
      setIsManualSyncing(false);
    }
  };

  const methodBadge = (method: OutboxItem['method']) => {
    switch (method) {
      case 'POST':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">POST</span>;
      case 'PATCH':
      case 'PUT':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800">{method}</span>;
      case 'DELETE':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800">DEL</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-gray-100 text-gray-800">{method}</span>;
    }
  };

  const modalBody = (
    <div className="space-y-4 select-none">
      {/* 1. Card Stato Connettività */}
      <div
        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
          isOnline && isServerReachable
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/80 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
              isOnline && isServerReachable ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isOnline && isServerReachable ? <CloudUpload className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs font-extrabold">
              {isOnline && isServerReachable ? '🟢 Connesso al Server' : '🟡 Modalità Offline / Tunnel Down'}
            </div>
            <div className="text-[11px] opacity-80 mt-0.5">
              {lastSyncedAt
                ? `Ultima sincronizzazione: ${new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Nessuna sincronizzazione recente'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSyncNow}
          disabled={isManualSyncing || syncState === 'syncing' || items.length === 0}
          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing || syncState === 'syncing' ? 'animate-spin' : ''}`} />
          <span>Sincronizza</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {syncFeedback && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* 2. Elenco Modifiche in Coda */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
            Modifiche in Attesa ({items.length})
          </h4>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => void clearQueue()}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Svuota coda</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-8 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200 space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-gray-800">Nessuna modifica in sospeso</div>
            <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
              Tutti i dati locali sono sincronizzati con il server centrale.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-0.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-gray-200 bg-white hover:border-blue-200 transition-colors shadow-2xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {methodBadge(item.method)}
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {item.summary || item.entityName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {item.status === 'syncing' && (
                      <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> In corso
                      </span>
                    )}
                    {item.status === 'failed' && (
                      <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Errore
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => void dequeueItem(item.id)}
                      className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Elimina dalla coda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span className="truncate max-w-[200px] font-mono">{item.url}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {item.errorMessage && (
                  <div className="text-[10px] text-rose-700 bg-rose-50 p-1.5 rounded-lg font-medium">
                    {item.errorMessage}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileBaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Sincronizzazione & Offline"
        footer={
          <div className="w-full">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-sm transition shadow-xs cursor-pointer"
            >
              Chiudi
            </button>
          </div>
        }
      >
        <div className="p-1 pb-6">{modalBody}</div>
      </MobileBaseModal>
    );
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Stato Connettività & Coda Offline"
      maxWidthClass="max-w-lg"
      footer={
        <div className="flex justify-end w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition shadow-2xs cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      }
    >
      {modalBody}
    </BaseModal>
  );
};

export default OfflineQueueModal;
