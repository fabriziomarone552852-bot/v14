// src/mobile/components/settings/MobileUserSettingsSection.tsx
import React from 'react';
import { Key, CheckCircle2, AlertCircle, Save, Loader2 } from 'lucide-react';
import MobileChangePasswordModal from '@/mobile/components/modals/MobileChangePasswordModal';
import type { SettingsNotification } from '@/mobile/hooks/useMobileSettingsLogic';

export interface MobileUserSettingsSectionProps {
  displayUsername: string;
  email: string;
  setEmail: (val: string) => void;
  loading: boolean;
  savingUser: boolean;
  notification: SettingsNotification | null;
  isPasswordModalOpen: boolean;
  setIsPasswordModalOpen: (val: boolean) => void;
  passwordLoading: boolean;
  onSaveEmail: () => void;
  onChangePasswordSubmit: (curr: string, newP: string, conf: string) => Promise<void>;
}

export const MobileUserSettingsSection: React.FC<MobileUserSettingsSectionProps> = ({
  displayUsername,
  email,
  setEmail,
  loading,
  savingUser,
  notification,
  isPasswordModalOpen,
  setIsPasswordModalOpen,
  passwordLoading,
  onSaveEmail,
  onChangePasswordSubmit,
}) => {
  return (
    <div className="w-full space-y-4 animate-fadeIn pb-12">
      <div className="border-b border-gray-200 pb-3">
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Impostazioni Utente</h1>
        <p className="text-xs text-gray-500 mt-0.5">Gestisci la tua email e le credenziali di accesso</p>
      </div>

      {/* Notifica Feedback */}
      {notification && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Card Dati Account */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-4">
        {/* Username (Sola Lettura) */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Nickname / Username
          </label>
          <div className="w-full py-2.5 px-3.5 bg-gray-50 border border-gray-200/80 rounded-xl text-sm font-bold text-gray-800">
            {displayUsername}
          </div>
        </div>

        {/* Email Modificabile */}
        <div>
          <label
            htmlFor="mobile-settings-email"
            className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
          >
            Indirizzo Email
          </label>
          <div className="flex gap-2">
            <input
              id="mobile-settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="esempio@dominio.it"
              disabled={loading || savingUser}
              className="flex-1 min-w-0 py-2.5 px-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={onSaveEmail}
              disabled={loading || savingUser}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {savingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Salva</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card Sicurezza Password */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Sicurezza & Password</h3>
              <p className="text-xs text-gray-500">Aggiorna la tua chiave di accesso</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="py-2 px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Modifica
          </button>
        </div>
      </div>

      {/* Modal Cambio Password Full Screen */}
      <MobileChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={onChangePasswordSubmit}
        loading={passwordLoading}
      />
    </div>
  );
};
