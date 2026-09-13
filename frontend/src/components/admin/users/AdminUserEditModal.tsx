// src/components/admin/users/AdminUserEditModal.tsx
import React from 'react';
import type { SystemUserItem } from '@/api/adminApi';

interface AdminUserEditModalProps {
  editingUser: SystemUserItem | null;
  editForm: { username: string; email: string; is_superuser: boolean };
  setEditForm: React.Dispatch<React.SetStateAction<{ username: string; email: string; is_superuser: boolean }>>;
  saving: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const AdminUserEditModal: React.FC<AdminUserEditModalProps> = ({
  editingUser,
  editForm,
  setEditForm,
  saving,
  onClose,
  onSubmit,
}) => {
  if (!editingUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="mb-1 text-base font-bold text-slate-800">✏️ Modifica Dati Utente #{editingUser.id}</h3>
        <p className="mb-4 text-xs text-slate-500">Aggiorna le informazioni di profilo o assegna permessi SuperUser.</p>

        <form onSubmit={onSubmit} className="space-y-3">
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
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="is_superuser_check" className="text-xs font-bold text-slate-800 cursor-pointer">
              🛡️ Promuovi a SuperUser (`is_superuser`)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
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
              className="rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-700 transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
