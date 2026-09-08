// src/mobile/components/modals/shopping/MobileShoppingGroupInviteModal.tsx
import React, { useState, useEffect } from 'react';
import MobileBaseModal from '../MobileBaseModal';
import { UsersIcon } from '@/components/shared/utils/Icons';
import ShoppingGroupInviteListBuilder from '@/components/shared/shopping/ShoppingGroupInviteListBuilder';
import type { PendingGroupInvite } from '@/types/shopping';
import { extractErrorMessage } from '@/utils/errorUtils';

interface MobileShoppingGroupInviteModalProps {
  isOpen: boolean;
  groupName: string;
  onClose: () => void;
  onSubmit: (invites: PendingGroupInvite[]) => Promise<void>;
  currentUserRole?: string;
  zIndexClass?: string;
}

export const MobileShoppingGroupInviteModal: React.FC<MobileShoppingGroupInviteModalProps> = ({
  isOpen,
  groupName,
  onClose,
  onSubmit,
  zIndexClass = 'z-[10010]',
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
    <MobileBaseModal
      isOpen={isOpen}
      onClose={onClose}
      zIndexClass={zIndexClass}
      title={
        <div className="flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="truncate">
            <span className="text-sm font-extrabold text-gray-900 block">Aggiungi Collaboratori</span>
            <span className="text-xs font-normal text-gray-500 truncate block">
              {groupName}
            </span>
          </div>
        </div>
      }
      formId="mobile-group-invite-form"
      confirmText="Aggiungi Membri"
      cancelText="Annulla"
      isLoading={isSubmitting}
      isConfirmDisabled={pendingInvites.length === 0 || isSubmitting}
    >
      <form id="mobile-group-invite-form" onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto pb-6">
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-2">
          <p className="text-xs text-gray-500 mb-2">
            Aggiungi username o indirizzi email per consentire ad altri utenti di accedere e collaborare su questo gruppo.
          </p>

          <ShoppingGroupInviteListBuilder
            invites={pendingInvites}
            onChange={setPendingInvites}
          />
        </div>

      </form>
    </MobileBaseModal>
  );
};

export default MobileShoppingGroupInviteModal;
