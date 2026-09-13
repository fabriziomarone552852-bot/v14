// src/mobile/components/modals/routine/MobileRoutineCoverImageSection.tsx
import React from 'react';
import { TargetIcon } from '@/components/shared/utils/Icons';

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
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Immagine di Sfondo (URL)
        </label>
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
      <input
        type="url"
        value={imageUrl}
        onChange={(e) => onImageUrlChange(e.target.value)}
        placeholder="Incolla l'URL dell'immagine..."
        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
      />
      <p className="text-[11px] text-gray-400 font-medium mt-1">
        Usata come sfondo visivo per la card della routine.
      </p>
    </div>
  );
};

export default MobileRoutineCoverImageSection;
