// src/components/admin/users/AdminUserPasswordResetModal.tsx
import React from 'react';
import type { SystemUserItem } from '@/api/adminApi';

interface AdminUserPasswordResetModalProps {
  resetUser: SystemUserItem | null;
  newPassword: string;
  setNewPassword: (password: string) => void;
  saving: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const AdminUserPasswordResetModal: React.FC<AdminUserPasswordResetModalProps> = ({
  resetUser,
  newPassword,
  setNewPassword,
  saving,
  onClose,
  onSubmit,
}) => {
  if (!resetUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="mb-1 text-base font-bold text-slate-800">🔑 Reset Password - Utente "{resetUser.username}"</h3>
        <p className="mb-4 text-xs text-slate-500">
          Imposta una nuova password standard o temporanea per consentire all'utente di accedere al proprio account.
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
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
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Impostazione...' : 'Conferma Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
