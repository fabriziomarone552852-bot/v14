// src/components/admin/users/useAdminUsersLogic.ts
import { useState } from 'react';
import type { SystemUserItem } from '@/api/adminApi';
import { updateSystemUser, resetSystemUserPassword, toggleSystemUserActive } from '@/api/adminApi';
import { extractErrorMessage } from '@/utils/errorUtils';

interface UseAdminUsersLogicProps {
  onRefresh: () => Promise<void>;
}

export const useAdminUsersLogic = ({ onRefresh }: UseAdminUsersLogicProps) => {
  // Modal State Edit User
  const [editingUser, setEditingUser] = useState<SystemUserItem | null>(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', is_superuser: false });

  // Modal State Reset Password
  const [resetUser, setResetUser] = useState<SystemUserItem | null>(null);
  const [newPassword, setNewPassword] = useState('Cambiami123!');

  // Feedback Messages
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const startEdit = (user: SystemUserItem) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      is_superuser: user.is_superuser,
    });
    setMessage(null);
  };

  const startResetPassword = (user: SystemUserItem) => {
    setResetUser(user);
    setNewPassword('Cambiami123!');
    setMessage(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);
    setMessage(null);
    try {
      await updateSystemUser(editingUser.id, {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
        is_superuser: editForm.is_superuser,
      });

      setMessage({ text: `Dati dell'utente "${editForm.username}" aggiornati con successo!`, type: 'success' });
      setEditingUser(null);
      await onRefresh();
    } catch (err: unknown) {
      setMessage({ text: extractErrorMessage(err, "Errore durante l'aggiornamento utente"), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser || !newPassword) return;

    setSaving(true);
    setMessage(null);
    try {
      const res = await resetSystemUserPassword(resetUser.id, newPassword);
      setMessage({ text: res.message || `Password resettata con successo per ${resetUser.username}!`, type: 'success' });
      setResetUser(null);
    } catch (err: unknown) {
      setMessage({ text: extractErrorMessage(err, 'Errore durante il reset della password'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: SystemUserItem) => {
    const isCurrentlyActive = !user.deleted_at;
    const actionLabel = isCurrentlyActive ? 'disabilitare' : 'ripristinare';
    if (!confirm(`Sei sicuro di voler ${actionLabel} l'utente "${user.username}"?`)) return;

    setMessage(null);
    try {
      await toggleSystemUserActive(user.id);
      setMessage({
        text: `Stato dell'utente "${user.username}" aggiornato (${isCurrentlyActive ? 'Disabilitato' : 'Ripristinato'})!`,
        type: 'success',
      });
      await onRefresh();
    } catch (err: unknown) {
      setMessage({ text: extractErrorMessage(err, "Errore durante l'aggiornamento stato utente"), type: 'error' });
    }
  };

  return {
    editingUser,
    setEditingUser,
    editForm,
    setEditForm,
    resetUser,
    setResetUser,
    newPassword,
    setNewPassword,
    saving,
    message,
    startEdit,
    startResetPassword,
    handleSaveUser,
    handleResetPassword,
    handleToggleActive,
  };
};
