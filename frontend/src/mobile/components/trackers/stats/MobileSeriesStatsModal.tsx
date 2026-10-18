// src/mobile/components/trackers/stats/MobileSeriesStatsModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { useFullSeriesStats } from '@/hooks/queries/useTrackersQueries';
import { useBackHandler } from '@/utils/backButtonManager';
import { LoadingIcon, BackIcon } from '@/components/shared/utils/Icons';
import { MobileStatsOverviewSection } from './MobileStatsOverviewSection';
import { MobileStatsRatingsSection } from './MobileStatsRatingsSection';
import { MobileStatsHabitsSection } from './MobileStatsHabitsSection';
import { MobileStatsRewatchSection } from './MobileStatsRewatchSection';

export interface MobileSeriesStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  zIndexClass?: string;
}

export const MobileSeriesStatsModal: React.FC<MobileSeriesStatsModalProps> = ({
  isOpen,
  onClose,
  zIndexClass,
}) => {
  const { data: stats, isLoading, isError, refetch } = useFullSeriesStats();

  // Supporto al tasto indietro nativo Android (Hardware / Gesture Back)
  useBackHandler(
    isOpen,
    () => {
      onClose();
      return true;
    },
    20 // Priorità alta per modale attivo
  );

  if (!isOpen) return null;

  const content = (
    <div
      className={`fixed inset-0 ${
        zIndexClass || 'z-[10020]'
      } bg-slate-50 flex flex-col h-[100dvh] w-full overflow-hidden select-none animate-fadeIn`}
    >
      {/* 1. Header Superiore Fisso */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            aria-label="Torna indietro"
            className="w-9 h-9 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer shrink-0 flex items-center justify-center"
            title="Torna indietro"
          >
            <BackIcon className="w-5 h-5 text-gray-800" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-800 uppercase tracking-wider leading-none">
              Statistiche
            </h1>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Serie TV
            </span>
          </div>
        </div>
      </div>

      {/* 2. Contenuto Modale */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <LoadingIcon className="w-9 h-9 animate-spin text-blue-500" />
          <p className="font-bold text-sm text-slate-600">
            Elaborazione statistiche in corso...
          </p>
        </div>
      ) : isError || !stats ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <span className="text-4xl">⚠️</span>
          <p className="font-bold text-sm text-red-500">
            Errore durante il caricamento delle statistiche.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-500 text-white font-bold text-xs rounded-xl hover:bg-blue-600 active:scale-95 transition-all"
            >
              Riprova
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 active:scale-95 transition-all"
            >
              Chiudi
            </button>
          </div>
        </div>
      ) : (
        /* 3. Scorrimento Verticale Continuo */
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-8 scrollbar-none pb-16">
          {/* Sezione 1: Panoramica */}
          <MobileStatsOverviewSection stats={stats} />

          {/* Sezione 2: Valutazioni & Voti */}
          <MobileStatsRatingsSection stats={stats} />

          {/* Sezione 3: Abitudini di Visione */}
          <MobileStatsHabitsSection stats={stats} />

          {/* Sezione 4: Rewatch & Fedeltà */}
          <MobileStatsRewatchSection stats={stats} />
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileSeriesStatsModal;
