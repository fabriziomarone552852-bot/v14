// src/mobile/components/modals/MobileCountdownDetailModal.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { startOfDay, isBefore } from 'date-fns';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import TickDisplay from '@/components/day/utils/TickDisplay';
import {
  TrashIcon,
  EditIcon,
  CloseIcon,
  UndoIcon,
} from '@/components/shared/utils/Icons';
import starsGif from '@/assets/stars.gif';

interface MobileCountdownDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  countdown: CountdownItem | null;
  onEditClick: () => void;
  onDeleteClick: (id: number) => void;
  onRenewClick: (rinnovato: CountdownItem) => void;
}

export const MobileCountdownDetailModal: React.FC<MobileCountdownDetailModalProps> = ({
  isOpen,
  onClose,
  countdown,
  onEditClick,
  onDeleteClick,
  onRenewClick,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!isOpen || !countdown) return null;

  const targetDate = new Date(countdown.targetDateStr);
  const hasExpired = targetDate.getTime() <= Date.now();
  const canRenew =
    isBefore(targetDate, new Date()) ||
    startOfDay(targetDate).getTime() === startOfDay(new Date()).getTime();

  const handleRenew = () => {
    const newDate = new Date(countdown.targetDateStr);
    newDate.setFullYear(newDate.getFullYear() + 1);

    const renewedCountdown: CountdownItem = {
      ...countdown,
      targetDateStr: newDate.toISOString(),
    };

    onRenewClick(renewedCountdown);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col h-[100dvh] w-full overflow-hidden select-none animate-fadeIn">
      {/* Dialogo di Eliminazione */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Elimina Countdown"
        message="Sei sicuro di voler eliminare questo countdown? L'azione non è reversibile."
        confirmText="Elimina"
        isDestructive={true}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          onDeleteClick(countdown.id);
          setIsDeleteDialogOpen(false);
          onClose();
        }}
      />

      {/* Sfondo Copertina a Tutto Schermo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${countdown.imageUrl})`,
          backgroundPosition: countdown.immaginePosizione || 'center',
        }}
      />

      {/* Animazione Stelle se Scaduto */}
      {hasExpired && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70 z-0 mix-blend-screen"
          style={{ backgroundImage: `url(${starsGif})` }}
        />
      )}

      {/* Overlay Gradiente Scuro a Pieno Schermo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/55 to-black/85 z-10" />

      {/* 1. HEADER MODALE (Azioni a SINISTRA, Chiusura a DESTRA) */}
      <div className="relative z-20 px-4 py-3.5 flex justify-between items-center shrink-0 pt-[max(env(safe-area-inset-top,0px),14px)] select-none">
        {/* Azioni a Sinistra: Rinnova, Modifica, Elimina */}
        <div className="flex items-center gap-2 shrink-0">
          {canRenew && (
            <button
              type="button"
              onClick={handleRenew}
              className="p-2.5 bg-black/30 hover:bg-blue-500/80 active:bg-blue-600/90 active:scale-95 backdrop-blur-md rounded-full text-white transition-all shadow-xs cursor-pointer"
              title="Rinnova per l'anno prossimo"
            >
              <UndoIcon className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onEditClick}
            className="p-2.5 bg-black/30 hover:bg-amber-500/80 active:bg-amber-600/90 active:scale-95 backdrop-blur-md rounded-full text-white transition-all shadow-xs cursor-pointer"
            title="Modifica Countdown"
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="p-2.5 bg-black/30 hover:bg-red-500/80 active:bg-red-600/90 active:scale-95 backdrop-blur-md rounded-full text-white transition-all shadow-xs cursor-pointer"
            title="Elimina Countdown"
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

      {/* 2. CORPO MODALE CENTRATO A TUTTO SCHERMO */}
      <div className="relative z-20 flex-1 min-h-0 flex flex-col items-center justify-center text-center px-6 py-4 overflow-y-auto pb-[max(env(safe-area-inset-bottom,0px),16px)]">
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider mb-2 drop-shadow-md max-w-xs sm:max-w-md line-clamp-3">
          {countdown.title}
        </h2>

        <p className="text-xs sm:text-sm font-extrabold text-gray-200 uppercase tracking-widest mb-8 drop-shadow-sm">
          {targetDate.toLocaleDateString('it-IT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>

        <div className="w-full flex justify-center scale-110 sm:scale-125">
          <TickDisplay targetDateStr={countdown.targetDateStr} />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MobileCountdownDetailModal;
