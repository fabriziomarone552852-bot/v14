// src/components/admin/users/AdminUsersTable.tsx
import React from 'react';
import type { SystemUserItem } from '@/api/adminApi';

interface AdminUsersTableProps {
  users: SystemUserItem[];
  onStartEdit: (user: SystemUserItem) => void;
  onStartResetPassword: (user: SystemUserItem) => void;
  onToggleActive: (user: SystemUserItem) => void;
  onPurgeUser: (user: SystemUserItem) => void;
}

export const AdminUsersTable: React.FC<AdminUsersTableProps> = ({
  users,
  onStartEdit,
  onStartResetPassword,
  onToggleActive,
  onPurgeUser,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50 uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">User ID</th>
              <th className="px-4 py-3 font-semibold">Utente & Email</th>
              <th className="px-4 py-3 font-semibold">Ruolo & Privilegi</th>
              <th className="px-4 py-3 font-semibold">Nidif. Max</th>
              <th className="px-4 py-3 font-semibold">Risorse Attive</th>
              <th className="px-4 py-3 font-semibold">Stato Account</th>
              <th className="px-4 py-3 text-right font-semibold">Azioni Riservate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Nessun utente trovato nel sistema.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isActive = !u.deleted_at;

                return (
                  <tr key={u.id} className={`transition ${isActive ? 'hover:bg-slate-50/60' : 'bg-rose-50/30 opacity-80'}`}>
                    {/* ID */}
                    <td className="px-4 py-3 font-mono font-bold text-slate-400">#{u.id}</td>

                    {/* Username & Email */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{u.username}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>

                    {/* Ruolo */}
                    <td className="px-4 py-3">
                      {u.is_superuser ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                          🛡️ SuperUser (Admin)
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                          Utente Standard
                        </span>
                      )}
                    </td>

                    {/* Nidificazione Massima Personale */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-extrabold text-blue-700 border border-blue-100">
                        🌲 {u.max_subtask_depth_user ?? 3} liv.
                      </span>
                    </td>

                    {/* Risorse Collegate */}
                    <td className="px-4 py-3 text-[11px] text-slate-600">
                      <div className="flex items-center gap-2 font-medium">
                        <span title="Task creati">📋 {u.tasks_count}</span>
                        <span title="Eventi creati">📅 {u.events_count}</span>
                        <span title="Gruppi spesa">🛒 {u.shopping_groups_count}</span>
                      </div>
                    </td>

                    {/* Stato */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {isActive ? (
                          <span className="inline-flex items-center w-fit rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            🟢 Attivo
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center w-fit rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700"
                            title={u.deleted_by_username ? `Disattivato da ${u.deleted_by_username}` : 'Disattivato'}
                          >
                            🔴 Disattivato
                          </span>
                        )}

                        {u.must_change_password && (
                          <span className="inline-flex items-center w-fit rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800">
                            ⚠️ Cambio pwd richiesto
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Azioni */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => onStartEdit(u)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:border-sky-300 hover:text-sky-600 transition cursor-pointer"
                          title="Modifica impostazioni e dati utente"
                        >
                          ✏️ Modifica
                        </button>

                        <button
                          type="button"
                          onClick={() => onStartResetPassword(u)}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition cursor-pointer"
                          title="Reimposta password di accesso"
                        >
                          🔑 Pwd
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleActive(u)}
                          className={`rounded-lg border px-2 py-1 text-xs font-semibold transition cursor-pointer ${
                            isActive
                              ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                          title={isActive ? 'Disattiva account utente' : 'Ripristina account utente'}
                        >
                          {isActive ? '🚫 Disabilita' : '✅ Ripristina'}
                        </button>

                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => onPurgeUser(u)}
                            className="rounded-lg border border-red-300 bg-red-600 px-2 py-1 text-xs font-bold text-white hover:bg-red-700 transition cursor-pointer shadow-xs"
                            title="Elimina definitivamente utente e dati dal database"
                          >
                            🗑️ Purge
                          </button>
                        )}
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
