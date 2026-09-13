// src/mobile/components/modals/countdown/MobileCountdownDetailHeader.tsx
import React from 'react';
import {
  TrashIcon,
  EditIcon,
  CloseIcon,
  UndoIcon,
} from '@/components/shared/utils/Icons';

interface MobileCountdownDetailHeaderProps {
  canRenew: boolean;
  onRenew: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const MobileCountdownDetailHeader: React.FC<MobileCountdownDetailHeaderProps> = ({
  canRenew,
  onRenew,
  onEdit,
  onDelete,
  onClose,
}) => {
  return (
    <div className="relative z-20 px-4 py-3.5 flex justify-between items-center shrink-0 pt-[max(env(safe-area-inset-top,0px),14px)] select-none">
      {/* Azioni a Sinistra: Rinnova, Modifica, Elimina */}
      <div className="flex items-center gap-2 shrink-0">
        {canRenew && (
          <button
            type="button"
            onClick={onRenew}
            className="p-2.5 bg-black/30 hover:bg-blue-500/80 active:bg-blue-600/90 active:scale-95 backdrop-blur-md rounded-full text-white transition-all shadow-xs cursor-pointer"
            title="Rinnova per l'anno prossimo"
            aria-label="Rinnova countdown"
          >
            <UndoIcon className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="p-2.5 bg-black/30 hover:bg-amber-500/80 active:bg-amber-600/90 active:scale-95 backdrop-blur-md rounded-full text-white transition-all shadow-xs cursor-pointer"
          title="Modifica Countdown"
          aria-label="Modifica countdown"
        >
          <EditIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2.5 bg-black/30 hover:bg-red-500/80 active:bg-red-600/90 active:scale-95 backdrop-blur-md rounded-full text-white transition-all shadow-xs cursor-pointer"
          title="Elimina Countdown"
          aria-label="Elimina countdown"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Chiusura a Destra */}
      <button
        type="button"
        onClick={onClose}
        className="p-2.5 bg-black/30 hover:bg-black/50 active:bg-black/70 active:scale-95 backdrop-blur-md rounded-full text-white transition-all shadow-xs cursor-pointer"
        aria-label="Chiudi"
      >
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MobileCountdownDetailHeader;
