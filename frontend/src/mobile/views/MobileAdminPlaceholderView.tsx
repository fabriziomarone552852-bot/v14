// src/mobile/views/MobileAdminPlaceholderView.tsx
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const MobileAdminPlaceholderView: React.FC = () => {
  const { user } = useAuth();

  if (!user?.is_superuser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fadeIn select-none">
      <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-5 shadow-sm">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full mb-3 border border-amber-200 dark:border-amber-800/40">
        Sezione Riservata · In Sviluppo
      </span>

      <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-2">
        Amministrazione SU
      </h2>

      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6 leading-relaxed">
        La sezione riservata all&apos;amministrazione mobile è attualmente in fase di sviluppo.
        Per la console completa accedi dalla versione <span className="font-semibold text-gray-700 dark:text-gray-300">Desktop</span>;
        qui saranno aggiunti gli interventi rapidi di emergenza (es. gestione utenti e ripristino password).
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer"
      >
        <Home className="w-4 h-4" />
        <span>Torna alla Home</span>
      </Link>
    </div>
  );
};

export default MobileAdminPlaceholderView;
