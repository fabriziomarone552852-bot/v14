// src/mobile/components/modals/MobileChangePasswordModal.tsx
import React, { useState } from 'react';
import MobileBaseModal from '@/mobile/components/modals/MobileBaseModal';
import PasswordStrengthMeter from '@/components/shared/form/PasswordStrengthMeter';
import { Key, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface MobileChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (currentPassword: string, newPassword: string, confirmNewPassword: string) => Promise<void>;
  loading?: boolean;
}

export const MobileChangePasswordModal: React.FC<MobileChangePasswordModalProps> = ({
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cambio Password"
      confirmText={loading ? 'Salvataggio...' : 'Conferma Cambio Password'}
      cancelText="Annulla"
      onConfirm={handleSubmit}
      onCancel={handleClose}
      isConfirmDisabled={loading || !currentPassword || !newPassword || !confirmPassword || !passwordsMatch}
      isLoading={loading}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-4">
        {/* Banner informativo */}
        <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Aggiorna Credenziali</h4>
            <p className="text-[11px] text-blue-700 mt-0.5">
              Imposta una nuova password sicura per il tuo account.
            </p>
          </div>
        </div>

        {localError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{localError}</span>
          </div>
        )}

        {/* Password Attuale */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Password Attuale
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (localError) setLocalError(null);
              }}
              disabled={loading}
              autoComplete="current-password"
              placeholder="Inserisci la password attuale"
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 text-gray-900 text-sm shadow-xs transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
              tabIndex={-1}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Nuova Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Nuova Password
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (localError) setLocalError(null);
              }}
              disabled={loading}
              autoComplete="new-password"
              placeholder="Almeno 6 caratteri"
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 text-gray-900 text-sm shadow-xs transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
              tabIndex={-1}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrengthMeter password={newPassword} />
        </div>

        {/* Ripeti Nuova Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
            Ripeti Nuova Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (localError) setLocalError(null);
              }}
              disabled={loading}
              autoComplete="new-password"
              placeholder="Ripeti la nuova password"
              className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-gray-900 text-sm shadow-xs transition focus:outline-none focus:ring-2 bg-white ${
                !passwordsMatch
                  ? 'border-rose-300 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-100'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {!passwordsMatch && (
            <p className="text-xs font-semibold text-rose-600 mt-1">Le due password non coincidono.</p>
          )}
        </div>
      </form>
    </MobileBaseModal>
  );
};

export default MobileChangePasswordModal;
