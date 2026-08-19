// src/components/shared/shopping/ShoppingGroupCreateModal.tsx
import React, { useEffect, useState } from 'react';
import {
  shoppingButtonPrimaryClass,
  shoppingButtonSecondaryClass,
  shoppingInputClass,
} from './shoppingUi';
import { extractErrorMessage } from '@/utils/errorUtils';

interface ShoppingGroupCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string }) => Promise<void>;
  initialData?: { name: string; description?: string | null } | null;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);
  const modalTitle = title || (isEditing ? '✏️ Modifica Gruppo Spesa' : '👥 Nuovo Gruppo Spesa');
  const btnLabel = submitLabel || (isEditing ? 'Salva Modifiche' : 'Crea Gruppo');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Inserisci il nome del gruppo spesa.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined });
      setName('');
      setDescription('');
      onClose();
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Errore durante il salvataggio del gruppo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-gray-800">{modalTitle}</h3>
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
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Nome Gruppo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="es. Famiglia Rossi, Casa Universitari"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={shoppingInputClass}
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">
              Descrizione (opzionale)
            </label>
            <textarea
              rows={3}
              placeholder="Note o dettagli sul gruppo spesa"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={shoppingInputClass}
            />
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
              {isSubmitting ? 'Salvataggio...' : btnLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShoppingGroupCreateModal;
