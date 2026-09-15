// src/components/admin/feedback/useAdminFeedbackLogic.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchFeedbackReports,
  updateFeedbackReport,
  deleteFeedbackReport,
} from '@/api/feedbackApi';
import type { FeedbackReport, FeedbackStatus } from '@/types/feedback';

export function useAdminFeedbackLogic() {
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtri
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Report selezionato per modale dettaglio
  const [selectedReport, setSelectedReport] = useState<FeedbackReport | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFeedbackReports();
      setReports(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Errore nel caricamento delle segnalazioni';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Apri modale dettaglio
  const handleOpenDetail = useCallback((report: FeedbackReport) => {
    setSelectedReport(report);
    setUpdateSuccessMsg(null);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedReport(null);
    setUpdateSuccessMsg(null);
  }, []);

  // Salva modifiche stato / note
  const handleSaveReportChanges = useCallback(
    async (newStatus: FeedbackStatus, newAdminNotes: string) => {
      if (!selectedReport) return;
      setIsUpdating(true);
      setUpdateSuccessMsg(null);
      try {
        const updated = await updateFeedbackReport(selectedReport.id, {
          status: newStatus,
          admin_notes: newAdminNotes.trim() || null,
        });

        setSelectedReport(updated);
        setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        setUpdateSuccessMsg('Modifiche salvate con successo.');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Errore durante il salvataggio.';
        setError(msg);
      } finally {
        setIsUpdating(false);
      }
    },
    [selectedReport]
  );

  // Elimina report
  const handleDeleteReport = useCallback(async () => {
    if (!selectedReport) return;
    if (!window.confirm('Sei sicuro di voler eliminare definitivamente questa segnalazione?')) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteFeedbackReport(selectedReport.id);
      setReports((prev) => prev.filter((r) => r.id !== selectedReport.id));
      setSelectedReport(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Errore durante l'eliminazione.";
      setError(msg);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedReport]);

  // Statistiche conteggi
  const stats = useMemo(() => {
    const total = reports.length;
    const newCount = reports.filter((r) => r.status === 'new').length;
    const inProgressCount = reports.filter((r) => r.status === 'in_progress').length;
    const resolvedCount = reports.filter((r) => r.status === 'resolved').length;
    const criticalCount = reports.filter(
      (r) => r.severity === 'critical' && r.status !== 'resolved'
    ).length;
    return { total, newCount, inProgressCount, resolvedCount, criticalCount };
  }, [reports]);

  // Filtraggio lista
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
      if (typeFilter !== 'all' && r.report_type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = r.title.toLowerCase().includes(q);
        const inDesc = r.description.toLowerCase().includes(q);
        const inUser = r.user_username?.toLowerCase().includes(q) || false;
        const inPlatform = r.platform.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inUser && !inPlatform) return false;
      }
      return true;
    });
  }, [reports, statusFilter, severityFilter, typeFilter, searchQuery]);

  return {
    reports,
    filteredReports,
    loading,
    error,
    stats,
    statusFilter,
    setStatusFilter,
    severityFilter,
    setSeverityFilter,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    selectedReport,
    isUpdating,
    isDeleting,
    updateSuccessMsg,
    loadReports,
    handleOpenDetail,
    handleCloseDetail,
    handleSaveReportChanges,
    handleDeleteReport,
  };
}
