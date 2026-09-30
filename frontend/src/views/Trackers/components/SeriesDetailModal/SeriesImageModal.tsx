import React, { useRef, useState } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { PhotoIcon, LoadingIcon } from '@/components/shared/utils/Icons';
import { mediaService } from '@/api/mediaService';
import { logger } from '@/utils/logger';

interface SeriesImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
  currentUrl?: string;
}

export const SeriesImageModal: React.FC<SeriesImageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentUrl = ''
}) => {
  const [imageUrl, setImageUrl] = useState(currentUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setImageUrl(currentUrl);
    }
  }, [isOpen, currentUrl]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const res = await mediaService.uploadImage(file, 'trackers');
      setImageUrl(res.url);
    } catch (error) {
      logger.error('Errore durante il caricamento foto per la serie:', error);
      alert("Errore durante il caricamento.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        const res = await mediaService.fetchImageFromUrl(rawUrl, 'trackers');
        setImageUrl(res.url);
      } catch (error) {
        logger.warn('Download immagine da URL fallito, mantengo URL originale:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = () => {
    onSave(imageUrl);
    onClose();
  };

  const ModalContent = (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[600px] shadow-2xl">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
        <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
          Cambia Locandina
        </h4>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        {/* Preview Area */}
        <div className="w-full flex justify-center">
          <div className="w-48 aspect-[2/3] rounded-xl overflow-hidden bg-gray-200 shadow-md relative">
            {isUploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-10">
                <LoadingIcon className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : null}
            {imageUrl ? (
              <img src={imageUrl.startsWith('http') ? imageUrl : `${import.meta.env.VITE_API_BASE_URL || ''}${imageUrl}`} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <PhotoIcon className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-xs font-medium">Nessuna immagine</span>
              </div>
            )}
          </div>
        </div>

        {/* Upload / URL Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                onBlur={handleUrlBlur}
                placeholder="Incolla URL o carica foto..."
                className="w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 pr-12 shadow-sm"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
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
                  className="p-1.5 bg-gray-100 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Carica dal dispositivo"
                >
                  <PhotoIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
        <button
          onClick={onClose}
          className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          Annulla
        </button>
        {currentUrl && (
          <button
            onClick={() => {
              onSave('');
              onClose();
            }}
            className="flex-1 py-3 px-4 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors shadow-sm"
          >
            Ripristina
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={isUploading}
          className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
        >
          Salva
        </button>
      </div>
    </div>
  );

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-md">
      {ModalContent}
    </BaseModal>
  );
};
