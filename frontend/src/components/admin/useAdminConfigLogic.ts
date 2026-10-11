// src/components/admin/useAdminConfigLogic.ts
import { useState } from 'react';
import type { SystemConfigItem } from '@/api/adminApi';
import { updateSystemConfig } from '@/api/adminApi';
import { extractErrorMessage } from '@/utils/errorUtils';

interface UseAdminConfigLogicProps {
  configs: SystemConfigItem[];
  onRefresh: () => Promise<void>;
}

export const useAdminConfigLogic = ({ configs, onRefresh }: UseAdminConfigLogicProps) => {
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
      setMessage({
        text: `Parametro "${key}" aggiornato con successo a "${valueToSave}"!`,
        type: 'success',
      });
      setEditingKey(null);
      await onRefresh();
    } catch (err: unknown) {
      setMessage({
        text: extractErrorMessage(err, "Errore durante l'aggiornamento"),
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    maxDepthCfg,
    lookbackCfg,
    editingKey,
    editValue,
    setEditValue,
    editDesc,
    setEditDesc,
    saving,
    message,
    depthVal,
    setDepthVal,
    lookbackVal,
    setLookbackVal,
    startEdit,
    cancelEdit,
    handleSave,
  };
};
