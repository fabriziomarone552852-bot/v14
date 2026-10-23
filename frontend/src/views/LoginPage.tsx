import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthErrorAlert } from '@/components/auth/AuthErrorAlert';
import { formatAuthErrorMessage } from '@/utils/authErrorUtils';

const LoginPage: React.FC = () => {
  const auth = useAuth();
  const { login, register, loading, error: contextError, isAuthenticated } = auth;
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeError, setActiveError] = useState<string | null>(null);

  const isSubmittingRef = useRef(false);

  // Sincronizza l'errore del context se presente
  useEffect(() => {
    if (contextError) {
      setActiveError(contextError);
    }
  }, [contextError]);

  useEffect(() => {
    if (isAuthenticated) {
      const startupPage = auth.user?.default_startup_page || '/';
      navigate(startupPage, { replace: true });
    }
  }, [isAuthenticated, navigate, auth.user]);

  const handleDismissError = useCallback(() => {
    setActiveError(null);
    auth.clearError();
  }, [auth]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Evita doppi invii accidentali (doppio click o invio tastiera ripetuto)
    if (loading || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    // Reset preventivo dell'errore ad ogni nuovo tentativo
    handleDismissError();

    // Validazione lato client per la modalità registrazione
    if (mode === 'register') {
      if (password !== confirmPassword) {
        setActiveError('Le password non coincidono. Verifica e riscrivi la conferma password.');
        isSubmittingRef.current = false;
        return;
      }
    }

    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, email, password);
      }
      // Il redirect avverrà automaticamente tramite l'useEffect quando isAuthenticated diventa true
    } catch (err: unknown) {
      // Cattura l'errore e imposta il messaggio con durata garantita di almeno 5 secondi
      const formatted = formatAuthErrorMessage(
        err,
        mode === 'login' ? 'Impossibile accedere con queste credenziali.' : 'Impossibile completare la registrazione.'
      );
      setActiveError(formatted);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setPassword('');
    setConfirmPassword('');
    handleDismissError();
  };

  const passwordInputType = showPassword ? 'text' : 'password';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-sans p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700/80">
        
        {/* Intestazione */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {mode === 'login' ? 'Bentornato su Vita' : 'Crea un Account Vita'}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-400">
            {mode === 'login' 
              ? 'Inserisci le tue credenziali per accedere' 
              : 'Unisciti per organizzare la tua vita quotidiana'}
          </p>
        </div>

        {/* Finestra di Avviso Errore con Countdown di 5 secondi */}
        {activeError && (
          <div className="mb-6">
            <AuthErrorAlert
              error={activeError}
              onDismiss={handleDismissError}
              durationMs={5000}
              title={mode === 'login' ? 'Accesso non riuscito' : 'Registrazione non riuscita'}
            />
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          
          {/* Campo Username */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300">Username</label>
            <div className="mt-1">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="appearance-none block w-full px-3.5 py-2.5 border border-gray-600 rounded-xl shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Inserisci il tuo username"
              />
            </div>
          </div>

          {/* Campo Email (Solo Registrazione) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300">Email</label>
              <div className="mt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="appearance-none block w-full px-3.5 py-2.5 border border-gray-600 rounded-xl shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="nome@esempio.it"
                />
              </div>
            </div>
          )}

          {/* Campo Password */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300">Password</label>
            <div className="mt-1 relative">
              <input
                type={passwordInputType}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="appearance-none block w-full px-3.5 py-2.5 pr-11 border border-gray-600 rounded-xl shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none cursor-pointer"
                title={showPassword ? 'Nascondi password' : 'Mostra password'}
                aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Campo Conferma Password (solo registrazione) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300">Conferma Password</label>
              <div className="mt-1 relative">
                <input
                  type={passwordInputType}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="appearance-none block w-full px-3.5 py-2.5 pr-11 border border-gray-600 rounded-xl shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Ripeti la password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none cursor-pointer"
                  title={showPassword ? 'Nascondi password' : 'Mostra password'}
                  aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Bottone Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white transition-all cursor-pointer ${
                loading
                  ? 'bg-blue-800/80 cursor-not-allowed opacity-80'
                  : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 shadow-blue-600/30'
              }`}
            >
              {loading ? 'Attendere...' : mode === 'login' ? 'Entra' : 'Registrati'}
            </button>
          </div>
        </form>

        {/* Switch Login / Register */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-xs sm:text-sm font-medium text-blue-400 hover:text-blue-300 focus:outline-none transition-colors cursor-pointer"
          >
            {mode === 'login'
              ? 'Non hai un account? Registrati ora'
              : 'Hai già un account? Vai al login'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;