// src/hooks/useBingersSync.ts
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export interface BingersImportReport {
  success: boolean;
  series_imported: number;
  episodes_logged: number;
  ratings_imported: number;
  lists_created: number;
  movies_skipped: number;
  warnings: string[];
  errors: string[];
}

export interface SyncMessage {
  type: 'success' | 'error';
  text: string;
}

export const useBingersSync = () => {
  const queryClient = useQueryClient();
  const [importing, setImporting] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [message, setMessage] = useState<SyncMessage | null>(null);
  const [report, setReport] = useState<BingersImportReport | null>(null);

  const handleImport = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) {
      setMessage({ type: 'error', text: 'Seleziona almeno un file ZIP o file CSV da importare.' });
      return;
    }

    try {
      setImporting(true);
      setMessage(null);
      setReport(null);

      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await apiClient.post<BingersImportReport>(
        '/trackers/sync/bingers/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const data = response.data;
      setReport(data);

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Sincronizzazione completata con successo! ${data.series_imported} serie, ${data.episodes_logged} visioni e ${data.lists_created} liste importate.`,
        });
        // Invalida cache per aggiornare istantaneamente tutte le viste serie TV
        queryClient.invalidateQueries({ queryKey: ['trackers'] });
      } else {
        setMessage({
          type: 'error',
          text: data.errors.join(' | ') || "Si è verificato un errore durante l'importazione.",
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Errore imprevisto durante il caricamento dei file.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setMessage(null);

      const res = await apiClient.get('/trackers/sync/bingers/export', {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      link.setAttribute('download', `vita_trackers_export_${today}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage({
        type: 'success',
        text: 'Archivio ZIP dei trackers esportato e scaricato correttamente!',
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Errore durante l'esportazione dei dati.";
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setExporting(false);
    }
  };

  const clearMessage = () => setMessage(null);
  const clearReport = () => setReport(null);

  return {
    importing,
    exporting,
    message,
    report,
    handleImport,
    handleExport,
    clearMessage,
    clearReport,
  };
};
