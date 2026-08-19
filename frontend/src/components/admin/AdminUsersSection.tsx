// src/components/admin/AdminUsersSection.tsx
import React, { useState } from 'react';
import type { SystemUserItem } from '@/api/adminApi';
import { updateSystemUser, resetSystemUserPassword, toggleSystemUserActive } from '@/api/adminApi';
import { extractErrorMessage } from '@/utils/errorUtils';

interface AdminUsersSectionProps {
  users: SystemUserItem[];
  onRefresh: () => Promise<void>;
}

export const AdminUsersSection: React.FC<AdminUsersSectionProps> = ({ users, onRefresh }) => {
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

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-800">👥 Gestione Utenti, Abilitazione & Reset Credenziali</h3>
        <p className="text-xs text-slate-500">
          Visualizza, modifica i dati, disabilita/ripristina gli account oppure imposta una password temporanea/standard per il recupero.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-xl p-3 text-xs font-medium ${
            message.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">User ID</th>
                <th className="px-4 py-3 font-semibold">Username</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Ruolo Piattaforma</th>
                <th className="px-4 py-3 font-semibold">Stato Utente</th>
                <th className="px-4 py-3 text-right font-semibold">Azioni Amministrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    Nessun utente trovato.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isActive = !u.deleted_at;

                  return (
                    <tr key={u.id} className={`transition ${isActive ? 'hover:bg-slate-50/60' : 'bg-rose-50/20 opacity-75'}`}>
                      <td className="px-4 py-3 font-mono text-slate-400">#{u.id}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{u.username}</td>
                      <td className="px-4 py-3 font-medium text-slate-600">{u.email}</td>
                      <td className="px-4 py-3">
                        {u.is_superuser ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                            🛡️ SuperUser (SU)
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                            Utente Standard
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isActive ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            Attivo
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                            Disabilitato
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(u)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:border-sky-300 hover:text-sky-600 transition"
                          >
                            ✏️ Modifica
                          </button>

                          <button
                            type="button"
                            onClick={() => startResetPassword(u)}
                            className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
                          >
                            🔑 Password
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleActive(u)}
                            className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${
                              isActive
                                ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {isActive ? '🚫 Disabilita' : '✅ Ripristina'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Modifica Dati Utente */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="mb-1 text-base font-bold text-slate-800">✏️ Modifica Dati Utente #{editingUser.id}</h3>
            <p className="mb-4 text-xs text-slate-500">Aggiorna le informazioni di profilo o assegna permessi SuperUser.</p>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Username</label>
                <input
                  type="text"
                  required
                  value={editForm.username}
                  onChange={(e) => setEditForm((p) => ({ ...p, username: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_superuser_check"
                  checked={editForm.is_superuser}
                  onChange={(e) => setEditForm((p) => ({ ...p, is_superuser: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="is_superuser_check" className="text-xs font-bold text-slate-800 cursor-pointer">
                  🛡️ Promuovi a SuperUser (`is_superuser`)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-700 transition disabled:opacity-50"
                >
                  {saving ? 'Salvataggio...' : 'Salva Modifiche'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password Utente */}
      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="mb-1 text-base font-bold text-slate-800">🔑 Reset Password - Utente "{resetUser.username}"</h3>
            <p className="mb-4 text-xs text-slate-500">
              Imposta una nuova password standard o temporanea per consentire all'utente di accedere al proprio account.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Nuova Password Standard</label>
                <input
                  type="text"
                  required
                  minLength={4}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-800 outline-none focus:border-sky-400"
                  placeholder="es. Cambiami123!"
                />
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800">
                ⚠️ Questa operazione sovrascriverà la password dell'utente. L'utente potrà subito accedere alla piattaforma utilizzando la nuova password indicata.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setResetUser(null)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition disabled:opacity-50"
                >
                  {saving ? 'Impostazione...' : 'Conferma Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
