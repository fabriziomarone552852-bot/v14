// src/components/admin/codes/AdminCodeCreateModal.tsx
import React from 'react';

interface AdminCodeCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    code_type: string;
    code_value: string;
    code_name: string;
    display_name: string;
    sort_order: string;
    notes: string;
  };
  setForm: React.Dispatch<React.SetStateAction<{
    code_type: string;
    code_value: string;
    code_name: string;
    display_name: string;
    sort_order: string;
    notes: string;
  }>>;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const AdminCodeCreateModal: React.FC<AdminCodeCreateModalProps> = ({
  isOpen,
  onClose,
  form,
  setForm,
  submitting,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <h3 className="mb-1 text-base font-bold text-slate-800">✨ Nuovo Codice di Configurazione</h3>
        <p className="mb-4 text-xs text-slate-500">Aggiungi una nuova opzione di vocabolario al sistema.</p>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Tipo Codice (`code_type`) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="es. shopping_unit, task_priority, group_role"
              value={form.code_type}
              onChange={(e) => setForm((p) => ({ ...p, code_type: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-800 outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Valore Interno / Chiave (`code_value`) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="es. kg, pz, high, member"
              value={form.code_value}
              onChange={(e) => setForm((p) => ({ ...p, code_value: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-800 outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Nome Visibile / Label (`code_name`) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="es. Kilogrammi, Pezzi, Alta Priorità"
              value={form.code_name}
              onChange={(e) => setForm((p) => ({ ...p, code_name: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Ordinamento (`sort_order`)</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((p) => ({ ...p, sort_order: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Descrizione / Note</label>
            <textarea
              rows={2}
              placeholder="Dettagli aggiuntivi..."
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-400"
            />
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
              disabled={submitting}
              className="rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-sky-700 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Creazione...' : 'Salva Codice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
