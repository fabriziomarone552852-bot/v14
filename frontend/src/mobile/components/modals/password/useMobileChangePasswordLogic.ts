// src/mobile/components/modals/password/useMobileChangePasswordLogic.ts
import { useState, useCallback } from 'react';

export interface UseMobileChangePasswordLogicProps {
  onSubmit: (currentPassword: string, newPassword: string, confirmNewPassword: string) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export function useMobileChangePasswordLogic({
  onSubmit,
  onClose,
  loading = false,
}: UseMobileChangePasswordLogicProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [localError, setLocalError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLocalError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
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
    },
    [currentPassword, newPassword, confirmPassword, onSubmit, handleClose]
  );

  const passwordsMatch = newPassword && confirmPassword ? newPassword === confirmPassword : true;
  const isSubmitDisabled =
    loading || !currentPassword || !newPassword || !confirmPassword || !passwordsMatch;

  return {
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
    resetForm,
    handleClose,
    handleSubmit,
    passwordsMatch,
    isSubmitDisabled,
  };
}
