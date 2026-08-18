// src/views/NotesPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/apiService';
import { NoteIcon, BackIcon, LoadingIcon } from '@/components/shared/utils/Icons';
import type { DailyEntry } from '@/types/dailyentries';

const panelClass =
  'rounded-[28px] border border-white/70 bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur';

export const NotesPage: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const data = await api.get<DailyEntry[]>(`/daily-entries?date=${todayStr}`);
        if (isMounted && data) {
          const onlyNotes = data.filter((d) => ['N1', 'N2', 'N3', 'N4'].includes(d.tipo));
          setNotes(onlyNotes);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Errore durante il caricamento');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNotes();
    return () => {
      isMounted = false;
    };
  }, []);

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
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl">
              <NoteIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Note & Riflessioni
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Archivio dei tuoi appunti veloci, note giornaliere e pensieri.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENUTO PRINCIPALE */}
      <div className={`${panelClass} p-6 flex-1 min-h-0 overflow-y-auto custom-scrollbar`}>
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3 text-slate-500">
            <LoadingIcon className="w-6 h-6 animate-spin text-cyan-600" />
            <span className="text-sm font-semibold">Caricamento note in corso...</span>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-rose-700 text-sm">
            {error}
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="p-4 rounded-3xl bg-cyan-50 text-cyan-500 mb-3">
              <NoteIcon className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Nessuna nota per oggi</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Scrivi le tue note nella vista Giorno o Settimana dell&apos;Agenda per raccoglierle qui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{note.testo}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                    {note.tipo}
                  </span>
                </div>
                <span className="text-xs text-slate-400 mt-3">{note.data_riferimento}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage;
