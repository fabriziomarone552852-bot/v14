// src/components/admin/AdminCodesSection.tsx
import React, { useMemo, useState } from 'react';
import type { SystemConfigCodeItem } from '@/api/adminApi';
import { createSystemCode, deactivateSystemCode, updateSystemCode } from '@/api/adminApi';

interface AdminCodesSectionProps {
  codes: SystemConfigCodeItem[];
  onRefresh: () => Promise<void>;
}

export const AdminCodesSection: React.FC<AdminCodesSectionProps> = ({ codes, onRefresh }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtered types list for dropdown
  const codeTypes = useMemo(() => {
    const set = new Set(codes.map((c) => c.code_type));
    return Array.from(set).sort();
  }, [codes]);

  const filteredCodes = useMemo(() => {
    return codes.filter((c) => {
      const matchesType = selectedType === 'all' || c.code_type === selectedType;
      const matchesSearch =
        !search ||
        c.code_name.toLowerCase().includes(search.toLowerCase()) ||
        c.code_value.toLowerCase().includes(search.toLowerCase()) ||
        (c.display_name && c.display_name.toLowerCase().includes(search.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [codes, selectedType, search]);

  // Modal form state for Create Code
  const [form, setForm] = useState({
    code_type: '',
    code_value: '',
    code_name: '',
    display_name: '',
    sort_order: '0',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code_type || !form.code_value || !form.code_name) return;

    setSubmitting(true);
    setMessage(null);
    try {
      await createSystemCode({
        code_type: form.code_type.trim().toLowerCase(),
        code_value: form.code_value.trim().toLowerCase(),
        code_name: form.code_name.trim(),
        display_name: form.display_name.trim() || undefined,
        sort_order: Number(form.sort_order) || 0,
        notes: form.notes.trim() || undefined,
      });

      setMessage({ text: 'Nuovo ConfigCode creato con successo!', type: 'success' });
      setIsModalOpen(false);
      setForm({ code_type: '', code_value: '', code_name: '', display_name: '', sort_order: '0', notes: '' });
      await onRefresh();
    } catch (err: any) {
      setMessage({ text: err?.response?.data?.detail || 'Errore nella creazione', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (code: SystemConfigCodeItem) => {
    try {
      if (code.is_active) {
        await deactivateSystemCode(code.id);
      } else {
        await updateSystemCode(code.id, { is_active: true });
      }
      await onRefresh();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Errore nell\'aggiornamento stato');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">🏷️ Codici di Configurazione (`ConfigCode`)</h3>
          <p className="text-xs text-slate-500">
            Vocabolari di sistema (stati task, ruoli gruppi, visibilità liste, tipi priorità).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-sky-700 transition"
        >
          + Nuovo ConfigCode
        </button>
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

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Tipo Codice (`Code Type`):</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-sky-400"
          >
            <option value="all">Tutti i tipi ({codeTypes.length})</option>
            {codeTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[200px] flex-1">
          <input
            type="text"
            placeholder="Cerca per codice o nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-sky-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Code Type</th>
                <th className="px-4 py-3 font-semibold">Code Value</th>
                <th className="px-4 py-3 font-semibold">Display Name / Code Name</th>
                <th className="px-4 py-3 font-semibold">Ordine</th>
                <th className="px-4 py-3 font-semibold">Stato</th>
                <th className="px-4 py-3 text-right font-semibold">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    Nessun codice di configurazione trovato.
                  </td>
                </tr>
              ) : (
                filteredCodes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3 text-slate-400 font-mono">#{c.id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{c.code_type}</td>
                    <td className="px-4 py-3 font-mono font-bold text-sky-700">{c.code_value}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{c.display_name || c.code_name}</span>
                      <span className="ml-1 text-[10px] text-slate-400">({c.code_name})</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">{c.sort_order}</td>
                    <td className="px-4 py-3">
                      {c.is_active ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Attivo
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          Disattivo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                          c.is_active
                            ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {c.is_active ? 'Disattiva' : 'Riattiva'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating New Code */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="mb-4 text-base font-bold text-slate-800">➕ Nuovo ConfigCode</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Code Type (es. task_status, group_role)</label>
                <input
                  type="text"
                  required
                  value={form.code_type}
                  onChange={(e) => setForm((p) => ({ ...p, code_type: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400"
                  placeholder="es. task_status"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Code Value (chiave univoca nel tipo)</label>
                <input
                  type="text"
                  required
                  value={form.code_value}
                  onChange={(e) => setForm((p) => ({ ...p, code_value: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400"
                  placeholder="es. in_progress"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Code Name (nome interno)</label>
                <input
                  type="text"
                  required
                  value={form.code_name}
                  onChange={(e) => setForm((p) => ({ ...p, code_name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400"
                  placeholder="es. In Esecuzione"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Display Name (etichetta UI)</label>
                <input
                  type="text"
                  value={form.display_name}
                  onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400"
                  placeholder="es. ⏳ In Esecuzione"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Ordine Ordinamento (`Sort Order`)</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((p) => ({ ...p, sort_order: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-700 transition disabled:opacity-50"
                >
                  {submitting ? 'Creazione...' : 'Crea Codice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
