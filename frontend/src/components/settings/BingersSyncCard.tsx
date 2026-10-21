// src/components/settings/BingersSyncCard.tsx
import React, { useRef, useState } from 'react';
import { Tv, Upload, Download, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useBingersSync } from '@/hooks/useBingersSync';

export const BingersSyncCard: React.FC = () => {
  const {
    importing,
    exporting,
    message,
    report,
    handleImport,
    handleExport,
  } = useBingersSync();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImport(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImport(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-3xl border transition-all duration-200 bg-white p-6 shadow-sm ${
        isDragging
          ? 'border-purple-500 bg-purple-50/40 ring-4 ring-purple-100'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileInputChange}
        accept=".zip,.csv"
        multiple
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shrink-0 border border-purple-100">
            <Tv className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Bingers & Portabilità Trackers</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">
                <Sparkles className="w-3 h-3 text-purple-600" />
                Interoperabilità
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-xl">
              Importa la tua libreria da Bingers (file .zip o singoli CSV) sincronizzando serie, puntate viste nel Diario, voti e liste personali. Puoi anche esportare l'intero archivio per portabilità o backup.
            </p>
          </div>
        </div>

        {/* Pulsanti Azione */}
        <div className="shrink-0 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing || exporting}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-40"
          >
            {importing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Importazione...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Importa ZIP / CSV</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={importing || exporting}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-40"
          >
            {exporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Esportazione...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Esporta Dati (ZIP)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Messaggio di stato */}
      {message && (
        <div
          className={`mt-4 rounded-2xl p-4 text-xs font-medium flex items-center gap-2.5 animate-fadeIn ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Resoconto Dettagliato Report */}
      {report && report.success && (
        <div className="mt-5 pt-5 border-t border-slate-100 animate-fadeIn">
          <div className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Riepilogo Sincronizzazione Dati</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <div className="text-lg font-extrabold text-purple-700">{report.series_imported}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Serie TV Aggiunte</div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <div className="text-lg font-extrabold text-blue-700">{report.episodes_logged}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Puntate nel Diario</div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <div className="text-lg font-extrabold text-amber-600">{report.ratings_imported}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Valutazioni & Voti</div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center">
              <div className="text-lg font-extrabold text-emerald-700">{report.lists_created}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Liste Personali</div>
            </div>
          </div>

          {report.movies_skipped > 0 && (
            <div className="mt-3 text-[11px] text-slate-500 italic bg-amber-50/60 border border-amber-200/50 rounded-xl px-3 py-2">
              Nota: {report.movies_skipped} film rilevati nel file sono stati ignorati in attesa dell'attivazione della sezione Film.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
