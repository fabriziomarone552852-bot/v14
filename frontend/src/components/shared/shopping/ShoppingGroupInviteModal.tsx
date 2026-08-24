// src/components/shared/shopping/ShoppingGroupInviteModal.tsx
import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { MailIcon } from '@/components/shared/utils/Icons';
import ShoppingGroupInviteListBuilder from './ShoppingGroupInviteListBuilder';
import type { PendingGroupInvite } from '@/types/shopping';
import { extractErrorMessage } from '@/utils/errorUtils';

interface ShoppingGroupInviteModalProps {
  isOpen: boolean;
  groupName: string;
  onClose: () => void;
  onSubmit: (invites: PendingGroupInvite[]) => Promise<void>;
  currentUserRole?: string;
}

const ShoppingGroupInviteModal: React.FC<ShoppingGroupInviteModalProps> = ({
  isOpen,
  groupName,
  onClose,
  onSubmit,
  currentUserRole = 'owner',
}) => {
  const [pendingInvites, setPendingInvites] = useState<PendingGroupInvite[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPendingInvites([]);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (pendingInvites.length === 0) {
      setError("Inserisci almeno un utente o un'email e clicca 'Aggiungi'.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(pendingInvites);
      setPendingInvites([]);
      onClose();
    } catch (err: unknown) {
      setError(extractErrorMessage(err, "Errore durante l'aggiunta dei collaboratori."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-base font-bold text-gray-800">
          <MailIcon className="w-5 h-5 text-blue-600" />
          <span>Aggiungi a {groupName}</span>
        </span>
      }
      formId="group-invite-form"
      confirmText={isSubmitting ? 'Salvataggio...' : 'Aggiungi Membri'}
      cancelText="Annulla"
      isConfirmDisabled={isSubmitting || pendingInvites.length === 0}
      maxWidthClass="max-w-md"
      overflowVisible={true}
    >
      <form id="group-invite-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-500 uppercase">
            Aggiungi Membri al Gruppo
          </label>
          <p className="text-xs text-gray-500">
            Inserisci username o email, seleziona il ruolo e premi <span className="font-semibold text-gray-700">Aggiungi</span>.
          </p>

          <ShoppingGroupInviteListBuilder
            invites={pendingInvites}
            onChange={setPendingInvites}
            currentUserRole={currentUserRole}
            onError={setError}
            inputPlaceholder="User o email..."
          />
        </div>
      </form>
    </BaseModal>
  );
};

export default ShoppingGroupInviteModal;
