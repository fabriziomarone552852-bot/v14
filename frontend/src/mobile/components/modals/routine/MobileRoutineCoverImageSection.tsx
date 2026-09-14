// src/mobile/components/modals/routine/MobileRoutineCoverImageSection.tsx
import React, { useRef, useState } from 'react';
import { TargetIcon, PhotoIcon, LoadingIcon } from '@/components/shared/utils/Icons';
import { mediaService } from '@/api/mediaService';
import { logger } from '@/utils/logger';

interface MobileRoutineCoverImageSectionProps {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  onOpenPositionModal: () => void;
}

export const MobileRoutineCoverImageSection: React.FC<MobileRoutineCoverImageSectionProps> = ({
  imageUrl,
  onImageUrlChange,
  onOpenPositionModal,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await mediaService.uploadImage(file, 'habits');
      onImageUrlChange(res.url);
    } catch (error) {
      logger.error('Errore durante il caricamento foto da mobile:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlBlur = async () => {
    const rawUrl = imageUrl?.trim();
    if (!rawUrl || rawUrl.startsWith('/uploads/') || rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
      return;
    }

    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      try {
        setIsUploading(true);
        const res = await mediaService.fetchImageFromUrl(rawUrl, 'habits');
        onImageUrlChange(res.url);
      } catch (error) {
        logger.warn('Download immagine da URL fallito:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Immagine di Sfondo
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="hover:bg-blue-100 text-blue-600 bg-blue-50/80 border border-blue-200 p-1 rounded-lg transition-colors cursor-pointer flex items-center justify-center shadow-2xs disabled:opacity-50"
            title="Carica foto dal dispositivo"
          >
            {isUploading ? (
              <LoadingIcon className="animate-spin h-3.5 w-3.5 text-blue-600" />
            ) : (
              <PhotoIcon className="h-3.5 w-3.5" />
            )}
          </button>
          {imageUrl && (
            <button
              type="button"
              onClick={onOpenPositionModal}
              className="hover:bg-blue-100 text-blue-600 bg-blue-50/80 border border-blue-200 px-2 py-0.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold shadow-2xs"
              title="Regola inquadratura"
            >
              <TargetIcon className="h-3.5 w-3.5" />
              <span>Inquadra</span>
            </button>
          )}
        </div>
      </div>
      <input
        type="text"
        value={imageUrl}
        onChange={(e) => onImageUrlChange(e.target.value)}
        onBlur={handleUrlBlur}
        placeholder="Incolla URL o carica foto..."
        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
      />
    </div>
  );
};

export default MobileRoutineCoverImageSection;
