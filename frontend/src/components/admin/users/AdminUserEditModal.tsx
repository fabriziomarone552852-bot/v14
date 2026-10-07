// src/components/admin/users/AdminUserEditModal.tsx
import React from 'react';
import type { SystemUserItem } from '@/api/adminApi';

interface AdminUserEditModalProps {
  editingUser: SystemUserItem | null;
  editForm: {
    username: string;
    email: string;
    is_superuser: boolean;
    max_subtask_depth_user: number | '';
    must_change_password: boolean;
  };
  setEditForm: React.Dispatch<
    React.SetStateAction<{
      username: string;
      email: string;
      is_superuser: boolean;
      max_subtask_depth_user: number | '';
      must_change_password: boolean;
    }>
  >;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              ✏️ Modifica Dati Riservati Utente #{editingUser.id}
            </h3>
            <p className="text-xs text-slate-500">
              Gestione amministrativa delle credenziali, limiti di profondità e privilegi speciali.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Username Univoco</label>
              <input
                type="text"
                required
                value={editForm.username}
                onChange={(e) => setEditForm((p) => ({ ...p, username: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Email di Recupero/Accesso</label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Limite Nidificazione Personale */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                🌲 Profondità Max Sottotask Personale (`max_subtask_depth_user`)
              </label>
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                {editForm.max_subtask_depth_user || 3} livelli
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Imposta il limite massimo per questo account (range consentito 1–10).
            </p>
            <input
              type="number"
              min={1}
              max={10}
              value={editForm.max_subtask_depth_user}
              onChange={(e) => {
                const v = e.target.value;
                setEditForm((p) => ({
                  ...p,
                  max_subtask_depth_user: v === '' ? '' : Math.max(1, Math.min(10, Number(v))),
                }));
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 font-bold focus:border-blue-500 outline-none"
            />
          </div>

          {/* Opzioni di Sicurezza e Ruolo */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.is_superuser}
                onChange={(e) => setEditForm((p) => ({ ...p, is_superuser: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-indigo-900">🛡️ Privilegi SuperUser (`is_superuser`)</span>
                <p className="text-[11px] text-slate-500">Concede accesso completo a questo pannello di amministrazione.</p>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.must_change_password}
                onChange={(e) => setEditForm((p) => ({ ...p, must_change_password: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-amber-900">🔑 Forza cambio password al prossimo accesso (`must_change_password`)</span>
                <p className="text-[11px] text-slate-500">Obbliga l&apos;utente a cambiare la propria password subito dopo il login.</p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-sky-600 px-5 py-2 text-xs font-bold text-white hover:bg-sky-700 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {saving ? 'Salvataggio...' : 'Salva Modifiche Riservate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
