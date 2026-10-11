// src/components/admin/useAdminMaintenanceLogic.ts
import { useEffect, useState } from 'react';
import type { OrphanedGroupItem, SystemUserItem } from '@/api/adminApi';
import {
  syncSequencesAdmin,
  seedShoppingDataAdmin,
  fetchOrphanedGroupsAdmin,
  transferGroupOwnershipAdmin,
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

  return {
    runningSync,
    runningSeed,
    loadingOrphans,
    loadOrphanedGroups,
    orphanedGroups,
    selectedNewOwner,
    setSelectedNewOwner,
    transferring,
    message,
    syncedTables,
    activeUsers,
    handleSyncSequences,
    handleReseedShopping,
    handleTransferOwnership,
  };
};
