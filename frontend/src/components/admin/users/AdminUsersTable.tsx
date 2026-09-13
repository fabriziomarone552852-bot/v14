// src/components/admin/users/AdminUsersTable.tsx
import React from 'react';
import type { SystemUserItem } from '@/api/adminApi';

interface AdminUsersTableProps {
  users: SystemUserItem[];
  onStartEdit: (user: SystemUserItem) => void;
  onStartResetPassword: (user: SystemUserItem) => void;
  onToggleActive: (user: SystemUserItem) => void;
}

export const AdminUsersTable: React.FC<AdminUsersTableProps> = ({
  users,
  onStartEdit,
  onStartResetPassword,
  onToggleActive,
}) => {
  return (
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
                          onClick={() => onStartEdit(u)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:border-sky-300 hover:text-sky-600 transition cursor-pointer"
                        >
                          ✏️ Modifica
                        </button>

                        <button
                          type="button"
                          onClick={() => onStartResetPassword(u)}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition cursor-pointer"
                        >
                          🔑 Password
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleActive(u)}
                          className={`rounded-lg border px-2 py-1 text-xs font-semibold transition cursor-pointer ${
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
  );
};
