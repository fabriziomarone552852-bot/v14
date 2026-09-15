// src/components/admin/feedback/AdminFeedbackTable.tsx
import React from 'react';
import { User, Smartphone, Monitor } from 'lucide-react';
import type { FeedbackReport } from '@/types/feedback';
import { STATUS_CONFIG, SEVERITY_CONFIG, TYPE_ICONS } from './feedbackConfig';

export interface AdminFeedbackTableProps {
  reports: FeedbackReport[];
  onSelectReport: (report: FeedbackReport) => void;
}

export const AdminFeedbackTable: React.FC<AdminFeedbackTableProps> = ({
  reports,
  onSelectReport,
}) => {
  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-12 text-center text-slate-400 space-y-2 select-none">
        <div className="text-3xl">📭</div>
        <div className="text-xs font-bold">Nessuna segnalazione trovata con i filtri selezionati</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden select-none">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Stato</th>
              <th className="py-3 px-4">Gravità</th>
              <th className="py-3 px-4">Tipo</th>
              <th className="py-3 px-4">Titolo & Descrizione</th>
              <th className="py-3 px-4">Utente</th>
              <th className="py-3 px-4">Piattaforma</th>
              <th className="py-3 px-4">Data</th>
              <th className="py-3 px-4 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {reports.map((report) => {
              const statusInfo = STATUS_CONFIG[report.status] || STATUS_CONFIG.new;
              const severityInfo = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.medium;
              const formattedDate = new Date(report.created_at).toLocaleDateString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <tr
                  key={report.id}
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                  onClick={() => onSelectReport(report)}
                >
                  {/* Stato */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border ${statusInfo.badgeClass}`}
                    >
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </span>
                  </td>

                  {/* Gravità */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${severityInfo.badgeClass}`}
                    >
                      {severityInfo.label}
                    </span>
                  </td>

                  {/* Tipo */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      {TYPE_ICONS[report.report_type]}
                      <span className="capitalize">{report.report_type}</span>
                    </div>
                  </td>

                  {/* Titolo & Descrizione */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 truncate">{report.title}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {report.description}
                    </div>
                  </td>

                  {/* Utente */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{report.user_username || `ID ${report.user_id}`}</span>
                    </div>
                  </td>

                  {/* Piattaforma */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      {report.platform.includes('android') || report.platform.includes('mobile') ? (
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <Monitor className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>v{report.app_version}</span>
                    </div>
                  </td>

                  {/* Data */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-medium">
                    {formattedDate}
                  </td>

                  {/* Azioni */}
                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectReport(report);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs transition cursor-pointer"
                    >
                      Dettaglio
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFeedbackTable;
