// src/views/ReviewsPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReviewIcon, BackIcon, CalendarMonthIcon, CalendarYearIcon, ArrowRightIcon } from '@/components/shared/utils/Icons';

const panelClass =
  'rounded-[28px] border border-white/70 bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur';

export const ReviewsPage: React.FC = () => {
  const navigate = useNavigate();

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
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <ReviewIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Review Mesi & Anni
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Accedi alle retrospettive periodiche per valutare obiettivi, progetti e riflessioni.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENUTO PRINCIPALE */}
      <div className={`${panelClass} p-6 flex-1 min-h-0 flex flex-col justify-center`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full">
          {/* Card Review Mensile */}
          <button
            type="button"
            onClick={() => navigate('/mese')}
            className="p-6 rounded-3xl border border-slate-200/80 bg-white hover:bg-rose-50/30 hover:border-rose-300 transition-all text-left group shadow-sm flex flex-col justify-between cursor-pointer focus:outline-none"
          >
            <div className="flex items-start justify-between">
              <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 group-hover:scale-105 transition-transform">
                <CalendarMonthIcon className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-700">
                Mese
              </span>
            </div>
            <div className="my-4">
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                Review Mensile
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Consulta il bilancio mensile, la tabella del mood e le domande di retrospettiva del mese corrente.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
              <span>Vai alla vista mese</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Card Review Annuale */}
          <button
            type="button"
            onClick={() => navigate('/anno')}
            className="p-6 rounded-3xl border border-slate-200/80 bg-white hover:bg-indigo-50/30 hover:border-indigo-300 transition-all text-left group shadow-sm flex flex-col justify-between cursor-pointer focus:outline-none"
          >
            <div className="flex items-start justify-between">
              <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
                <CalendarYearIcon className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
                Anno
              </span>
            </div>
            <div className="my-4">
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Review Annuale
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Visualizza la panoramica di tutto l&apos;anno, gli obiettivi annuali e i progressi complessivi.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
              <span>Vai alla vista anno</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
