// src/components/admin/users/AdminUserPasswordResetModal.tsx
import React from 'react';
import type { SystemUserItem } from '@/api/adminApi';

interface AdminUserPasswordResetModalProps {
  resetUser: SystemUserItem | null;
  newPassword: string;
  setNewPassword: (password: string) => void;
  mustChangePassword: boolean;
  setMustChangePassword: (val: boolean) => void;
  copied: boolean;
  onGenerateRandom: () => void;
  onCopyPassword: () => void;
  saving: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const AdminUserPasswordResetModal: React.FC<AdminUserPasswordResetModalProps> = ({
  resetUser,
  newPassword,
  setNewPassword,
  mustChangePassword,
  setMustChangePassword,
  copied,
  onGenerateRandom,
  onCopyPassword,
  saving,
  onClose,
  onSubmit,
}) => {
  if (!resetUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              🔑 Reset Password Utente &quot;{resetUser.username}&quot;
            </h3>
            <p className="text-xs text-slate-500">
              Imposta una nuova password temporanea o standard per il ripristino dell&apos;accesso.
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
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Nuova Password</label>
              <button
                type="button"
                onClick={onGenerateRandom}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-800 transition cursor-pointer"
              >
                🎲 Genera Casuale
              </button>
            </div>

            <div className="relative flex items-center">
              <input
                type="text"
                required
                minLength={4}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-sm font-bold text-slate-800 outline-none focus:border-amber-400 focus:bg-white pr-20"
                placeholder="es. V-8kL9#m2"
              />
              <button
                type="button"
                onClick={onCopyPassword}
                className="absolute right-1.5 px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold transition cursor-pointer"
              >
                {copied ? '✓ Copiato!' : '📋 Copia'}
              </button>
            </div>
          </div>

          {/* Checkbox Forza Cambio Password */}
          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/60 transition cursor-pointer">
            <input
              type="checkbox"
              checked={mustChangePassword}
              onChange={(e) => setMustChangePassword(e.target.checked)}
              className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-amber-950">Richiedi cambio password al prossimo accesso</span>
              <p className="text-[11px] text-amber-800">
                L&apos;utente sarà indirizzato alla schermata di cambio credenziali subito dopo il login.
              </p>
            </div>
          </label>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600">
            ℹ️ Questa operazione sovrascrive immediatamente l&apos;hash sul database. Ricorda di comunicare la nuova password all&apos;utente in modo sicuro.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
              className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white hover:bg-amber-700 transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {saving ? 'Salvataggio...' : 'Conferma Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
