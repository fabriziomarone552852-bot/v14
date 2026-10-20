// src/components/admin/maintenance/AdminDatabaseBackupsCard.tsx
import React, { useState } from 'react';
import type { DatabaseBackupItem, DatabaseRestoreResult } from '@/api/adminApi';

interface AdminDatabaseBackupsCardProps {
  backups: DatabaseBackupItem[];
  loadingBackups: boolean;
  creatingBackup: boolean;
  restoringFile: string | null;
  deletingBackup: string | null;
  restoreConfirmText: string;
  setRestoreConfirmText: (val: string) => void;
  targetRestoreFile: string | null;
  setTargetRestoreFile: (val: string | null) => void;
  restoreResult: DatabaseRestoreResult | null;
  onRefreshBackups: () => Promise<void>;
  onCreateBackup: (note?: string) => Promise<void>;
  onDeleteBackup: (filename: string) => Promise<void>;
  onDownloadBackup: (filename: string) => Promise<void>;
  onExecuteRestore: () => Promise<void>;
}

export const AdminDatabaseBackupsCard: React.FC<AdminDatabaseBackupsCardProps> = ({
  backups,
  loadingBackups,
  creatingBackup,
  restoringFile,
  deletingBackup,
  restoreConfirmText,
  setRestoreConfirmText,
  targetRestoreFile,
  setTargetRestoreFile,
  restoreResult,
  onRefreshBackups,
  onCreateBackup,
  onDeleteBackup,
  onDownloadBackup,
  onExecuteRestore,
}) => {
  const [noteInput, setNoteInput] = useState('');
  const [showCreateNote, setShowCreateNote] = useState(false);

  const handleStartCreate = () => {
    onCreateBackup(noteInput.trim() || undefined);
    setNoteInput('');
    setShowCreateNote(false);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 md:col-span-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-sky-50 p-2.5 text-xl text-sky-600">🛡️</div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Backup & Restore Generale Database (NAS Storage)</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Copia di sicurezza globale compressa (<code className="text-slate-700 font-mono">.json.gz</code>) di tutte le 40 tabelle (utenti, eventi, attività, tracker, serie TV, spesa). Archiviata in modo permanente sul NAS e ripristinabile in qualsiasi momento.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefreshBackups}
            disabled={loadingBackups}
            className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
            title="Aggiorna lista file NAS"
          >
            {loadingBackups ? '...' : '🔄'}
          </button>

          {!showCreateNote ? (
            <button
              type="button"
              onClick={() => setShowCreateNote(true)}
              disabled={creatingBackup || !!restoringFile}
              className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-2"
            >
              {creatingBackup ? 'Salvataggio in corso...' : '🛡️ Esegui Nuovo Backup su NAS'}
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              <input
                type="text"
                placeholder="Nota opzionale (es. Pre-aggiornamento)"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-sky-500 w-48 font-medium"
              />
              <button
                type="button"
                onClick={handleStartCreate}
                disabled={creatingBackup}
                className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition"
              >
                Conferma
              </button>
              <button
                type="button"
                onClick={() => setShowCreateNote(false)}
                className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
              >
                Annulla
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FEEDBACK ESITO RESTORE SE APPENA ESEGUITO */}
      {restoreResult && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
          <div className="font-bold">🎉 {restoreResult.message}</div>
          <div className="text-[11px] text-emerald-700">
            {restoreResult.total_restored_records} record ripristinati su {restoreResult.restored_tables_count} tabelle • {restoreResult.synced_sequences_count} sequenze autoincrement riallineate.
          </div>
        </div>
      )}

      {/* MODALE INLINE DI CONFERMA SICUREZZA PER IL RESTORE */}
      {targetRestoreFile && (
        <div className="p-4 bg-rose-50 rounded-2xl border-2 border-rose-300 space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs uppercase tracking-wider">
            <span>⚠️ ATTENZIONE: OPERAZIONE DI RIPRISTINO TOTALE DATABASE</span>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed">
            Stai per sovrascrivere interamente il database corrente con i dati contenuti nel backup: <br />
            <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-rose-200 text-rose-900">{targetRestoreFile}</strong>.
            <br />
            Tutti i dati attuali non inclusi nel backup verranno sostituiti. Per confermare, digita la parola <strong>RIPRISTINA</strong> nel campo sottostante:
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Digita RIPRISTINA"
              value={restoreConfirmText}
              onChange={(e) => setRestoreConfirmText(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-rose-300 rounded-xl outline-none focus:border-rose-600 font-bold tracking-wider text-rose-900 w-full sm:w-60"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={restoreConfirmText.trim().toUpperCase() !== 'RIPRISTINA' || !!restoringFile}
                onClick={onExecuteRestore}
                className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                {restoringFile ? 'Ripristino in corso...' : '🚨 Conferma e Avvia Ripristino'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTargetRestoreFile(null);
                  setRestoreConfirmText('');
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LISTA DEI BACKUP DISPONIBILI SUL NAS */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Archivio Backup su Disco NAS ({backups.length})</span>
          <span className="text-[11px] text-slate-400 font-normal">Posizione container: /app/backups/database</span>
        </div>

        {backups.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            {loadingBackups ? 'Caricamento archivio in corso...' : 'Nessun backup trovato nel NAS. Crea il primo con il pulsante in alto!'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {backups.map((b) => (
              <div
                key={b.filename}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition"
              >
                <div className="space-y-0.5">
                  <div className="font-mono text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span>{b.filename}</span>
                    {b.note && (
                      <span className="font-sans px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-semibold border border-sky-100">
                        {b.note}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3">
                    <span>📅 {new Date(b.created_at).toLocaleString('it-IT')}</span>
                    <span>💾 {b.size_kb} KB</span>
                    {b.total_records !== undefined && b.total_records !== null && (
                      <span>📊 {b.total_records} record</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onDownloadBackup(b.filename)}
                    className="p-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
                    title="Scarica copia sul tuo computer locale"
                  >
                    ⬇️ Scarica
                  </button>

                  <button
                    type="button"
                    disabled={!!restoringFile}
                    onClick={() => {
                      setTargetRestoreFile(b.filename);
                      setRestoreConfirmText('');
                    }}
                    className="p-1.5 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition"
                    title="Ripristina il database da questo backup"
                  >
                    🔄 Ripristina
                  </button>

                  <button
                    type="button"
                    disabled={deletingBackup === b.filename || !!restoringFile}
                    onClick={() => onDeleteBackup(b.filename)}
                    className="p-1.5 px-2.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold transition disabled:opacity-50"
                    title="Elimina definitivamente dal NAS"
                  >
                    {deletingBackup === b.filename ? '...' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
