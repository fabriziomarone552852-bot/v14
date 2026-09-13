// src/mobile/components/settings/MobileSyncSettingsSection.tsx
import React from 'react';
import { Calendar, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { useGoogleCalendarIntegration } from '@/hooks/useGoogleCalendarIntegration';

export interface MobileSyncSettingsSectionProps {
  googleSync: ReturnType<typeof useGoogleCalendarIntegration>;
}

export const MobileSyncSettingsSection: React.FC<MobileSyncSettingsSectionProps> = ({ googleSync }) => {
  return (
    <div className="w-full space-y-4 animate-fadeIn pb-12">
      <div className="border-b border-gray-200 pb-3">
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Sincronizzazione</h1>
        <p className="text-xs text-gray-500 mt-0.5">Collega e sincronizza i tuoi calendari esterni</p>
      </div>

      {/* Notifica Google Sync */}
      {googleSync.message && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
            googleSync.message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {googleSync.message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{googleSync.message.text}</span>
        </div>
      )}

      {/* Card Google Calendar */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Google Calendar</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {googleSync.status?.is_connected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Connesso
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                    Non collegato
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pulsante Connetti / Scollega */}
          {googleSync.status?.is_connected ? (
            <button
              type="button"
              onClick={googleSync.handleDisconnect}
              disabled={googleSync.disconnecting}
              className="py-1.5 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-colors shrink-0 cursor-pointer"
            >
              {googleSync.disconnecting ? 'Disconnessione...' : 'Scollega'}
            </button>
          ) : (
            <button
              type="button"
              onClick={googleSync.handleConnect}
              disabled={googleSync.connecting}
              className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1"
            >
              {googleSync.connecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Connetti</span>
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          Sincronizza in tempo reale tutti gli eventi e appuntamenti della tua Smart Agenda sul tuo calendario Google personale.
        </p>

        {googleSync.status?.is_connected && googleSync.status.google_email && (
          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs font-semibold text-blue-900">
            Account collegato: <span className="font-bold">{googleSync.status.google_email}</span>
          </div>
        )}

        {/* Opzioni avanzate se connesso */}
        {googleSync.status?.is_connected && (
          <div className="pt-3 border-t border-gray-100 space-y-3">
            {/* Toggle sincronizzazione automatica */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-gray-800">Sincronizzazione automatica</div>
                <div className="text-[11px] text-gray-500">Invia nuovi eventi in tempo reale</div>
              </div>
              <button
                type="button"
                onClick={googleSync.handleToggleSync}
                disabled={googleSync.toggling}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  googleSync.status.sync_enabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    googleSync.status.sync_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sincronizzazione massiva */}
            <div className="pt-2">
              <button
                type="button"
                onClick={googleSync.handleSyncAll}
                disabled={googleSync.syncingAll}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {googleSync.syncingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sincronizzazione in corso...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Sincronizza tutti gli eventi esistenti</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
