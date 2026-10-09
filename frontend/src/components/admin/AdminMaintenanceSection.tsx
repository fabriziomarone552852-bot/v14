// src/components/admin/AdminMaintenanceSection.tsx
import React, { useEffect, useState } from 'react';
import type { OrphanedGroupItem, SystemUserItem } from '@/api/adminApi';
import {
  syncSequencesAdmin,
  seedShoppingDataAdmin,
  fetchOrphanedGroupsAdmin,
  transferGroupOwnershipAdmin,
} from '@/api/adminApi';
import { extractErrorMessage } from '@/utils/errorUtils';

interface AdminMaintenanceSectionProps {
  users: SystemUserItem[];
  onRefresh: () => Promise<void>;
}

export const AdminMaintenanceSection: React.FC<AdminMaintenanceSectionProps> = ({
  users,
  onRefresh,
}) => {
  const [runningSync, setRunningSync] = useState(false);
  const [runningSeed, setRunningSeed] = useState(false);
  const [loadingOrphans, setLoadingOrphans] = useState(false);
  const [orphanedGroups, setOrphanedGroups] = useState<OrphanedGroupItem[]>([]);
  const [selectedNewOwner, setSelectedNewOwner] = useState<Record<number, number>>({});
  const [transferring, setTransferring] = useState<number | null>(null);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [syncedTables, setSyncedTables] = useState<string[]>([]);

  const activeUsers = users.filter((u) => !u.deleted_at);

  const loadOrphanedGroups = async () => {
    setLoadingOrphans(true);
    try {
      const data = await fetchOrphanedGroupsAdmin();
      setOrphanedGroups(data);
    } catch {
      // Ignora o gestisci
    } finally {
      setLoadingOrphans(false);
    }
  };

  useEffect(() => {
    loadOrphanedGroups();
  }, []);

  const handleSyncSequences = async () => {
    setRunningSync(true);
    setMessage(null);
    try {
      const res = await syncSequencesAdmin();
      setSyncedTables(res.synced_tables || []);
      setMessage({
        text: `Sincronizzazione completata con successo su ${res.synced_tables?.length || 0} tabelle!`,
        type: 'success',
      });
    } catch (err: unknown) {
      setMessage({
        text: extractErrorMessage(err, 'Errore durante la sincronizzazione delle sequenze'),
        type: 'error',
      });
    } finally {
      setRunningSync(false);
    }
  };

  const handleReseedShopping = async () => {
    if (!confirm('Sei sicuro di voler rigenerare i prodotti, negozi e lotti di base per lo shopping?')) return;
    setRunningSeed(true);
    setMessage(null);
    try {
      const res = await seedShoppingDataAdmin();
      setMessage({ text: res.message, type: 'success' });
      await onRefresh();
    } catch (err: unknown) {
      setMessage({
        text: extractErrorMessage(err, 'Errore durante il popolamento seed'),
        type: 'error',
      });
    } finally {
      setRunningSeed(false);
    }
  };

  const handleTransferOwnership = async (groupId: number) => {
    const newOwnerId = selectedNewOwner[groupId];
    if (!newOwnerId) {
      alert('Seleziona un nuovo utente attivo a cui trasferire la proprietà del gruppo.');
      return;
    }

    setTransferring(groupId);
    setMessage(null);
    try {
      const res = await transferGroupOwnershipAdmin(groupId, newOwnerId);
      setMessage({ text: res.message, type: 'success' });
      await loadOrphanedGroups();
      await onRefresh();
    } catch (err: unknown) {
      setMessage({
        text: extractErrorMessage(err, 'Errore durante il trasferimento proprietà'),
        type: 'error',
      });
    } finally {
      setTransferring(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-extrabold text-slate-900">🛠️ Strumenti di Manutenzione & Integrità Dati</h3>
        <p className="text-xs text-slate-500">
          Operazioni di manutenzione straordinaria del database relazionale, riallineamento sequenze e gestione risorse orfane.
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD 1: Riallineamento Sequenze PostgreSQL */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 p-2.5 text-xl text-indigo-600">⚡</div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Riallineamento Sequenze Database</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggiorna le sequenze degli ID (`MAX(id)`) in PostgreSQL per prevenire errori di chiave duplicata post-import.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <button
              type="button"
              onClick={handleSyncSequences}
              disabled={runningSync}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              {runningSync ? 'Sincronizzazione in corso...' : '⚡ Esegui Sincronizzazione Sequenze'}
            </button>

            {syncedTables.length > 0 && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 max-h-32 overflow-y-auto font-mono">
                <div className="font-bold text-slate-800 mb-1">Tabelle sincronizzate ({syncedTables.length}):</div>
                <div className="flex flex-wrap gap-1">
                  {syncedTables.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: Re-seed Prodotti Spesa */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-amber-50 p-2.5 text-xl text-amber-600">🛒</div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Re-seed Cataloghi Spesa & Negozi</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Re-inserisce i prodotti alimentari standard, i fornitori/supermercati e i lotti di esempio nel catalogo.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <button
              type="button"
              onClick={handleReseedShopping}
              disabled={runningSeed}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              {runningSeed ? 'Popolamento in corso...' : '🛒 Re-popola Prodotti & Negozi Seed'}
            </button>
            <p className="text-[11px] text-slate-500 italic">
              Utile dopo aver svuotato il DB o se mancano i prodotti predefiniti di base.
            </p>
          </div>
        </div>
      </div>

      {/* SEZIONE GRUPPI SPESA ORFANI */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">👑 Gruppi Condivisi Orfani (Proprietario Disattivato)</h4>
            <p className="text-xs text-slate-500">
              Se un utente viene disattivato ma ha creato dei gruppi spesa condivisi, puoi riassegnare la proprietà a un membro attivo.
            </p>
          </div>
          <button
            type="button"
            onClick={loadOrphanedGroups}
            disabled={loadingOrphans}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
          >
            {loadingOrphans ? 'Controllo...' : '🔄 Aggiorna Lista Orfani'}
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {orphanedGroups.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              ✅ Nessun gruppo orfano rilevato: tutti i gruppi condivisi appartengono a utenti attivi.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orphanedGroups.map((g) => (
                <div key={g.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{g.name}</div>
                    <div className="text-xs text-slate-500">
                      Ex-Proprietario: <span className="font-semibold text-rose-600">{g.owner_username}</span> (Disattivato) • {g.members_count} membri totali
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedNewOwner[g.id] || ''}
                      onChange={(e) =>
                        setSelectedNewOwner((p) => ({
                          ...p,
                          [g.id]: Number(e.target.value),
                        }))
                      }
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-sky-500"
                    >
                      <option value="">-- Seleziona Nuovo Proprietario --</option>
                      {activeUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.username} (#{u.id})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={transferring === g.id || !selectedNewOwner[g.id]}
                      onClick={() => handleTransferOwnership(g.id)}
                      className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-40 cursor-pointer"
                    >
                      {transferring === g.id ? 'Trasferimento...' : 'Trasferisci'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMaintenanceSection;
