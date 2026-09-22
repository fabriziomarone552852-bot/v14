import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useConfirm } from '@/context/ConfirmContext';

interface EditEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onSave: (newEmail: string) => void;
}

const EditEmailModal: React.FC<EditEmailModalProps> = ({
  isOpen,
  onClose,
  currentEmail,
  onSave,
}) => {
  const [newEmail, setNewEmail] = useState('');
  const { confirm } = useConfirm();

  useEffect(() => {
    if (isOpen) {
      setNewEmail(currentEmail);
    }
  }, [isOpen, currentEmail]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || newEmail === currentEmail) {
      onClose();
      return;
    }

    confirm({
      title: 'Conferma Email',
      message: `Sei sicuro che ${newEmail} sia la mail corretta?`,
      confirmText: 'Sì, conferma',
      cancelText: 'Annulla',
      onConfirm: () => {
        onSave(newEmail.trim());
        onClose();
      }
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[99999] p-4 transition-all animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-slate-100 relative pointer-events-auto animate-scaleUp z-[100000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Cambio Email</h3>
              <p className="text-xs text-slate-500">Aggiorna il tuo indirizzo di posta</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Chiudi finestra"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Nuovo Indirizzo Email
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              autoComplete="email"
              placeholder="Inserisci la nuova email"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Buttons Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={!newEmail.trim() || newEmail === currentEmail}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition shadow-sm cursor-pointer"
            >
              Conferma Email
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditEmailModal;
