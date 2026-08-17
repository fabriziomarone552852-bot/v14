// src/components/settings/ProfileSection.tsx
import React, { useState } from 'react';
import type { UserServerSettings } from '@/types/settings';
import ChangePasswordModal from './ChangePasswordModal';

interface ProfileSectionProps {
  settings: UserServerSettings;
  email: string;
  onEmailChange: (value: string) => void;
  onChangePasswordSubmit: (currentPassword: string, newPassword: string, confirmNewPassword: string) => Promise<void>;
  disabled?: boolean;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  settings,
  email,
  onEmailChange,
  onChangePasswordSubmit,
  disabled = false,
}) => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordSubmit = async (currentPw: string, newPw: string, confirmPw: string) => {
    setPasswordLoading(true);
    try {
      await onChangePasswordSubmit(currentPw, newPw, confirmPw);
      setIsPasswordModalOpen(false);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Profilo Utente</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          Gestisci i dati identificativi del tuo account e le credenziali di accesso.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nickname / Username */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Nickname
          </span>
          <p className="text-base font-bold text-slate-800 tracking-wide">
            {settings.username}
          </p>
          <p className="text-[11px] text-slate-400">
            Il nome utente principale associato al tuo profilo.
          </p>
        </div>

        {/* Pulsante Cambio Password */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 flex flex-col justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sicurezza Accesso
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggiorna la tua password per proteggere l&apos;accesso ai dati.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              disabled={disabled}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm rounded-xl transition focus:outline-none"
            >
              <span>🔒</span>
              <span>Cambia Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modifica Email */}
      <div className="space-y-1.5 pt-2">
        <label htmlFor="settings-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Indirizzo Email
        </label>
        <input
          id="settings-email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          disabled={disabled}
          autoComplete="email"
          placeholder="esempio@dominio.it"
          className="w-full max-w-lg px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder-slate-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
        />
        <p className="text-xs text-slate-500">
          Indirizzo email per le notifiche e il recupero credenziali.
        </p>
      </div>

      {/* Modal Cambio Password */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordSubmit}
        loading={passwordLoading}
      />
    </div>
  );
};

export default ProfileSection;
