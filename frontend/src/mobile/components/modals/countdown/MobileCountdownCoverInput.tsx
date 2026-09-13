// src/mobile/components/modals/countdown/MobileCountdownCoverInput.tsx
import React from 'react';
import { TargetIcon } from '@/components/shared/utils/Icons';

interface MobileCountdownCoverInputProps {
  imageUrl: string;
  onChangeImageUrl: (url: string) => void;
  onOpenPositionModal: () => void;
}

export const MobileCountdownCoverInput: React.FC<MobileCountdownCoverInputProps> = ({
  imageUrl,
  onChangeImageUrl,
  onOpenPositionModal,
}) => {
  return (
    <div className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 shadow-2xs">
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Sfondo Personalizzato (URL)
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
        onChange={(e) => onChangeImageUrl(e.target.value)}
        placeholder="Incolla l'URL dell'immagine..."
        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
      />
      <p className="text-[11px] text-gray-400 font-medium mt-1">
        Se vuoto, verrà utilizzata l'illustrazione di sfondo predefinita.
      </p>
    </div>
  );
};

export default MobileCountdownCoverInput;
