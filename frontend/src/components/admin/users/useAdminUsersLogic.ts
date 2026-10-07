// src/components/admin/users/useAdminUsersLogic.ts
import { useState } from 'react';
import type { SystemUserItem } from '@/api/adminApi';
import {
  updateSystemUser,
  resetSystemUserPassword,
  toggleSystemUserActive,
  purgeDeletedUserAdmin,
} from '@/api/adminApi';
import { extractErrorMessage } from '@/utils/errorUtils';

interface UseAdminUsersLogicProps {
  onRefresh: () => Promise<void>;
}

export const useAdminUsersLogic = ({ onRefresh }: UseAdminUsersLogicProps) => {
  // Modal State Edit User
  const [editingUser, setEditingUser] = useState<SystemUserItem | null>(null);
  const [editForm, setEditForm] = useState<{
    username: string;
    email: string;
    is_superuser: boolean;
    max_subtask_depth_user: number | '';
    must_change_password: boolean;
  }>({
    username: '',
    email: '',
    is_superuser: false,
    max_subtask_depth_user: 3,
    must_change_password: false,
  });

  // Modal State Reset Password
  const [resetUser, setResetUser] = useState<SystemUserItem | null>(null);
  const [newPassword, setNewPassword] = useState('Cambiami123!');
  const [mustChangePassword, setMustChangePassword] = useState(true);
  const [copied, setCopied] = useState(false);

  // Feedback Messages
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!#%';
    let pwd = 'V-';
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pwd);
    setCopied(false);
  };

  const copyPasswordToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback ignore
    }
  };

  const startEdit = (user: SystemUserItem) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      is_superuser: user.is_superuser,
      max_subtask_depth_user: user.max_subtask_depth_user ?? 3,
      must_change_password: user.must_change_password ?? false,
    });
    setMessage(null);
  };

  const startResetPassword = (user: SystemUserItem) => {
    setResetUser(user);
    generateRandomPassword();
    setMustChangePassword(true);
    setCopied(false);
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
        max_subtask_depth_user: editForm.max_subtask_depth_user === '' ? null : Number(editForm.max_subtask_depth_user),
        must_change_password: editForm.must_change_password,
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
      const res = await resetSystemUserPassword(resetUser.id, newPassword, mustChangePassword);
      setMessage({
        text: res.message || `Password impostata con successo per ${resetUser.username}!`,
        type: 'success',
      });
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

  const handlePurgeUser = async (user: SystemUserItem) => {
    if (!confirm(`ATTENZIONE: Stai per eliminare DEFINITIVAMENTE l'account di "${user.username}" e tutti i suoi dati dal database. L'operazione è irreversibile. Vuoi procedere?`)) {
      return;
    }

    setMessage(null);
    try {
      const res = await purgeDeletedUserAdmin(user.id);
      setMessage({ text: res.message, type: 'success' });
      await onRefresh();
    } catch (err: unknown) {
      setMessage({ text: extractErrorMessage(err, "Errore durante l'eliminazione definitiva dell'utente"), type: 'error' });
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
    mustChangePassword,
    setMustChangePassword,
    copied,
    generateRandomPassword,
    copyPasswordToClipboard,
    saving,
    message,
    startEdit,
    startResetPassword,
    handleSaveUser,
    handleResetPassword,
    handleToggleActive,
    handlePurgeUser,
  };
};
