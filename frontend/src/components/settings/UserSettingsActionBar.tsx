// src/components/settings/UserSettingsActionBar.tsx
import React from 'react';
import { LoadingIcon } from '@/components/shared/utils/Icons';

interface UserSettingsActionBarProps {
  hasChanges: boolean;
  saving: boolean;
  onReset: () => void;
  onSubmit: () => void;
}

export const UserSettingsActionBar: React.FC<UserSettingsActionBarProps> = ({
  hasChanges,
  saving,
  onReset,
  onSubmit,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur border-t border-slate-200/80 p-4 shadow-lg flex items-center justify-end gap-3 px-6 sm:px-12">
      <button
        type="button"
        onClick={onReset}
        disabled={!hasChanges || saving}
        className="w-40 py-2.5 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-center transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Reimposta
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={!hasChanges || saving}
        className="w-40 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white text-center transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {saving && <LoadingIcon className="w-3.5 h-3.5 animate-spin" />}
        {saving ? 'Salvataggio...' : 'Salva'}
      </button>
    </div>
  );
};
