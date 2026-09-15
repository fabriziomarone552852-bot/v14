// src/components/admin/feedback/AdminFeedbackDetailModal.tsx
import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Trash2,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import { resolveImageUrl } from '@/utils/imageUtils';
import type { FeedbackReport, FeedbackStatus } from '@/types/feedback';
import { TYPE_ICONS } from './feedbackConfig';

export interface AdminFeedbackDetailModalProps {
  report: FeedbackReport | null;
  onClose: () => void;
  onSave: (status: FeedbackStatus, adminNotes: string) => Promise<void>;
  onDelete: () => Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
  updateSuccessMsg: string | null;
}

export const AdminFeedbackDetailModal: React.FC<AdminFeedbackDetailModalProps> = ({
  report,
  onClose,
  onSave,
  onDelete,
  isUpdating,
  isDeleting,
  updateSuccessMsg,
}) => {
  const [modalStatus, setModalStatus] = useState<FeedbackStatus>(report?.status || 'new');
  const [modalAdminNotes, setModalAdminNotes] = useState(report?.admin_notes || '');
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  // Aggiorna lo stato locale quando cambia il report
  React.useEffect(() => {
    if (report) {
      setModalStatus(report.status);
      setModalAdminNotes(report.admin_notes || '');
      setIsImageZoomed(false);
    }
  }, [report]);

  if (!report) return null;

  return (
    <>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 animate-fadeIn select-none">
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        <div
          className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden z-10 transition-all text-slate-800"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header Modale */}
          <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-lg shrink-0">
                {TYPE_ICONS[report.report_type]}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-white/20 text-white">
                    #{report.id}
                  </span>
                  <h3 className="text-base font-black text-white truncate">
                    {report.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                  Da {report.user_username || 'Utente'} ({report.user_email || 'N/D'}) •{' '}
                  {new Date(report.created_at).toLocaleString('it-IT')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Corpo Modale Scrollabile */}
          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0 space-y-5 bg-slate-50/50">
            {updateSuccessMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>{updateSuccessMsg}</span>
              </div>
            )}

            {/* Informazioni Metadati */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Tipologia</div>
                <div className="text-xs font-bold text-slate-800 capitalize mt-0.5">
                  {report.report_type}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Gravità</div>
                <div className="text-xs font-bold text-slate-800 capitalize mt-0.5">
                  {report.severity}
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Piattaforma</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">
                  {report.platform} (v{report.app_version})
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Route URL</div>
                <div className="text-xs font-bold text-slate-800 truncate mt-0.5">
                  {report.current_route}
                </div>
              </div>
            </div>

            {/* Descrizione */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Descrizione dell'Utente
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                {report.description}
              </p>
            </div>

            {/* Passaggi per riprodurre */}
            {report.steps_to_reproduce && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Passaggi per Riprodurre
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                  {report.steps_to_reproduce}
                </p>
              </div>
            )}

            {/* Screenshot Allegato */}
            {report.screenshot_url && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Screenshot Allegato
                  </div>
                  <a
                    href={resolveImageUrl(report.screenshot_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    <span>Apri originale</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative border border-slate-200 rounded-xl overflow-hidden max-h-64 bg-slate-900/5 flex items-center justify-center">
                  <img
                    src={resolveImageUrl(report.screenshot_url)}
                    alt="Screenshot segnalazione"
                    className="max-h-64 object-contain rounded-xl cursor-zoom-in"
                    onClick={() => setIsImageZoomed(true)}
                  />
                </div>
              </div>
            )}

            {/* Contesto Tecnico / Telemetria JSON */}
            {report.error_context && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span>Contesto Tecnico & Telemetria JSON</span>
                </div>
                <pre className="text-[11px] font-mono bg-slate-900 text-slate-200 p-3 rounded-xl overflow-x-auto max-h-48 custom-scrollbar">
                  {report.error_context}
                </pre>
              </div>
            )}

            {/* 5. Sezione Gestione Amministrativa */}
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/80 space-y-3">
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Gestione Stato & Note Interne Admin
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Stato Segnalazione
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as FeedbackStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="new">🔵 Nuovo (Da valutare)</option>
                    <option value="in_progress">🟡 In Lavorazione</option>
                    <option value="resolved">🟢 Risolto</option>
                    <option value="dismissed">⚪ Archiviato / Non rilevante</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Risolto il
                  </label>
                  <div className="text-xs font-medium text-slate-600 py-2">
                    {report.resolved_at
                      ? new Date(report.resolved_at).toLocaleString('it-IT')
                      : 'Non ancora risolto'}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Note Interne Amministratore
                </label>
                <textarea
                  rows={2}
                  value={modalAdminNotes}
                  onChange={(e) => setModalAdminNotes(e.target.value)}
                  placeholder="Scrivi eventuali note tecniche, causa radice o commit di risoluzione..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Modale */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting || isUpdating}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs transition cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Eliminazione...' : 'Elimina'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Chiudi
              </button>
              <button
                type="button"
                onClick={() => onSave(modalStatus, modalAdminNotes)}
                disabled={isUpdating}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Zoom Screenshot Fullscreen */}
      {isImageZoomed && report.screenshot_url && (
        <div
          className="fixed inset-0 z-[130] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsImageZoomed(false)}
        >
          <img
            src={resolveImageUrl(report.screenshot_url)}
            alt="Screenshot ingrandito"
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
};

export default AdminFeedbackDetailModal;
