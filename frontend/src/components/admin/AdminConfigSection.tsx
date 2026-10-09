// src/components/admin/AdminConfigSection.tsx
import React, { useState } from 'react';
import type { SystemConfigItem } from '@/api/adminApi';
import { updateSystemConfig } from '@/api/adminApi';
import { extractErrorMessage } from '@/utils/errorUtils';

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

  // Trova le chiavi di sistema note
  const maxDepthCfg = configs.find((c) => c.key === 'max_subtask_depth');
  const lookbackCfg = configs.find((c) => c.key === 'price_stats_lookback_days');

  const [depthVal, setDepthVal] = useState<number>(() => {
    return maxDepthCfg ? Number(maxDepthCfg.value) || 3 : 3;
  });

  const [lookbackVal, setLookbackVal] = useState<string>(() => {
    return lookbackCfg ? lookbackCfg.value : '365';
  });

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

  const handleSave = async (key: string, valueToSave: string, descToSave?: string) => {
    setSaving(true);
    setMessage(null);
    try {
      await updateSystemConfig(key, { value: valueToSave, descrizione: descToSave });
      setMessage({ text: `Parametro "${key}" aggiornato con successo a "${valueToSave}"!`, type: 'success' });
      setEditingKey(null);
      await onRefresh();
    } catch (err: unknown) {
      setMessage({ text: extractErrorMessage(err, "Errore durante l'aggiornamento"), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-extrabold text-slate-900">⚙️ Parametri Globali e Limiti di Sistema (`Config`)</h3>
        <p className="text-xs text-slate-500">
          Configura i tetti massimi operativi e i parametri trasversali validi per tutti gli utenti della piattaforma.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-2xl p-4 text-xs font-semibold ${
            message.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* CARD SPECIALIZZATE PER I PARAMETRI CHIAVE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Tetto Massimo Nidificazione Task */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🌲</span>
                <h4 className="text-sm font-bold text-slate-900">Tetto Massimo Nidificazione Task</h4>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Definisce il limite massimo assoluto di livelli di sotto-task che qualsiasi utente può configurare.
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 font-extrabold text-sm rounded-xl shrink-0">
              {maxDepthCfg?.value || depthVal} livelli
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>1 livello (Minimo)</span>
              <span className="text-blue-600 font-extrabold">{depthVal} livelli</span>
              <span>10 livelli (Massimo)</span>
            </div>

            <input
              type="range"
              min={1}
              max={10}
              value={depthVal}
              disabled={saving}
              onChange={(e) => setDepthVal(Number(e.target.value))}
              className="w-full h-2.5 rounded-full appearance-none bg-slate-200 cursor-pointer accent-blue-600"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 font-mono">chiave: max_subtask_depth</span>
              <button
                type="button"
                disabled={saving || (maxDepthCfg && maxDepthCfg.value === String(depthVal))}
                onClick={() =>
                  handleSave(
                    'max_subtask_depth',
                    String(depthVal),
                    maxDepthCfg?.descrizione || 'Numero massimo di livelli consentiti per la nidificazione dei sottotask.'
                  )
                }
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition disabled:opacity-40 cursor-pointer shadow-xs"
              >
                {saving ? 'Salvataggio...' : 'Applica Tetto Globale'}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Finestra Storico Prezzi Spesa */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <h4 className="text-sm font-bold text-slate-900">Storico Statistiche Prezzi Spesa</h4>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Finestra temporale in giorni per il calcolo del prezzo medio e migliore nello storico acquisti.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-sm rounded-xl shrink-0">
              {lookbackCfg?.value || lookbackVal} giorni
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <label className="block text-xs font-bold text-slate-700">Seleziona Intervallo di Analisi</label>
            <select
              value={lookbackVal}
              disabled={saving}
              onChange={(e) => setLookbackVal(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
            >
              <option value="90">90 Giorni (~3 Mesi)</option>
              <option value="180">180 Giorni (~6 Mesi)</option>
              <option value="365">365 Giorni (1 Anno - Consigliato)</option>
              <option value="730">730 Giorni (2 Anni)</option>
            </select>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500 font-mono">chiave: price_stats_lookback_days</span>
              <button
                type="button"
                disabled={saving || (lookbackCfg && lookbackCfg.value === lookbackVal)}
                onClick={() =>
                  handleSave(
                    'price_stats_lookback_days',
                    lookbackVal,
                    lookbackCfg?.descrizione || 'Numero di giorni di storico per il calcolo del prezzo medio.'
                  )
                }
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-40 cursor-pointer shadow-xs"
              >
                {saving ? 'Salvataggio...' : 'Applica Finestra'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABELLA GENERICA VARIABILI DI SISTEMA */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
          Tutte le Variabili di Sistema Registrate ({configs.length})
        </h4>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Chiave Parametro (`Key`)</th>
                  <th className="px-4 py-3 font-semibold">Valore Attuale (`Value`)</th>
                  <th className="px-4 py-3 font-semibold">Descrizione & Note</th>
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
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-slate-800 font-bold">
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
                              className="w-full rounded-lg border border-sky-300 bg-white px-2.5 py-1 text-xs outline-none focus:ring-2 focus:ring-sky-200"
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
                                onClick={() => handleSave(cfg.key, editValue, editDesc)}
                                disabled={saving}
                                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
                              >
                                {saving ? '...' : 'Salva'}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                              >
                                Annulla
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEdit(cfg)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-sky-300 hover:text-sky-600 transition cursor-pointer"
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
    </div>
  );
};

export default AdminConfigSection;
