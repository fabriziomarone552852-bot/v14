// src/components/shared/feedback/FeedbackScreenshotField.tsx
import React from 'react';
import { UploadCloud, Trash2 } from 'lucide-react';
import { resolveImageUrl } from '@/utils/imageUtils';

export interface FeedbackScreenshotFieldProps {
  screenshotUrl: string | null;
  onRemoveScreenshot: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export const FeedbackScreenshotField: React.FC<FeedbackScreenshotFieldProps> = ({
  screenshotUrl,
  onRemoveScreenshot,
  fileInputRef,
  onFileChange,
  isUploading,
}) => {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-1">
        Screenshot o Foto
      </label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/*"
        className="hidden"
      />

      {screenshotUrl ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-2 sm:p-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={resolveImageUrl(screenshotUrl)}
              alt="Screenshot"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-gray-200 shrink-0"
            />
            <div className="truncate">
              <div className="text-xs font-bold text-gray-800">Screenshot allegato</div>
              <div className="text-[10px] text-gray-400 truncate">{screenshotUrl}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemoveScreenshot}
            className="p-1.5 sm:p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Rimuovi"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50 hover:bg-blue-50/30 rounded-xl p-2.5 sm:p-3.5 flex flex-col items-center justify-center gap-1 transition-all text-gray-600 cursor-pointer disabled:opacity-50"
        >
          <UploadCloud className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          <span className="text-xs font-bold">
            {isUploading ? 'Caricamento immagine...' : 'Allega uno screenshot o immagine'}
          </span>
        </button>
      )}
    </div>
  );
};

export default FeedbackScreenshotField;
