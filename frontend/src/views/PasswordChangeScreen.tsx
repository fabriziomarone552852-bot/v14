// src/views/PasswordChangeScreen.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const EyeOpen: React.FC = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOff: React.FC = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const LockIcon: React.FC = () => (
  <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const PasswordChangeScreen: React.FC = () => {
  const { changePassword, loading, error, isAuthenticated, mustChangePassword, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !mustChangePassword) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, mustChangePassword, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (newPassword !== confirmPassword) {
      setLocalError('Le nuove password non coincidono.');
      return;
    }

    if (newPassword.length < 5) {
      setLocalError('La nuova password deve essere di almeno 5 caratteri.');
      return;
    }

    if (newPassword === currentPassword) {
      setLocalError('La nuova password deve essere diversa da quella attuale.');
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      navigate('/', { replace: true });
    } catch {
      // error gestito dal context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-sans">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/20">
              <LockIcon />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Cambio Password
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            È necessario impostare una nuova password prima di continuare.
          </p>
        </div>

        <div className="mb-6 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300 text-center">
            🔐 Questo è il tuo primo accesso. Scegli una password e non condividerla con nessuno.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Password attuale
            </label>
            <div className="mt-1 relative">
              <input
                id="current-password"
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
              >
                {showCurrentPw ? <EyeOff /> : <EyeOpen />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Nuova password
            </label>
            <div className="mt-1 relative">
              <input
                id="new-password"
                type={showNewPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Minimo 5 caratteri"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
              >
                {showNewPw ? <EyeOff /> : <EyeOpen />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Conferma nuova password
            </label>
            <div className="mt-1 relative">
              <input
                id="confirm-password"
                type={showNewPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ripeti la nuova password"
              />
            </div>
          </div>

          {newPassword.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => {
                  const strength = getPasswordStrength(newPassword);
                  return (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        strength >= level
                          ? level <= 1 ? 'bg-red-500'
                          : level <= 2 ? 'bg-orange-400'
                          : level <= 3 ? 'bg-yellow-400'
                          : 'bg-green-500'
                          : 'bg-gray-600'
                      }`}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-gray-400">
                {getPasswordStrengthLabel(getPasswordStrength(newPassword))}
              </p>
            </div>
          )}

          {localError && (
            <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
              {localError}
            </div>
          )}
          {error && !localError && (
            <div className="p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-900/50 border border-green-500 rounded text-green-200 text-sm">
              ✅ Password aggiornata! Reindirizzamento in corso…
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || success}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
                loading || success
                  ? 'bg-blue-800 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900'
              }`}
            >
              {loading ? 'Aggiornamento…' : success ? 'Fatto!' : 'Imposta nuova password'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={logout}
            className="text-sm font-medium text-gray-500 hover:text-gray-300 focus:outline-none transition-colors"
          >
            ← Torna al login
          </button>
        </div>

      </div>
    </div>
  );
};

function getPasswordStrength(pw: string): number {
  let score = 0;
  if (pw.length >= 5) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

function getPasswordStrengthLabel(strength: number): string {
  switch (strength) {
    case 0:
    case 1: return 'Sicurezza: debole';
    case 2: return 'Sicurezza: discreta';
    case 3: return 'Sicurezza: buona';
    case 4: return 'Sicurezza: ottima ✓';
    default: return '';
  }
}

export default PasswordChangeScreen;
