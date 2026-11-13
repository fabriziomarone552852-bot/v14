// src/mobile/components/trackers/detail/MobileMovieOptionsModal.tsx
import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { History, PackageCheck, Package, RotateCw, Trash2 } from 'lucide-react';
import { mediaService } from '@/api/mediaService';
import { logger } from '@/utils/logger';
import { PhotoIcon, LoadingIcon, CloseIcon } from '@/components/shared/utils/Icons';
import { useBackHandler } from '@/utils/backButtonManager';
import { showTrackerToast } from '@/components/trackers/shared/TrackerToast';

export interface MobileMovieOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasCustomPoster: boolean;
  onPosterUpdated: (newUrl: string | null) => void;
  isUserTracked: boolean;
  isWatched?: boolean;
  watchCount?: number;
  onRewatch?: () => void;
  isObtained?: boolean;
  obtainedAt?: string | null;
  onToggleObtained?: () => void;
  isHistoricMode?: boolean;
  onToggleHistoricMode?: () => void;
}

export const MobileMovieOptionsModal: React.FC<MobileMovieOptionsModalProps> = ({
  isOpen,
  onClose,
  hasCustomPoster,
  onPosterUpdated,
  isUserTracked,
  isWatched = false,
  watchCount = 0,
  onRewatch,
  isObtained = false,
  obtainedAt,
  onToggleObtained,
  isHistoricMode = false,
  onToggleHistoricMode,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useBackHandler(isOpen, onClose, 25);

  if (!isOpen) return null;

  const formattedObtainedDate = obtainedAt
    ? new Date(obtainedAt).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

  const handleSelectSystemImage = () => {
    if (!isUserTracked) {
      showTrackerToast('Aggiungi prima il film alla tua libreria per personalizzare la locandina', 'warning');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await mediaService.uploadImage(file, 'trackers');
      onPosterUpdated(res.url);
      showTrackerToast('Locandina aggiornata con successo', 'success');
      onClose();
    } catch (error) {
      logger.error('Errore durante il caricamento della locandina:', error);
      showTrackerToast('Errore durante il caricamento della foto. Riprova.', 'warning');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetPoster = () => {
    onPosterUpdated(null);
    onClose();
  };

  const content = (
    <div className="fixed inset-0 z-[10060] flex items-center justify-center p-4 animate-fadeIn select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={isUploading ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Input file nativo di sistema invisibile */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Finestra Modale Centrata touch-friendly */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-options-title"
        className="relative w-full max-w-xs bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-scaleUp z-10"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <h3 id="movie-options-title" className="font-extrabold text-gray-900 text-sm tracking-wide">
            Opzioni Film
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors cursor-pointer"
            aria-label="Chiudi opzioni"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 space-y-2 max-h-[70dvh] overflow-y-auto">
          {/* Opzione: Segna come Ottenuto */}
          {onToggleObtained && (
            <button
              type="button"
              disabled={isUploading}
              onClick={() => {
                onToggleObtained();
                onClose();
              }}
              className="w-full p-3.5 flex items-center gap-3.5 rounded-2xl bg-gray-50 hover:bg-blue-50/70 border border-gray-100 hover:border-blue-200 transition-all cursor-pointer active:scale-[0.98] text-left group"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                  isObtained
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                }`}
              >
                {isObtained ? (
                  <PackageCheck className="w-5 h-5 text-amber-600" />
                ) : (
                  <Package className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                  {isObtained ? 'Rimuovi da ottenuti' : 'Segna come ottenuto'}
                </p>
                <p className="text-[11px] text-gray-500 font-medium">
                  {isObtained
                    ? `Ottenuto il ${formattedObtainedDate || 'recente'}`
                    : 'Film comprato, scaricato o archiviato'}
                </p>
              </div>
            </button>
          )}

          {/* Opzione: Aggiungi Rewatch (visibile se guardato) */}
          {isWatched && onRewatch && (
            <button
              type="button"
              disabled={isUploading}
              onClick={() => {
                onRewatch();
                onClose();
              }}
              className="w-full p-3.5 flex items-center gap-3.5 rounded-2xl bg-gray-50 hover:bg-blue-50/70 border border-gray-100 hover:border-blue-200 transition-all cursor-pointer active:scale-[0.98] text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 group-hover:bg-amber-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <RotateCw className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                  Aggiungi Rewatch ({watchCount || 1} visioni)
                </p>
                <p className="text-[11px] text-gray-500 font-medium">
                  Registra una nuova visione per questo film
                </p>
              </div>
            </button>
          )}

          {/* Opzione: Modalità Inserimento Storico */}
          {isUserTracked && onToggleHistoricMode && (
            <button
              type="button"
              disabled={isUploading}
              onClick={() => {
                onToggleHistoricMode();
                onClose();
              }}
              className="w-full p-3.5 flex items-center gap-3.5 rounded-2xl bg-gray-50 hover:bg-blue-50/70 border border-gray-100 hover:border-blue-200 transition-all cursor-pointer active:scale-[0.98] text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <History className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                  {isHistoricMode ? 'Disattiva Inserimento Storico' : 'Modalità Inserimento Storico'}
                </p>
                <p className="text-[11px] text-gray-500 font-medium">
                  {isHistoricMode
                    ? 'Torna alla modalità di visione quotidiana'
                    : 'Segna visti nel passato senza alterare le statistiche'}
                </p>
              </div>
            </button>
          )}

          {/* Opzione: Cambia Locandina */}
          <button
            type="button"
            disabled={isUploading}
            onClick={handleSelectSystemImage}
            className="w-full p-3.5 flex items-center gap-3.5 rounded-2xl bg-gray-50 hover:bg-blue-50/70 border border-gray-100 hover:border-blue-200 transition-all cursor-pointer active:scale-[0.98] text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {isUploading ? (
                <LoadingIcon className="w-5 h-5 animate-spin text-blue-600" />
              ) : (
                <PhotoIcon className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                {isUploading ? 'Caricamento in corso...' : 'Cambia Locandina'}
              </p>
              <p className="text-[11px] text-gray-500 font-medium">
                Scegli una foto dalle immagini di sistema
              </p>
            </div>
          </button>

          {/* Opzione: Ripristina Locandina Originale */}
          {hasCustomPoster && (
            <button
              type="button"
              disabled={isUploading}
              onClick={handleResetPoster}
              className="w-full p-3.5 flex items-center gap-3.5 rounded-2xl bg-gray-50 hover:bg-blue-50/70 border border-gray-100 hover:border-blue-200 transition-all cursor-pointer active:scale-[0.98] text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 flex items-center justify-center shrink-0 transition-colors">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                  Ripristina Locandina
                </p>
                <p className="text-[11px] text-gray-500 font-medium">
                  Ritorna alla copertina originale TMDB
                </p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileMovieOptionsModal;
