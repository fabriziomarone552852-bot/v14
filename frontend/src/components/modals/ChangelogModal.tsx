// src/components/modals/ChangelogModal.tsx
import React, { useEffect } from 'react';
import { CloseIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';
import {
  CHANGELOG_HISTORY,
  APP_VERSION_NAME,
  APP_LAST_UPDATE,
  type ChangelogItem,
} from '@/data/changelogData';

export interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 animate-fadeIn select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden z-10 transition-all"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="changelog-modal-title"
      >
        {/* Header Modale */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-xl shadow-inner border border-white/20 shrink-0">
              📅
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 id="changelog-modal-title" className="text-lg font-black tracking-wide truncate">
                  Smart Agenda
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-xs shadow-2xs backdrop-blur-md">
                  {APP_VERSION_NAME}
                </span>
              </div>
              <p className="text-xs text-blue-100/90 font-medium truncate mt-0.5">
                Note di Rilascio & Cronologia Aggiornamenti • {APP_LAST_UPDATE}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 ml-2"
            title="Chiudi finestra"
            aria-label="Chiudi finestra"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo Scrollabile del Changelog */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 min-h-0 bg-slate-50/50">
          {CHANGELOG_HISTORY.map((item: ChangelogItem, index: number) => {
            const isCurrent = index === 0;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                  isCurrent
                    ? 'bg-white border-blue-200 shadow-md ring-2 ring-blue-500/10'
                    : 'bg-white/80 border-slate-200/80 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Intestazione Versione */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`text-sm font-black px-2.5 py-0.5 rounded-xl ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      v{item.version}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 truncate">
                      {item.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.published === false ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        In sviluppo
                      </span>
                    ) : isCurrent ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                        <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                        Pubblicata
                      </span>
                    ) : null}
                    <span className="text-xs font-semibold text-slate-400">
                      {item.date}
                    </span>
                  </div>
                </div>

                {/* Highlights sintetici */}
                {item.highlights && item.highlights.length > 0 && (
                  <div className="mt-3.5 space-y-1.5">
                    {item.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed font-medium">
                        <span className="text-blue-500 font-bold mt-0.5 shrink-0">•</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sezioni Categorizzate */}
                <div className="mt-4 pt-3 border-t border-slate-100/80 space-y-3">
                  {/* Nuove Funzionalità */}
                  {item.features && item.features.length > 0 && (
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        <span>🚀</span>
                        <span>Nuove Funzionalità</span>
                      </div>
                      <ul className="pl-2 space-y-1 text-xs text-slate-600">
                        {item.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-blue-400 shrink-0 mt-0.5">-</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Miglioramenti */}
                  {item.improvements && item.improvements.length > 0 && (
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <span>✨</span>
                        <span>Miglioramenti</span>
                      </div>
                      <ul className="pl-2 space-y-1 text-xs text-slate-600">
                        {item.improvements.map((imp, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 shrink-0 mt-0.5">-</span>
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bug Fixes */}
                  {item.fixes && item.fixes.length > 0 && (
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                        <span>🛠️</span>
                        <span>Bug Fix</span>
                      </div>
                      <ul className="pl-2 space-y-1 text-xs text-slate-600">
                        {item.fixes.map((fix, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-400 shrink-0 mt-0.5">-</span>
                            <span>{fix}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Modale */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 font-medium">
            Smart Agenda • {APP_VERSION_NAME}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer active:scale-95"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangelogModal;
