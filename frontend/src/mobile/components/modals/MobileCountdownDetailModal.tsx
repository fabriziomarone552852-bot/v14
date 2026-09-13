// src/mobile/components/modals/MobileCountdownDetailModal.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { startOfDay, isBefore } from 'date-fns';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import TickDisplay from '@/components/day/utils/TickDisplay';
import starsGif from '@/assets/stars.gif';
import { MobileCountdownDetailHeader } from './countdown/MobileCountdownDetailHeader';

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

      {/* 1. Header Modale con Azioni Rapide */}
      <MobileCountdownDetailHeader
        canRenew={canRenew}
        onRenew={handleRenew}
        onEdit={onEditClick}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onClose={onClose}
      />

      {/* 2. Corpo Modale Centrato a Tutto Schermo */}
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
