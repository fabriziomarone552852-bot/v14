// src/components/admin/useAdminMaintenanceLogic.ts
import { useEffect, useState } from 'react';
import type { OrphanedGroupItem, SystemUserItem } from '@/api/adminApi';
import {
  syncSequencesAdmin,
  seedShoppingDataAdmin,
  dumpSeedsAdmin,
  downloadSeedsZipAdmin,
  fetchOrphanedGroupsAdmin,
  transferGroupOwnershipAdmin,
  fetchDatabaseBackupsAdmin,
  createDatabaseBackupAdmin,
  deleteDatabaseBackupAdmin,
  downloadDatabaseBackupAdmin,
  restoreDatabaseBackupAdmin,
  type DumpSeedsResult,
  type DatabaseBackupItem,
  type DatabaseRestoreResult,
} from '@/api/adminApi';
import { extractErrorMessage } from '@/utils/errorUtils';

interface UseAdminMaintenanceLogicProps {
  users: SystemUserItem[];
  onRefresh: () => Promise<void>;
}

export const useAdminMaintenanceLogic = ({
  users,
  onRefresh,
}: UseAdminMaintenanceLogicProps) => {
  const [runningSync, setRunningSync] = useState(false);
  const [runningSeed, setRunningSeed] = useState(false);
  const [runningDump, setRunningDump] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [dumpResult, setDumpResult] = useState<DumpSeedsResult['data'] | null>(null);
  const [loadingOrphans, setLoadingOrphans] = useState(false);
  const [orphanedGroups, setOrphanedGroups] = useState<OrphanedGroupItem[]>([]);
  const [selectedNewOwner, setSelectedNewOwner] = useState<Record<number, number>>({});
  const [transferring, setTransferring] = useState<number | null>(null);

  // Backup & Restore Database NAS
  const [backups, setBackups] = useState<DatabaseBackupItem[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoringFile, setRestoringFile] = useState<string | null>(null);
  const [deletingBackup, setDeletingBackup] = useState<string | null>(null);
  const [restoreConfirmText, setRestoreConfirmText] = useState('');
  const [targetRestoreFile, setTargetRestoreFile] = useState<string | null>(null);
  const [restoreResult, setRestoreResult] = useState<DatabaseRestoreResult | null>(null);


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
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoadingBackups(true);
    try {
      const data = await fetchDatabaseBackupsAdmin();
      setBackups(data);
    } catch {
      // Ignora o gestisci
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleCreateDatabaseBackup = async (note?: string) => {
    setCreatingBackup(true);
    setMessage(null);
    try {
      const res = await createDatabaseBackupAdmin(note);
      setMessage({
        text: `Backup database completato con successo sul NAS: ${res.data.filename} (${res.data.size_kb} KB, ${res.data.total_records} record)!`,
        type: 'success',
      });
      await loadBackups();
    } catch (err: unknown) {
      setMessage({
        text: extractErrorMessage(err, 'Errore durante la creazione del backup database'),
        type: 'error',
      });
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`Sei sicuro di voler eliminare definitivamente dal NAS il backup '${filename}'?`)) return;
    setDeletingBackup(filename);
    try {
      await deleteDatabaseBackupAdmin(filename);
      await loadBackups();
      setMessage({ text: `Backup ${filename} eliminato con successo.`, type: 'success' });
    } catch (err: unknown) {
      setMessage({
        text: extractErrorMessage(err, 'Errore durante l\'eliminazione del backup'),
        type: 'error',
      });
    } finally {
      setDeletingBackup(null);
    }
  };

  const handleDownloadBackup = async (filename: string) => {
    try {
      await downloadDatabaseBackupAdmin(filename);
    } catch (err: unknown) {
      setMessage({
        text: extractErrorMessage(err, 'Errore durante il download del backup'),
        type: 'error',
      });
    }
  };

  const handleExecuteRestore = async () => {
    if (!targetRestoreFile) return;
    if (restoreConfirmText.trim().toUpperCase() !== 'RIPRISTINA') {
      alert("Digita 'RIPRISTINA' per confermare l'operazione di sovrascrittura totale.");
      return;
    }

    setRestoringFile(targetRestoreFile);
    setMessage(null);
    setRestoreResult(null);

    try {
      const res = await restoreDatabaseBackupAdmin(targetRestoreFile);
      setRestoreResult(res);
      setMessage({
        text: `Ripristino database completato con successo da ${targetRestoreFile}! (${res.total_restored_records} record ripristinati su ${res.restored_tables_count} tabelle).`,
        type: 'success',
      });
      setTargetRestoreFile(null);
      setRestoreConfirmText('');
      await onRefresh();
    } catch (err: unknown) {
      setMessage({
        text: extractErrorMessage(err, 'Errore critico durante il ripristino del database'),
        type: 'error',
      });
    } finally {
      setRestoringFile(null);
    }
  };


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

  const handleDumpSeeds = async () => {
    if (!confirm('Vuoi rigenerare tutti i file CSV di seed dai dati attuali del database? I file in backend/seeds verranno ricreati e archiviati sul NAS.')) return;
    setRunningDump(true);
    setMessage(null);
    try {
      const res = await dumpSeedsAdmin();
      setDumpResult(res.data);
      setMessage({
        text: `Snapshot Seeds completato con successo! Generati ${Object.values(res.data.counts).reduce((a, b) => a + b, 0)} record totali su 7 file.`,
        type: 'success',
      });
      await onRefresh();
    } catch (err: unknown) {
      setMessage({
        text: extractErrorMessage(err, 'Errore durante la rigenerazione dei file di seed'),
        type: 'error',
      });
    } finally {
      setRunningDump(false);
    }
  };

  const handleDownloadSeedsZip = async () => {
    setDownloadingZip(true);
    try {
      await downloadSeedsZipAdmin();
    } catch (err: unknown) {
      setMessage({
        text: extractErrorMessage(err, 'Errore durante il download dello ZIP dei seed'),
        type: 'error',
      });
    } finally {
      setDownloadingZip(false);
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

  return {
    runningSync,
    runningSeed,
    runningDump,
    downloadingZip,
    dumpResult,
    loadingOrphans,
    loadOrphanedGroups,
    orphanedGroups,
    selectedNewOwner,
    setSelectedNewOwner,
    transferring,
    message,
    syncedTables,
    activeUsers,
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
    loadBackups,
    handleCreateDatabaseBackup,
    handleDeleteBackup,
    handleDownloadBackup,
    handleExecuteRestore,
    handleSyncSequences,
    handleReseedShopping,
    handleDumpSeeds,
    handleDownloadSeedsZip,
    handleTransferOwnership,
  };
};
