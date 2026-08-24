// src/components/settings/ChangePasswordModal.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import PasswordStrengthMeter from '@/components/shared/form/PasswordStrengthMeter';
import { LoadingIcon } from '@/components/shared/utils/Icons';

const EyeOpenIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (currentPassword: string, newPassword: string, confirmNewPassword: string) => Promise<void>;
  loading?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLocalError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setLocalError('Compila tutti i campi richiesti.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Le nuove password non coincidono.');
      return;
    }

    if (newPassword.length < 6) {
      setLocalError('La nuova password deve contenere almeno 6 caratteri.');
      return;
    }

    if (newPassword === currentPassword) {
      setLocalError('La nuova password deve essere diversa da quella attuale.');
      return;
    }

    try {
      await onSubmit(currentPassword, newPassword, confirmPassword);
      handleClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Errore durante il cambio password.';
      setLocalError(message);
    }
  };

  const passwordsMatch = newPassword && confirmPassword ? newPassword === confirmPassword : true;

  return createPortal(
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[99999] p-4 transition-all animate-fadeIn"
      onClick={handleClose}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Cambio Password</h3>
              <p className="text-xs text-slate-500">Imposta una nuova chiave di accesso sicura</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Chiudi finestra"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {localError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {localError}
            </div>
          )}

          {/* Password Attuale */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Password Attuale
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                placeholder="Inserisci la password attuale"
                className="w-full px-3.5 py-2 pr-10 rounded-xl border border-slate-200 text-slate-900 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOffIcon /> : <EyeOpenIcon />}
              </button>
            </div>
          </div>

          {/* Nuova Password */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Nuova Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                placeholder="Almeno 6 caratteri"
                className="w-full px-3.5 py-2 pr-10 rounded-xl border border-slate-200 text-slate-900 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex={-1}
              >
                {showNew ? <EyeOffIcon /> : <EyeOpenIcon />}
              </button>
            </div>
            <PasswordStrengthMeter password={newPassword} />
          </div>

          {/* Ripeti Nuova Password */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Ripeti Nuova Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                placeholder="Ripeti la nuova password"
                className={`w-full px-3.5 py-2 pr-10 rounded-xl border text-slate-900 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${
                  !passwordsMatch
                    ? 'border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-100'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOffIcon /> : <EyeOpenIcon />}
              </button>
            </div>
            {!passwordsMatch && (
              <p className="text-xs font-medium text-rose-600 mt-1">Le due password non coincidono.</p>
            )}
          </div>

          {/* Buttons Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition shadow-sm"
            >
              {loading && <LoadingIcon className="w-3.5 h-3.5 animate-spin" />}
              {loading ? 'Salvataggio...' : 'Conferma Cambio Password'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ChangePasswordModal;
