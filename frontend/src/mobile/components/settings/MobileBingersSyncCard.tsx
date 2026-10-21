// src/mobile/components/settings/MobileBingersSyncCard.tsx
import React, { useRef } from 'react';
import { Tv, Upload, Download, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useBingersSync } from '@/hooks/useBingersSync';

export const MobileBingersSyncCard: React.FC = () => {
  const {
    importing,
    exporting,
    message,
    report,
    handleImport,
    handleExport,
  } = useBingersSync();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImport(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileInputChange}
        accept=".zip,.csv"
        multiple
        className="hidden"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Bingers & Trackers</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                <Sparkles className="w-2.5 h-2.5 text-purple-600" /> Sincronizzazione Dati
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed">
        Importa l'archivio ZIP o i file CSV esportati da Bingers per sincronizzare serie, diario puntate viste, voti e liste, oppure scarica il backup.
      </p>

      {/* Pulsanti Azione Touch */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing || exporting}
          className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          {importing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Importando...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              <span>Importa ZIP/CSV</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleExport}
          disabled={importing || exporting}
          className="py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          {exporting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Esportando...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-gray-600" />
              <span>Esporta Dati</span>
            </>
          )}
        </button>
      </div>

      {/* Messaggio Notifica */}
      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
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

      {/* Report Sincronizzazione */}
      {report && report.success && (
        <div className="pt-3 border-t border-gray-100 space-y-2 animate-fadeIn">
          <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Riepilogo Dati Importati</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center">
              <div className="text-base font-extrabold text-purple-700">{report.series_imported}</div>
              <div className="text-[10px] font-semibold text-gray-500">Serie Aggiunte</div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center">
              <div className="text-base font-extrabold text-blue-700">{report.episodes_logged}</div>
              <div className="text-[10px] font-semibold text-gray-500">Puntate nel Diario</div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center">
              <div className="text-base font-extrabold text-amber-600">{report.ratings_imported}</div>
              <div className="text-[10px] font-semibold text-gray-500">Voti & Stelle</div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-center">
              <div className="text-base font-extrabold text-emerald-700">{report.lists_created}</div>
              <div className="text-[10px] font-semibold text-gray-500">Liste Personali</div>
            </div>
          </div>

          {report.movies_skipped > 0 && (
            <div className="text-[10px] text-gray-500 italic bg-amber-50/60 border border-amber-200/50 rounded-lg px-2.5 py-1.5">
              Nota: {report.movies_skipped} film rilevati nel file sono stati ignorati in attesa dell'attivazione della sezione Film.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
