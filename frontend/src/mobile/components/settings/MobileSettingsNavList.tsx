import React, { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  User,
  Sliders,
  RefreshCw,
  Archive,
  Info,
  Monitor,
  LogOut,
  ChevronRight,
  Wrench,
} from 'lucide-react';
import { APP_VERSION_NAME } from '@/data/changelogData';
import { FeedbackModal } from '@/components/modals/FeedbackModal';

interface MobileSettingsNavListProps {
  onNavigate: (path: string) => void;
  isGoogleConnected?: boolean;
  onTriggerLogout: () => void;
}

export const MobileSettingsNavList: React.FC<MobileSettingsNavListProps> = ({
  onNavigate,
  isGoogleConnected = false,
  onTriggerLogout,
}) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
      <div className="w-full bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 shadow-xs overflow-hidden">
        {/* Voce 1: Impostazioni Utente (Email & Password) */}
        <button
          type="button"
          onClick={() => onNavigate('/settings/user')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0 pr-2">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Impostazioni utente
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">
                Email e credenziali d'accesso password
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 shrink-0" />
        </button>

        {/* Voce 2: Impostazioni App (Livello albero task) */}
        <button
          type="button"
          onClick={() => onNavigate('/settings/app')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0 pr-2">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                Impostazioni app
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">
                Livello albero task e preferenze
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 shrink-0" />
        </button>

        {/* Voce 3: Sincronizzazione (Google Calendar) */}
        <button
          type="button"
          onClick={() => onNavigate('/settings/sync')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0 pr-2">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                <span>Sincronizzazione</span>
                {isGoogleConnected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Google Calendar Connesso" />
                )}
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">
                Collegamento a Google Calendar
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 shrink-0" />
        </button>

        {/* Voce 4: Archivio */}
        <button
          type="button"
          onClick={() => onNavigate('/settings/archive')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0 pr-2">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <Archive className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                Archivio
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">
                Task, eventi, note, categorie e altri archivi
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 shrink-0" />
        </button>

        {/* Voce 5: Info & Changelog */}
        <button
          type="button"
          onClick={() => onNavigate('/settings/changelog')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0 pr-2">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                <span>Info & Changelog</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700">
                  {APP_VERSION_NAME}
                </span>
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">
                Note di rilascio, novità e versione
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 shrink-0" />
        </button>

        {/* Voce 6: Feedback & Segnalazione Errore */}
        <button
          type="button"
          onClick={() => setIsFeedbackOpen(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0 pr-2">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Segnala errore o feedback
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">
                Invia una segnalazione o suggerimento
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 shrink-0" />
        </button>

        {/* Passa a Vista Desktop PC (visibile solo su browser Desktop) */}
        {!Capacitor.isNativePlatform() && (
          <button
            type="button"
            onClick={() => {
              localStorage.setItem('smartagenda_view_mode', 'desktop');
              window.location.href = '/?mode=desktop';
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-blue-50/50 active:bg-blue-50 transition-colors text-left group cursor-pointer border-t border-gray-100"
          >
            <div className="flex items-center gap-3.5 min-w-0 pr-2">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Passa a Vista Desktop (PC)
                </div>
                <div className="text-xs text-gray-500 truncate mt-0.5">
                  Visualizza l'interfaccia completa per computer
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 shrink-0" />
          </button>
        )}

        {/* Voce 7: Esci dal profilo */}
        <button
          type="button"
          onClick={onTriggerLogout}
          className="w-full flex items-center justify-between p-4 hover:bg-rose-50/50 active:bg-rose-50 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0 pr-2">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-rose-600">
                Esci dal profilo
              </div>
              <div className="text-xs text-rose-400 truncate mt-0.5">
                Disconnetti il tuo account da questo dispositivo
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-rose-300 group-hover:text-rose-600 shrink-0" />
        </button>
      </div>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </>
  );
};

export default MobileSettingsNavList;
