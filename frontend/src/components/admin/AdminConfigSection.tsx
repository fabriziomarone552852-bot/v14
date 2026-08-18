// src/components/admin/AdminConfigSection.tsx
import React, { useState } from 'react';
import type { SystemConfigItem } from '@/api/adminApi';
import { updateSystemConfig } from '@/api/adminApi';

interface AdminConfigSectionProps {
  configs: SystemConfigItem[];
  onRefresh: () => Promise<void>;
}

export const AdminConfigSection: React.FC<AdminConfigSectionProps> = ({ configs, onRefresh }) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const startEdit = (cfg: SystemConfigItem) => {
    setEditingKey(cfg.key);
    setEditValue(cfg.value);
    setEditDesc(cfg.descrizione ?? '');
    setMessage(null);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
    setEditDesc('');
  };

  const handleSave = async (key: string) => {
    setSaving(true);
    setMessage(null);
    try {
      await updateSystemConfig(key, { value: editValue, descrizione: editDesc });
      setMessage({ text: `Variabile "${key}" aggiornata con successo!`, type: 'success' });
      setEditingKey(null);
      await onRefresh();
    } catch (err: any) {
      setMessage({ text: err?.response?.data?.detail || 'Errore durante l\'aggiornamento', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">⚙️ Variabili di Sistema (`Config`)</h3>
          <p className="text-xs text-slate-500">
            Modifica i parametri globali del backend (es. limiti nidificazione, configurazioni globali e flag di sistema).
          </p>
        </div>
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
                <th className="px-4 py-3 font-semibold">Chiave Parametro (`Key`)</th>
                <th className="px-4 py-3 font-semibold">Valore Attuale (`Value`)</th>
                <th className="px-4 py-3 font-semibold">Descrizione</th>
                <th className="px-4 py-3 text-right font-semibold">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {configs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Nessuna variabile di sistema trovata.
                  </td>
                </tr>
              ) : (
                configs.map((cfg) => {
                  const isEditing = editingKey === cfg.key;

                  return (
                    <tr key={cfg.key} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-mono font-bold text-sky-700">{cfg.key}</td>

                      <td className="px-4 py-3 font-medium">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full rounded-lg border border-sky-300 bg-white px-2.5 py-1 text-xs outline-none focus:ring-2 focus:ring-sky-200"
                            autoFocus
                          />
                        ) : (
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-800">
                            {cfg.value}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-500">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs outline-none focus:ring-2 focus:ring-sky-200"
                          />
                        ) : (
                          cfg.descrizione || <span className="italic text-slate-300">Nessuna descrizione</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSave(cfg.key)}
                              disabled={saving}
                              className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                            >
                              {saving ? 'Salvataggio...' : 'Salva'}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                            >
                              Annulla
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEdit(cfg)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-sky-300 hover:text-sky-600 transition"
                          >
                            ✏️ Modifica
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
