// src/components/admin/codes/useAdminCodesLogic.ts
import { useMemo, useState } from 'react';
import type { SystemConfigCodeItem } from '@/api/adminApi';
import { createSystemCode, deactivateSystemCode, updateSystemCode } from '@/api/adminApi';
import { extractErrorMessage } from '@/utils/errorUtils';

interface UseAdminCodesLogicProps {
  codes: SystemConfigCodeItem[];
  onRefresh: () => Promise<void>;
}

export const useAdminCodesLogic = ({ codes, onRefresh }: UseAdminCodesLogicProps) => {
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
        description: form.notes.trim() || undefined,
        sort_order: Number(form.sort_order) || 0,
        active: true,
      });

      setMessage({ text: 'Nuovo ConfigCode creato con successo!', type: 'success' });
      setIsModalOpen(false);
      setForm({ code_type: '', code_value: '', code_name: '', display_name: '', sort_order: '0', notes: '' });
      await onRefresh();
    } catch (err: unknown) {
      setMessage({ text: extractErrorMessage(err, 'Errore nella creazione'), type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (code: SystemConfigCodeItem) => {
    try {
      const isCurrentlyActive = code.active ?? code.is_active ?? true;
      if (isCurrentlyActive) {
        await deactivateSystemCode(code.id);
      } else {
        await updateSystemCode(code.id, { active: true });
      }
      await onRefresh();
    } catch (err: unknown) {
      alert(extractErrorMessage(err, "Errore nell'aggiornamento stato"));
    }
  };

  return {
    selectedType,
    setSelectedType,
    search,
    setSearch,
    isModalOpen,
    setIsModalOpen,
    codeTypes,
    filteredCodes,
    form,
    setForm,
    submitting,
    message,
    handleCreate,
    handleToggleActive,
  };
};
