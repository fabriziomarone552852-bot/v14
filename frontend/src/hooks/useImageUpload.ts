// src/hooks/useImageUpload.ts
import { useState, useRef, useCallback } from 'react';
import { mediaService } from '@/api/mediaService';
import { logger } from '@/utils/logger';

export interface UseImageUploadOptions {
  /** Cartella di destinazione sul server (es. 'habits', 'countdowns', 'profiles', 'trackers') */
  folder?: string;
  /** Callback chiamata con l'URL dell'immagine caricata con successo */
  onSuccess?: (url: string) => void;
  /** Callback opzionale in caso di errore */
  onError?: (error: unknown) => void;
}

export interface UseImageUploadReturn {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  uploadError: string | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string | null>;
  handleUrlFetch: (rawUrl: string) => Promise<string | null>;
  triggerFileInput: () => void;
  clearError: () => void;
}

/**
 * Hook riutilizzabile per la gestione del caricamento immagini (DRY e Peso Piuma).
 * Centralizza l'apertura del file picker, il caricamento su /media/upload in WebP
 * e il recupero opzionale da URL esterno, restituendo sempre e solo l'URL testuale.
 */
export const useImageUpload = ({
  folder = 'general',
  onSuccess,
  onError,
}: UseImageUploadOptions = {}): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>): Promise<string | null> => {
      const file = e.target.files?.[0];
      if (!file) return null;

      try {
        setIsUploading(true);
        setUploadError(null);
        const res = await mediaService.uploadImage(file, folder);
        onSuccess?.(res.url);
        return res.url;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Errore durante il caricamento della foto';
        logger.error('Errore durante il caricamento della foto:', error);
        setUploadError(errorMsg);
        onError?.(error);
        return null;
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [folder, onSuccess, onError]
  );

  const handleUrlFetch = useCallback(
    async (rawUrl: string): Promise<string | null> => {
      const trimmed = rawUrl.trim();
      if (
        !trimmed ||
        trimmed.startsWith('/uploads/') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('blob:')
      ) {
        return null;
      }

      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        try {
          setIsUploading(true);
          setUploadError(null);
          const res = await mediaService.fetchImageFromUrl(trimmed, folder);
          onSuccess?.(res.url);
          return res.url;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Download immagine da URL fallito';
          logger.warn('Download immagine da URL fallito, mantengo URL originale:', error);
          setUploadError(errorMsg);
          onError?.(error);
          return null;
        } finally {
          setIsUploading(false);
        }
      }

      return null;
    },
    [folder, onSuccess, onError]
  );

  return {
    fileInputRef,
    isUploading,
    uploadError,
    handleFileUpload,
    handleUrlFetch,
    triggerFileInput,
    clearError,
  };
};
