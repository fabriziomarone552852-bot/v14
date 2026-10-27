import React from 'react';
import type { TVFullStats } from '@/types/trackers';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { StatHighlightCard } from '@/components/trackers/shared/stats';

interface Props {
  stats: TVFullStats;
}

export const GeneralStatsView: React.FC<Props> = ({ stats }) => {
  const estimatedDateStr = stats.watchlist_forecast?.estimated_date
    ? new Date(stats.watchlist_forecast.estimated_date).toLocaleDateString('it-IT')
    : 'N/A';

  const bingeDateStr = stats.personal_records?.max_episodes_day
    ? new Date(stats.personal_records.max_episodes_day).toLocaleDateString('it-IT')
    : '-';

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 flex flex-col h-full text-left">
      {/* Highlight Cards in cima */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <StatHighlightCard
          label="Tempo Totale"
          value={`${stats.total_watch_time?.days || 0}G ${stats.total_watch_time?.hours || 0}H`}
          subtitle="GUARDANDO SERIE"
          valueColorClass="text-blue-600"
        />

        <StatHighlightCard
          label="Completamento"
          value={`${stats.completion_rate?.percentage || 0}%`}
          subtitle={`${stats.completion_rate?.completed || 0} FINITE, ${stats.completion_rate?.dropped || 0} ABBANDONATE`}
          valueColorClass="text-green-500"
        />

        <StatHighlightCard
          label="Proiezioni Future"
          value={estimatedDateStr}
          subtitle="DATA DI COMPLETAMENTO LISTA AL TUO RITMO ATTUALE"
          valueColorClass="text-purple-600"
          valueSizeClass="text-xl"
        />

        <StatHighlightCard
          label="Binge record"
          value={`${stats.personal_records?.max_episodes_in_day || 0} EP.`}
          subtitle={`SOLO IL ${bingeDateStr}`}
          valueColorClass="text-orange-500"
        />
      </div>

      {/* Due colonne: Statistiche temporali & Cimitero delle Serie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Colonna Sinistra */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-600 text-xs uppercase tracking-wider">
                Episodi guardati negli ultimi 30 giorni:
              </span>
              <span className="text-lg font-black text-blue-500">
                {stats.general_stats?.episodes_last_month || 0}
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-600 text-xs uppercase tracking-wider">
                Episodi guardati negli ultimi 365 giorni:
              </span>
              <span className="text-lg font-black text-blue-500">
                {stats.general_stats?.episodes_last_year || 0}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* Intestazione Colonne */}
            <div className="grid grid-cols-3 items-center px-2 pb-1">
              <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                Serie
              </span>
              <span className="text-center font-bold text-slate-400 text-[10px] uppercase tracking-wider leading-tight">
                Negli ultimi<br />30 giorni
              </span>
              <span className="text-center font-bold text-slate-400 text-[10px] uppercase tracking-wider leading-tight">
                Negli ultimi<br />365 giorni
              </span>
            </div>

            <div className="grid grid-cols-3 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                Completate
              </span>
              <span className="text-center font-black text-green-500 text-sm">
                {stats.general_stats?.series_completed_last_month || 0}
              </span>
              <span className="text-center font-black text-green-500 text-sm">
                {stats.general_stats?.series_completed_last_year || 0}
              </span>
            </div>
            <div className="grid grid-cols-3 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                In Visione
              </span>
              <span className="text-center font-black text-amber-500 text-sm">
                {stats.general_stats?.series_watching_last_month || 0}
              </span>
              <span className="text-center font-black text-amber-500 text-sm">
                {stats.general_stats?.series_watching_last_year || 0}
              </span>
            </div>
            <div className="grid grid-cols-3 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                In Attesa
              </span>
              <span className="text-center font-black text-slate-400 text-sm">
                {stats.general_stats?.series_to_watch_last_month || 0}
              </span>
              <span className="text-center font-black text-slate-400 text-sm">
                {stats.general_stats?.series_to_watch_last_year || 0}
              </span>
            </div>
            <div className="grid grid-cols-3 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                Abbandonate
              </span>
              <span className="text-center font-black text-red-500 text-sm">
                {stats.general_stats?.series_dropped_last_month || 0}
              </span>
              <span className="text-center font-black text-red-500 text-sm">
                {stats.general_stats?.series_dropped_last_year || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Colonna Destra: Il Cimitero delle Serie */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
          <h3 className="text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2 shrink-0">
            <span>👻 Il Cimitero delle Serie</span>
            <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">
              {(stats.graveyard || []).length}
            </span>
          </h3>
          {stats.graveyard && stats.graveyard.length > 0 ? (
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-2">
              {stats.graveyard.map((g, i) => (
                <div
                  key={i}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center"
                >
                  <span
                    className="font-extrabold text-sm text-slate-700 truncate"
                    title={g.title}
                  >
                    {g.title}
                  </span>
                  <span className="text-xs font-bold text-slate-400 shrink-0">
                    {g.abandoned_date
                      ? new Date(g.abandoned_date).toLocaleDateString('it-IT')
                      : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              message="Nessuna serie abbandonata. Sei un vero completista!"
              icon={<span className="text-2xl not-italic">🏆</span>}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralStatsView;
