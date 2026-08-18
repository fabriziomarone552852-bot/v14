// src/components/shared/shopping/ShoppingGroupInviteModal.tsx
import React, { useState } from 'react';
import {
  shoppingButtonPrimaryClass,
  shoppingButtonSecondaryClass,
  shoppingInputClass,
  shoppingSelectClass,
} from './shoppingUi';
import type { ShoppingGroupMemberInvitePayload } from '@/types/shopping';

interface ShoppingGroupInviteModalProps {
  isOpen: boolean;
  groupName: string;
  onClose: () => void;
  onSubmit: (payload: ShoppingGroupMemberInvitePayload) => Promise<void>;
  currentUserRole?: string; // 'owner' | 'admin' | 'editor' | 'reader'
}

const ShoppingGroupInviteModal: React.FC<ShoppingGroupInviteModalProps> = ({
  isOpen,
  groupName,
  onClose,
  onSubmit,
  currentUserRole = 'owner',
}) => {
  const [inviteType, setInviteType] = useState<'username' | 'email'>('username');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [roleCode, setRoleCode] = useState<string>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isOwner = currentUserRole === 'owner';
  const effectiveRoleCode = !isOwner && roleCode === 'admin' ? 'editor' : roleCode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (inviteType === 'username' && !cleanUsername) {
      setError("Inserisci il nome utente dell'utente da invitare.");
      return;
    }
    if (inviteType === 'email' && !cleanEmail) {
      setError("Inserisci l'indirizzo email dell'utente da invitare.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        username: inviteType === 'username' ? cleanUsername : undefined,
        email: inviteType === 'email' ? cleanEmail : undefined,
        roleCode: effectiveRoleCode,
      });
      setUsername('');
      setEmail('');
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Errore durante l'invio dell'invito.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800">✉️ Invita Collaboratore</h3>
            <p className="text-xs text-gray-500">Gruppo: <span className="font-semibold text-blue-600">{groupName}</span></p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Metodo di Invito</label>
            <div className="flex gap-2 rounded-xl bg-gray-100 p-1 text-xs">
              <button
                type="button"
                className={`flex-1 rounded-lg py-1.5 font-medium transition ${
                  inviteType === 'username' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
                onClick={() => setInviteType('username')}
              >
                Username
              </button>
              <button
                type="button"
                className={`flex-1 rounded-lg py-1.5 font-medium transition ${
                  inviteType === 'email' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
                onClick={() => setInviteType('email')}
              >
                Email
              </button>
            </div>
          </div>

          {inviteType === 'username' ? (
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Username Utente Registrato <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="es. mariorossi"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={shoppingInputClass}
                autoFocus
              />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700">
                Email Utente Registrato <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="es. mario.rossi@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={shoppingInputClass}
                autoFocus
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Ruolo da Assegnare <span className="text-red-500">*</span>
            </label>
            <select
              value={effectiveRoleCode}
              onChange={(e) => setRoleCode(e.target.value)}
              className={shoppingSelectClass}
            >
              {isOwner && <option value="admin">Amministratore (Admin)</option>}
              <option value="editor">Editor (Può aggiungere e registrare acquisti)</option>
              <option value="reader">Lettore (Sola consultazione read-only)</option>
            </select>
            {!isOwner && (
              <p className="mt-1 text-[11px] text-amber-600 font-medium">
                * Gli amministratori possono invitare utenti solo con ruolo Editor o Lettore.
              </p>
            )}
          </div>

          <div className="rounded-xl bg-blue-50/60 p-3 text-[11px] text-blue-800">
            {roleCode === 'admin' && '🛡️ Admin: Può consultare, registrare acquisti ed invitare editor/lettori.'}
            {roleCode === 'editor' && '✏️ Editor: Può visualizzare la lista, aggiungere prodotti e registrare gli acquisti.'}
            {roleCode === 'reader' && '👁️ Lettore: Può solo consultare la lista spesa in modalità di sola lettura.'}
          </div>

          <div className="mt-6 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={shoppingButtonSecondaryClass}
              disabled={isSubmitting}
            >
              Annulla
            </button>
            <button
              type="submit"
              className={shoppingButtonPrimaryClass}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Invio in corso...' : 'Invia Invito'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShoppingGroupInviteModal;
