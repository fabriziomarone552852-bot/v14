// src/views/CountdownsPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/apiService';
import { CountdownIcon, BackIcon, LoadingIcon } from '@/components/shared/utils/Icons';
import type { Countdown } from '@/types/countdowns';

const panelClass =
  'rounded-[28px] border border-white/70 bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur';

export const CountdownsPage: React.FC = () => {
  const navigate = useNavigate();
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCountdowns = async () => {
      setLoading(true);
      try {
        const data = await api.get<Countdown[]>('/countdowns/active');
        if (isMounted && data) {
          setCountdowns(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Errore durante il caricamento');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCountdowns();
    return () => {
      isMounted = false;
    };
  }, []);

  const getDaysRemaining = (targetDateStr: string): number => {
    const target = new Date(targetDateStr).getTime();
    const now = new Date().getTime();
    const diff = target - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="h-full flex flex-col justify-between gap-4 max-w-[1600px] mx-auto overflow-hidden">
      {/* HEADER */}
      <section className={`${panelClass} p-5 sm:p-6 shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={() => navigate('/archivio')}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Torna all'archivio"
            >
              <BackIcon className="w-5 h-5" />
            </button>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CountdownIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Countdown & Traguardi
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Tieni traccia dei giorni mancanti alle tue date più importanti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENUTO PRINCIPALE */}
      <div className={`${panelClass} p-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar`}>
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3 text-slate-500">
            <LoadingIcon className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-sm font-semibold">Caricamento countdown in corso...</span>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-rose-700 text-sm">
            {error}
          </div>
        ) : countdowns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-4 rounded-3xl bg-emerald-50 text-emerald-500 mb-3">
              <CountdownIcon className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Nessun countdown attivo</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              I tuoi countdown attivi impostati dall&apos;agenda compariranno qui con il conteggio a ritroso dei giorni.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {countdowns.map((cd) => {
              const days = getDaysRemaining(cd.target_date);
              return (
                <div
                  key={cd.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{cd.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(cd.target_date).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                        days < 0
                          ? 'bg-slate-100 text-slate-500'
                          : days <= 7
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {days < 0 ? 'Concluso' : days === 0 ? 'Oggi!' : `${days} giorni`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CountdownsPage;
