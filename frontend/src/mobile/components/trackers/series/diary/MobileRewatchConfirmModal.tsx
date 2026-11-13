// src/mobile/components/trackers/diary/MobileRewatchConfirmModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { RotateCw, CheckCircle, X } from 'lucide-react';
import { useBackHandler } from '@/utils/backButtonManager';

export interface MobileRewatchConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  seriesTitle: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle?: string | null;
  currentWatchCount: number;
  onConfirmSingle: () => void;
  onConfirmRewatchSeries: () => void;
}

export const MobileRewatchConfirmModal: React.FC<MobileRewatchConfirmModalProps> = ({
  isOpen,
  onClose,
  seriesTitle,
  seasonNumber,
  episodeNumber,
  episodeTitle,
  currentWatchCount,
  onConfirmSingle,
  onConfirmRewatchSeries,
}) => {
  useBackHandler(isOpen, () => {
    onClose();
    return true;
  }, 30);

  if (!isOpen) return null;

  const epCode = `S${String(seasonNumber).padStart(2, '0')} E${String(episodeNumber).padStart(2, '0')}`;
  const epDisplay = episodeTitle ? `${epCode} • ${episodeTitle}` : epCode;

  const content = (
    <div
      className="fixed inset-0 z-[10080] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-scaleUp border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con icona e chiusura */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
              <RotateCw className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 truncate">
                {seriesTitle}
              </span>
              <h3 className="text-sm font-extrabold text-gray-900 leading-snug truncate">
                {epDisplay}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center shrink-0 active:scale-95 transition-all cursor-pointer"
            aria-label="Chiudi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Testo esplicativo */}
        <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100">
          <p className="text-xs text-gray-600 leading-relaxed">
            Hai già visto questo episodio{' '}
            <span className="font-bold text-gray-900">
              {currentWatchCount === 1 ? '1 volta' : `${currentWatchCount} volte`}
            </span>
            . Come vuoi registrare questa nuova visione?
          </p>
        </div>

        {/* Pulsanti Azione */}
        <div className="flex flex-col gap-2.5 pt-1">
          {/* Opzione 1: Riguarda l'intera serie (Rewatch attivo) */}
          <button
            type="button"
            onClick={() => {
              onConfirmRewatchSeries();
              onClose();
            }}
            className="w-full h-12 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-left min-w-0">
              <RotateCw className="w-4 h-4 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="leading-tight truncate">Continua a riguardare la serie</span>
                <span className="text-[10px] text-blue-100 font-normal">Entra in &quot;I prossimi da guardare&quot;</span>
              </div>
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full shrink-0">
              Rewatch
            </span>
          </button>

          {/* Opzione 2: Solo questo episodio */}
          <button
            type="button"
            onClick={() => {
              onConfirmSingle();
              onClose();
            }}
            className="w-full h-11 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-98 text-gray-800 font-bold text-xs flex items-center justify-between border border-gray-200 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-left min-w-0">
              <CheckCircle className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="truncate">Solo questo episodio</span>
            </div>
            <span className="text-[10px] text-gray-500 font-semibold shrink-0">Singolo</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileRewatchConfirmModal;
