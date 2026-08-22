import React, { useEffect, useState } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { UsersIcon, EditIcon } from '@/components/shared/utils/Icons';
import ShoppingGroupInviteListBuilder from './ShoppingGroupInviteListBuilder';
import type { PendingGroupInvite } from '@/types/shopping';
import { extractErrorMessage } from '@/utils/errorUtils';

export type { PendingGroupInvite };


interface ShoppingGroupCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    icon?: string;
    invites?: PendingGroupInvite[];
  }) => Promise<void>;
  initialData?: { name: string; description?: string | null; icon?: string | null } | null;
  title?: string;
  submitLabel?: string;
}

const ShoppingGroupCreateModal: React.FC<ShoppingGroupCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title,
  submitLabel,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('👥');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingGroupInvite[]>([]);

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setIcon(initialData?.icon?.trim() || '👥');
      setPendingInvites([]);
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const modalTitle = title || (isEditing ? 'Modifica Gruppo Spesa' : 'Nuovo Gruppo Spesa');
  const btnLabel = submitLabel || (isEditing ? 'Salva Modifiche' : 'Crea Gruppo');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setError('Inserisci il nome del gruppo spesa.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        icon: icon.trim() || '👥',
        invites: !isEditing && pendingInvites.length > 0 ? pendingInvites : undefined,
      });
      setName('');
      setDescription('');
      setIcon('👥');
      setPendingInvites([]);
      onClose();
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Errore durante il salvataggio del gruppo.'));
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
          {isEditing ? (
            <EditIcon className="w-5 h-5 text-blue-600" />
          ) : (
            <UsersIcon className="w-5 h-5 text-blue-600" />
          )}
          <span>{modalTitle}</span>
        </span>
      }
      formId="shopping-group-form"
      confirmText={isSubmitting ? 'Salvataggio...' : btnLabel}
      cancelText="Annulla"
      isConfirmDisabled={isSubmitting}
      maxWidthClass="max-w-md"
      overflowVisible={true}
    >
      <form id="shopping-group-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Nome Gruppo
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-12 text-center py-2 border border-gray-200 rounded-xl text-lg focus:outline-none focus:border-blue-500 transition-colors"
              title="Emoji del gruppo"
              maxLength={4}
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Famiglia Rossi, Coinquilini, Vacanze"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
              required
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Descrizione
          </label>
          <textarea
            rows={2}
            placeholder="es. Spese condivise per la casa"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        {!isEditing && (
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Invita Collaboratori
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Aggiungi persone che possono visualizzare o modificare le liste di questo gruppo.
            </p>

            <ShoppingGroupInviteListBuilder
              invites={pendingInvites}
              onChange={setPendingInvites}
              onError={setError}
              inputPlaceholder="User o email..."
            />
          </div>
        )}
      </form>
    </BaseModal>
  );
};

export default ShoppingGroupCreateModal;
