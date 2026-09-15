// src/mobile/components/settings/MobileChangelogSection.tsx
import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Calendar, Tag, ShieldCheck } from 'lucide-react';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import {
  CHANGELOG_HISTORY,
  APP_VERSION_NAME,
  APP_LAST_UPDATE,
  type ChangelogItem,
} from '@/data/changelogData';

export const MobileChangelogSection: React.FC = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <div className="w-full space-y-4 animate-fadeIn pb-12">
      {/* Header Sezione */}
      <div className="border-b border-gray-200 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Info & Changelog
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Note di rilascio, novità e storico versioni
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-blue-600 text-white font-extrabold text-xs shadow-xs shrink-0">
            {APP_VERSION_NAME}
          </span>
        </div>
      </div>

      {/* Banner Versione Corrente */}
      <div className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-base">
              🚀
            </div>
            <div>
              <div className="text-sm font-black">Smart Agenda {APP_VERSION_NAME}</div>
              <div className="text-[11px] text-blue-100 font-medium">
                Ultimo aggiornamento: {APP_LAST_UPDATE}
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md">
            <CheckCircle2 className="w-3 h-3" />
            Installata
          </span>
        </div>
      </div>

      {/* Card Invio Segnalazione / Feedback */}
      <button
        type="button"
        onClick={() => setIsFeedbackOpen(true)}
        className="w-full p-4 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-xs hover:bg-rose-100/70 active:bg-rose-100 transition-colors text-left flex items-center justify-between gap-3 cursor-pointer"
      >
        <div className="truncate">
          <div className="text-xs font-bold text-rose-700">Segnala un problema o feedback</div>
          <div className="text-[11px] text-rose-600/80 truncate mt-0.5">Hai trovato un bug o hai un'idea per la nuova versione?</div>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold text-xs shrink-0 shadow-2xs">
          Segnala
        </span>
      </button>

      {/* Lista Versioni Changelog */}
      <div className="space-y-3.5">
        {CHANGELOG_HISTORY.map((item: ChangelogItem, index: number) => {
          const isCurrent = index === 0;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 transition-all bg-white ${
                isCurrent
                  ? 'border-blue-300 ring-2 ring-blue-500/10 shadow-xs'
                  : 'border-gray-200 shadow-2xs'
              }`}
            >
              {/* Intestazione Versione */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    v{item.version}
                  </span>
                  <h2 className="text-sm font-bold text-gray-900 truncate">
                    {item.title}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.published === false ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      In sviluppo
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.date}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Highlights sintetici */}
              {item.highlights && item.highlights.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {item.highlights.map((highlight, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-gray-700 leading-relaxed font-medium"
                    >
                      <span className="text-blue-500 font-black shrink-0 mt-0.5">•</span>
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sezioni di Dettaglio */}
              <div className="mt-3.5 pt-3 border-t border-gray-100 space-y-3">
                {/* Nuove Funzionalità */}
                {item.features && item.features.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                      <span>Nuove Funzionalità</span>
                    </div>
                    <ul className="pl-1 space-y-1 text-xs text-gray-600">
                      {item.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-400 shrink-0 mt-0.5">-</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Miglioramenti */}
                {item.improvements && item.improvements.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <Tag className="w-3 h-3 text-emerald-600" />
                      <span>Miglioramenti</span>
                    </div>
                    <ul className="pl-1 space-y-1 text-xs text-gray-600">
                      {item.improvements.map((imp, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 shrink-0 mt-0.5">-</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bug Fix */}
                {item.fixes && item.fixes.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3 h-3 text-amber-600" />
                      <span>Bug Fix & Correzioni</span>
                    </div>
                    <ul className="pl-1 space-y-1 text-xs text-gray-600">
                      {item.fixes.map((fix, i) => (
                        <li key={i} className="flex items-start gap-1.5">
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

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
};

export default MobileChangelogSection;
