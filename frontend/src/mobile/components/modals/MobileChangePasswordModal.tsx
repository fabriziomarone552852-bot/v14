// src/mobile/components/modals/MobileChangePasswordModal.tsx
import React from 'react';
import MobileBaseModal from '@/mobile/components/modals/MobileBaseModal';
import PasswordStrengthMeter from '@/components/shared/form/PasswordStrengthMeter';
import { Key, AlertCircle } from 'lucide-react';
import {
  MobilePasswordFieldItem,
  useMobileChangePasswordLogic,
} from './password';

export interface MobileChangePasswordModalProps {
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
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showCurrent,
    setShowCurrent,
    showNew,
    setShowNew,
    showConfirm,
    setShowConfirm,
    localError,
    setLocalError,
    handleClose,
    handleSubmit,
    passwordsMatch,
    isSubmitDisabled,
  } = useMobileChangePasswordLogic({ onSubmit, onClose, loading });

  if (!isOpen) return null;

  return (
    <MobileBaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cambio Password"
      confirmText={loading ? 'Salvataggio...' : 'Conferma Cambio Password'}
      cancelText="Annulla"
      onConfirm={handleSubmit}
      onCancel={handleClose}
      isConfirmDisabled={isSubmitDisabled}
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
        <MobilePasswordFieldItem
          label="Password Attuale"
          value={currentPassword}
          onChange={(val) => {
            setCurrentPassword(val);
            if (localError) setLocalError(null);
          }}
          showPassword={showCurrent}
          onToggleShow={() => setShowCurrent(!showCurrent)}
          placeholder="Inserisci la password attuale"
          autoComplete="current-password"
          disabled={loading}
        />

        {/* Nuova Password */}
        <MobilePasswordFieldItem
          label="Nuova Password"
          value={newPassword}
          onChange={(val) => {
            setNewPassword(val);
            if (localError) setLocalError(null);
          }}
          showPassword={showNew}
          onToggleShow={() => setShowNew(!showNew)}
          placeholder="Almeno 6 caratteri"
          autoComplete="new-password"
          disabled={loading}
        >
          <PasswordStrengthMeter password={newPassword} />
        </MobilePasswordFieldItem>

        {/* Ripeti Nuova Password */}
        <MobilePasswordFieldItem
          label="Ripeti Nuova Password"
          value={confirmPassword}
          onChange={(val) => {
            setConfirmPassword(val);
            if (localError) setLocalError(null);
          }}
          showPassword={showConfirm}
          onToggleShow={() => setShowConfirm(!showConfirm)}
          placeholder="Ripeti la nuova password"
          autoComplete="new-password"
          disabled={loading}
          isError={!passwordsMatch}
        >
          {!passwordsMatch && (
            <p className="text-xs font-semibold text-rose-600 mt-1">Le due password non coincidono.</p>
          )}
        </MobilePasswordFieldItem>
      </form>
    </MobileBaseModal>
  );
};

export default MobileChangePasswordModal;
