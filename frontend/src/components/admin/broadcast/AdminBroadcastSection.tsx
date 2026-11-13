// src/components/admin/broadcast/AdminBroadcastSection.tsx
import React from 'react';
import { useAdminBroadcastLogic } from './useAdminBroadcastLogic';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export const AdminBroadcastSection: React.FC = () => {
  const {
    broadcasts,
    activeBroadcast,
    isLoading,
    isSubmitting,
    isDeactivating,
    isDeleting,
    statusMessage,
    title,
    setTitle,
    messageText,
    setMessageText,
    level,
    setLevel,
    showPopup,
    setShowPopup,
    sendInbox,
    setSendInbox,
    handleApplyPreset,
    handleSubmit,
    handleDeactivate,
    handleDelete,
  } = useAdminBroadcastLogic();

  return (
    <div className="space-y-6">
      {/* Intestazione */}
      <div>
        <h3 className="text-base font-extrabold text-slate-900">📢 Avvisi di Sistema & Messaggistica Broadcast</h3>
        <p className="text-xs text-slate-500">
          Invia comunicazioni istantanee a tutti gli utenti per manutenzione straordinaria, cambio server o avvisi critici con pop-up modale e notifica Inbox.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`rounded-2xl p-4 text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* BOX 1: STATO LIVE AVVISO ATTIVO */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📡</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Stato Avviso Live</h4>
              <p className="text-xs text-slate-500">Cosa vedono attualmente gli utenti connessi all'app.</p>
            </div>
          </div>
          {activeBroadcast ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              IN TRASMISSIONE
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              Nessun avviso attivo
            </span>
          )}
        </div>

        {activeBroadcast ? (
          <div className={`p-4 rounded-2xl border ${
            activeBroadcast.level === 'CRITICAL'
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : activeBroadcast.level === 'WARNING'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-sky-50 border-sky-200 text-sky-950'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {activeBroadcast.level === 'CRITICAL' ? '🛑' : activeBroadcast.level === 'WARNING' ? '⚠️' : 'ℹ️'}
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wide">
                    {activeBroadcast.level} • {activeBroadcast.title}
                  </span>
                </div>
                <p className="text-xs text-slate-700 whitespace-pre-line pl-6">
                  {activeBroadcast.message}
                </p>
                <p className="text-[10px] text-slate-500 pl-6 pt-1">
                  Trasmesso il {format(new Date(activeBroadcast.created_at), "d MMMM yyyy HH:mm", { locale: it })}
                  {activeBroadcast.created_by_name && ` da @${activeBroadcast.created_by_name}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDeactivate(activeBroadcast.id)}
                disabled={isDeactivating}
                className="self-start sm:self-center px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                {isDeactivating ? 'Disattivazione...' : '🛑 Termina / Rimuovi Avviso'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 text-xs text-slate-500 text-center">
            Attualmente non è in onda alcun avviso broadcast. Puoi trasmetterne uno nuovo usando il modulo sottostante.
          </div>
        )}
      </div>

      {/* BOX 2: MODULO CREAZIONE NUOVO AVVISO */}
      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">✍️</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Componi Nuovo Avviso Broadcast</h4>
              <p className="text-xs text-slate-500">Imposta testo, livello di emergenza e canali di diffusione.</p>
            </div>
          </div>

          {/* Pulsanti Rapidi Modello / Template */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400">Modelli rapidi:</span>
            <button
              type="button"
              onClick={() => handleApplyPreset('migration')}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition cursor-pointer"
            >
              🔄 Cambio Server
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('maintenance20')}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition cursor-pointer"
            >
              🛠️ Manutenzione (20m)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('restart5')}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 transition cursor-pointer"
            >
              ⚡ Riavvio Rapido (5m)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Titolo */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-700">Titolo dell'Avviso</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="es. Sospensione programmata per passaggio nuovo server"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          {/* Livello di Emergenza */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Livello Urgenza</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setLevel('INFO')}
                className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  level === 'INFO' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ℹ️ Info
              </button>
              <button
                type="button"
                onClick={() => setLevel('WARNING')}
                className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  level === 'WARNING' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚠️ Allerta
              </button>
              <button
                type="button"
                onClick={() => setLevel('CRITICAL')}
                className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  level === 'CRITICAL' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🛑 Critico
              </button>
            </div>
          </div>
        </div>

        {/* Messaggio dettagliato */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Testo del Messaggio</label>
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={4}
            placeholder="Descrivi dettagliatamente l'intervento, la durata prevista o l'orario di sospensione..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 custom-scrollbar"
            required
          />
        </div>

        {/* Opzioni di diffusione */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex flex-wrap items-center gap-6">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPopup}
                onChange={(e) => setShowPopup(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800">
                🪟 Mostra Pop-up immediato a tutto schermo
              </span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sendInbox}
                onChange={(e) => setSendInbox(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800">
                📬 Invia Notifica permanente nell'Inbox di tutti gli utenti
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? 'Trasmissione in corso...' : '📢 Trasmetti Avviso a Tutti'}
          </button>
        </div>
      </form>

      {/* BOX 3: STORICO DEGLI AVVISI */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📜</span>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Storico Avvisi Trasmessi</h4>
              <p className="text-xs text-slate-500">Registro di tutte le comunicazioni broadcast inviate nel tempo.</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-semibold">{broadcasts.length} totali</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium">Caricamento archivio avvisi...</div>
        ) : broadcasts.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-100">
            Nessun avviso broadcast archiviato nello storico.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
            {broadcasts.map((b) => (
              <div key={b.id} className="p-4 flex items-start justify-between gap-4 bg-white hover:bg-slate-50 transition">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                      b.level === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : b.level === 'WARNING'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-sky-50 text-sky-700 border-sky-200'
                    }`}>
                      {b.level}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 truncate">{b.title}</h5>
                    {b.is_active && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        ATTIVO ORA
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{b.message}</p>
                  <p className="text-[10px] text-slate-400">
                    Trasmesso il {format(new Date(b.created_at), "d MMMM yyyy HH:mm", { locale: it })}
                    {b.created_by_name && ` da @${b.created_by_name}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {b.is_active && (
                    <button
                      type="button"
                      onClick={() => handleDeactivate(b.id)}
                      disabled={isDeactivating}
                      className="px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition cursor-pointer"
                    >
                      Disattiva
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id)}
                    disabled={isDeleting}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Elimina dallo storico"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
