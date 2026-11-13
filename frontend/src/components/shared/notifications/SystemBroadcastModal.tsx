// src/components/shared/notifications/SystemBroadcastModal.tsx
import React, { useEffect } from 'react';
import { useSystemBroadcast } from '@/hooks/useSystemBroadcast';
import { useBackHandler } from '@/utils/backButtonManager';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export const SystemBroadcastModal: React.FC = () => {
  const { activeBroadcast, shouldShowPopup, dismiss } = useSystemBroadcast();

  // Gestione tasto indietro su Android
  useBackHandler(shouldShowPopup, dismiss, 10);

  // Chiusura con tasto Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && shouldShowPopup) {
        dismiss();
      }
    };
    if (shouldShowPopup) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [shouldShowPopup, dismiss]);

  if (!shouldShowPopup || !activeBroadcast) {
    return null;
  }

  const isCritical = activeBroadcast.level === 'CRITICAL';
  const isWarning = activeBroadcast.level === 'WARNING';

  let headerBg = 'bg-sky-50 border-sky-100 text-sky-900';
  let badgeBg = 'bg-sky-100 text-sky-800 border-sky-200';
  let icon = '📢';
  let badgeLabel = 'Avviso di Sistema';
  let buttonBg = 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500';

  if (isCritical) {
    headerBg = 'bg-rose-50 border-rose-100 text-rose-900';
    badgeBg = 'bg-rose-100 text-rose-800 border-rose-200';
    icon = '🛑';
    badgeLabel = 'Interruzione Imminente';
    buttonBg = 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500';
  } else if (isWarning) {
    headerBg = 'bg-amber-50 border-amber-100 text-amber-900';
    badgeBg = 'bg-amber-100 text-amber-800 border-amber-200';
    icon = '⚠️';
    badgeLabel = 'Manutenzione Programmata';
    buttonBg = 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';
  }

  let formattedDate = '';
  try {
    formattedDate = format(new Date(activeBroadcast.created_at), "d MMMM yyyy 'alle' HH:mm", { locale: it });
  } catch {
    formattedDate = activeBroadcast.created_at;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 animate-scaleUp">
        {/* Intestazione tematica */}
        <div className={`p-5 border-b ${headerBg} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="Icona avviso">
              {icon}
            </span>
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${badgeBg}`}>
                {badgeLabel}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Inviato il {formattedDate}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Chiudi avviso"
            className="rounded-full p-2 text-slate-400 hover:bg-black/5 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Corpo del messaggio */}
        <div className="p-6 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 leading-snug">
            {activeBroadcast.title}
          </h3>

          <div className="max-h-60 overflow-y-auto pr-1 text-sm text-slate-700 leading-relaxed whitespace-pre-line custom-scrollbar">
            {activeBroadcast.message}
          </div>

          {activeBroadcast.created_by_name && (
            <p className="text-xs text-slate-400 font-medium pt-2 border-t border-slate-100">
              Comunicazione firmata da: <span className="font-semibold text-slate-600">@{activeBroadcast.created_by_name}</span>
            </p>
          )}
        </div>

        {/* Azione di conferma */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={dismiss}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-2xl text-xs font-bold text-white shadow-xs transition focus:outline-hidden focus:ring-2 focus:ring-offset-2 cursor-pointer ${buttonBg}`}
          >
            ✓ Ho capito, chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
