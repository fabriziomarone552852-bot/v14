// src/mobile/components/modals/shopping/MobileShoppingGroupCreateModal.tsx
import React, { useEffect, useState } from 'react';
import MobileBaseModal from '../MobileBaseModal';
import { UsersIcon, EditIcon } from '@/components/shared/utils/Icons';
import ShoppingGroupInviteListBuilder from '@/components/shared/shopping/ShoppingGroupInviteListBuilder';
import type { PendingGroupInvite } from '@/types/shopping';
import { extractErrorMessage } from '@/utils/errorUtils';

interface MobileShoppingGroupCreateModalProps {
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
  zIndexClass?: string;
}

const COMMON_EMOJIS = ['👥', '🏠', '🛒', '👨‍👩‍👧‍👦', '🍕', '🍻', '🎉', '🏖️', '💼', '⭐', '🍎', '🚗'];

export const MobileShoppingGroupCreateModal: React.FC<MobileShoppingGroupCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title,
  submitLabel,
  zIndexClass = 'z-[10010]',
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Il nome del gruppo è obbligatorio.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: cleanName,
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

  const defaultTitle = isEditing ? 'Modifica Gruppo Spesa' : 'Nuovo Gruppo Spesa';
  const defaultSubmitLabel = isEditing ? 'Salva Modifiche' : 'Crea Gruppo';

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={onClose}
      zIndexClass={zIndexClass}
      title={
        <div className="flex items-center gap-2">
          {isEditing ? (
            <EditIcon className="w-5 h-5 text-blue-600" />
          ) : (
            <UsersIcon className="w-5 h-5 text-blue-600" />
          )}
          <span>{title || defaultTitle}</span>
        </div>
      }
      formId="mobile-group-create-form"
      confirmText={submitLabel || defaultSubmitLabel}
      cancelText="Annulla"
      isLoading={isSubmitting}
      isConfirmDisabled={!name.trim() || isSubmitting}
    >
      <form id="mobile-group-create-form" onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto pb-6">
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Selettore & Personalizzazione Icona Emoji */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
            Icona Gruppo
          </label>
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Input Emoji personalizzabile libera come nella webpage */}
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={4}
              className="w-12 h-10 text-center border-2 border-blue-500 rounded-xl text-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-2xs shrink-0"
              title="Emoji personalizzabile"
            />
            
            {/* Palette rapida di suggerimenti */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-9 h-9 text-base rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    icon === emoji
                      ? 'bg-blue-600 text-white scale-110 shadow-xs ring-2 ring-blue-400 ring-offset-1'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Nome Gruppo */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
            Nome Gruppo
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es. Famiglia, Casa Vacanze, Ufficio..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Descrizione Gruppo */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
            Descrizione
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Aggiungi una descrizione per il gruppo..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
          />
        </div>

        {/* Aggiunta Collaboratori (solo in creazione) */}
        {!isEditing && (
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
              Aggiungi Collaboratori
            </label>
            <ShoppingGroupInviteListBuilder
              invites={pendingInvites}
              onChange={setPendingInvites}
            />
          </div>
        )}

      </form>
    </MobileBaseModal>
  );
};

export default MobileShoppingGroupCreateModal;
