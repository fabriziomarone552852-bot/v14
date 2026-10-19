import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw } from 'lucide-react';
import { mediaService } from '@/api/mediaService';
import { logger } from '@/utils/logger';
import { PhotoIcon, LoadingIcon, CloseIcon, TrashIcon } from '@/components/shared/utils/Icons';
import { useBackHandler } from '@/utils/backButtonManager';

export interface MobileSeriesOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasCustomPoster: boolean;
  onPosterUpdated: (newUrl: string | null) => void;
  isUserTracked: boolean;
  isRewatching?: boolean;
  onStopRewatch?: () => void;
}

export const MobileSeriesOptionsModal: React.FC<MobileSeriesOptionsModalProps> = ({
  isOpen,
  onClose,
  hasCustomPoster,
  onPosterUpdated,
  isUserTracked,
  isRewatching = false,
  onStopRewatch,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useBackHandler(isOpen, onClose, 25);

  if (!isOpen) return null;

  const handleSelectSystemImage = () => {
    if (!isUserTracked) {
      alert('Aggiungi prima la serie alla tua libreria per personalizzare la locandina.');
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
      onClose();
    } catch (error) {
      logger.error('Errore durante il caricamento della locandina:', error);
      alert('Errore durante il caricamento della foto. Riprova.');
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
        aria-labelledby="series-options-title"
        className="relative w-full max-w-xs bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-scaleUp z-10"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <h3 id="series-options-title" className="font-extrabold text-gray-900 text-sm tracking-wide">
            Opzioni Serie
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

        <div className="p-3 space-y-2">
          {/* Opzione: Interrompi Rewatch (visibile solo se isRewatching è attivo) */}
          {isRewatching && onStopRewatch && (
            <button
              type="button"
              disabled={isUploading}
              onClick={() => {
                onStopRewatch();
                onClose();
              }}
              className="w-full p-3.5 flex items-center gap-3.5 rounded-2xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 transition-all cursor-pointer active:scale-[0.98] text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <RotateCcw className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-amber-900 text-sm group-hover:text-amber-800 transition-colors">
                  Interrompi Rewatch
                </p>
                <p className="text-[11px] text-amber-700/80 font-medium">
                  Rimuove la serie da &quot;I prossimi da guardare&quot;
                </p>
              </div>
            </button>
          )}

          {/* Opzione: Cambia Locandina (apre il selettore immagini nativo di sistema) */}
          <button
            type="button"
            disabled={isUploading}
            onClick={handleSelectSystemImage}
            className="w-full p-3.5 flex items-center gap-3.5 rounded-2xl bg-gray-50 hover:bg-blue-50/70 border border-gray-100 hover:border-blue-200 transition-all cursor-pointer active:scale-[0.98] text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
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
              className="w-full p-3.5 flex items-center gap-3.5 rounded-2xl bg-red-50/60 hover:bg-red-50 border border-red-100 transition-all cursor-pointer active:scale-[0.98] text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <TrashIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-red-700 text-sm">
                  Ripristina Locandina
                </p>
                <p className="text-[11px] text-red-500 font-medium">
                  Ritorna alla copertina originale TMDB
                </p>
              </div>
            </button>
          )}
        </div>

        <div className="p-3 border-t border-gray-100 bg-gray-50/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="w-full py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-100 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileSeriesOptionsModal;
