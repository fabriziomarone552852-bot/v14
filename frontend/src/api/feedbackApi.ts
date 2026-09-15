// src/api/feedbackApi.ts
import { apiClient } from './client';
import type {
  FeedbackReport,
  FeedbackReportCreatePayload,
  FeedbackReportUpdatePayload,
  FeedbackFilterParams,
} from '@/types/feedback';

/**
 * Invia una nuova segnalazione di bug, problema grafico o suggerimento.
 */
export async function createFeedbackReport(
  payload: FeedbackReportCreatePayload
): Promise<FeedbackReport> {
  const response = await apiClient.post<FeedbackReport>('/feedback/reports', payload);
  return response.data;
}

/**
 * Recupera l'elenco di tutte le segnalazioni con filtri opzionali (Riservato SuperUser).
 */
export async function fetchFeedbackReports(
  params?: FeedbackFilterParams
): Promise<FeedbackReport[]> {
  const response = await apiClient.get<FeedbackReport[]>('/feedback/reports', {
    params: {
      status: params?.status || undefined,
      severity: params?.severity || undefined,
      type: params?.type || undefined,
      limit: params?.limit || 100,
      offset: params?.offset || 0,
    },
  });
  return response.data;
}

/**
 * Recupera le proprie segnalazioni inviate dall'utente autenticato.
 */
export async function fetchMyFeedbackReports(limit: number = 50): Promise<FeedbackReport[]> {
  const response = await apiClient.get<FeedbackReport[]>('/feedback/my-reports', {
    params: { limit },
  });
  return response.data;
}

/**
 * Recupera il dettaglio di una singola segnalazione.
 */
export async function getFeedbackReport(reportId: number): Promise<FeedbackReport> {
  const response = await apiClient.get<FeedbackReport>(`/feedback/reports/${reportId}`);
  return response.data;
}

/**
 * Aggiorna lo stato o le note amministrative di una segnalazione (Riservato SuperUser).
 */
export async function updateFeedbackReport(
  reportId: number,
  payload: FeedbackReportUpdatePayload
): Promise<FeedbackReport> {
  const response = await apiClient.patch<FeedbackReport>(
    `/feedback/reports/${reportId}`,
    payload
  );
  return response.data;
}

/**
 * Elimina definitivamente una segnalazione (Riservato SuperUser).
 */
export async function deleteFeedbackReport(reportId: number): Promise<void> {
  await apiClient.delete(`/feedback/reports/${reportId}`);
}
