// src/mobile/components/trackers/stats/MobileStatsOverviewSection.tsx
import React from 'react';
import type { TVFullStats } from '@/types/trackers';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { MobileStatsSectionHeader } from './MobileStatsSectionHeader';

interface MobileStatsOverviewSectionProps {
  stats: TVFullStats;
}

export const MobileStatsOverviewSection: React.FC<MobileStatsOverviewSectionProps> = ({ stats }) => {
  const graveyardList = stats.graveyard || [];
  const hasGraveyard = graveyardList.length > 0;

  return (
    <div className="space-y-5">
      <MobileStatsSectionHeader title="Panoramica" icon="📊" />

      {/* 1. Prime 4 Card in Griglia 2x2 (2 Righe x 2 Colonne) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Tempo Totale */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Tempo Totale
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-600 mb-0.5 leading-tight">
            {stats.total_watch_time?.days || 0}G {stats.total_watch_time?.hours || 0}H
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            Guardando Serie
          </span>
        </div>

        {/* Card 2: Tasso di Completamento */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Completamento
          </span>
          <div className="text-xl sm:text-2xl font-black text-green-500 mb-0.5 leading-tight">
            {stats.completion_rate?.percentage || 0}%
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-full px-1">
            {stats.completion_rate?.completed || 0} finite, {stats.completion_rate?.dropped || 0} abb.
          </span>
        </div>

        {/* Card 3: Proiezioni Future */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Proiezioni Future
          </span>
          <div className="text-base sm:text-lg font-black text-purple-600 mb-0.5 leading-tight">
            {stats.watchlist_forecast?.estimated_date
              ? new Date(stats.watchlist_forecast.estimated_date).toLocaleDateString('it-IT')
              : 'N/A'}
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            Fine lista al ritmo attuale
          </span>
        </div>

        {/* Card 4: Binge Record */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Binge Record
          </span>
          <div className="text-xl sm:text-2xl font-black text-orange-500 mb-0.5 leading-tight">
            {stats.personal_records?.max_episodes_in_day || 0} EP.
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-full px-1">
            Solo il {stats.personal_records?.max_episodes_day
              ? new Date(stats.personal_records.max_episodes_day).toLocaleDateString('it-IT')
              : '-'}
          </span>
        </div>
      </div>

      {/* 2. Statistiche Temporali (30gg vs 365gg) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-600 text-xs uppercase tracking-wider">
              Negli ultimi 30 giorni:
            </span>
            <span className="text-lg font-black text-blue-600">
              {stats.general_stats?.episodes_last_month || 0} ep
            </span>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-600 text-xs uppercase tracking-wider">
              Negli ultimi 365 giorni:
            </span>
            <span className="text-lg font-black text-blue-600">
              {stats.general_stats?.episodes_last_year || 0} ep
            </span>
          </div>
        </div>

        {/* Tabella Serie */}
        <div className="flex flex-col gap-1.5">
          <div className="grid grid-cols-3 items-center px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Stato Serie</span>
            <span className="text-center leading-tight">Ultimi 30gg</span>
            <span className="text-center leading-tight">Ultimi 365gg</span>
          </div>

          <div className="grid grid-cols-3 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Completate</span>
            <span className="text-center font-black text-green-500 text-sm">
              {stats.general_stats?.series_completed_last_month || 0}
            </span>
            <span className="text-center font-black text-green-500 text-sm">
              {stats.general_stats?.series_completed_last_year || 0}
            </span>
          </div>

          <div className="grid grid-cols-3 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">In Visione</span>
            <span className="text-center font-black text-amber-500 text-sm">
              {stats.general_stats?.series_watching_last_month || 0}
            </span>
            <span className="text-center font-black text-amber-500 text-sm">
              {stats.general_stats?.series_watching_last_year || 0}
            </span>
          </div>

          <div className="grid grid-cols-3 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">In Attesa</span>
            <span className="text-center font-black text-slate-400 text-sm">
              {stats.general_stats?.series_to_watch_last_month || 0}
            </span>
            <span className="text-center font-black text-slate-400 text-sm">
              {stats.general_stats?.series_to_watch_last_year || 0}
            </span>
          </div>

          <div className="grid grid-cols-3 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Abbandonate</span>
            <span className="text-center font-black text-red-500 text-sm">
              {stats.general_stats?.series_dropped_last_month || 0}
            </span>
            <span className="text-center font-black text-red-500 text-sm">
              {stats.general_stats?.series_dropped_last_year || 0}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Il Cimitero delle Serie */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-base">👻</span>
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">
              Il Cimitero delle Serie
            </h3>
          </div>
          {hasGraveyard && (
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {graveyardList.length}
            </span>
          )}
        </div>

        {hasGraveyard ? (
          <div className="space-y-2">
            {graveyardList.map((g, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center gap-2"
              >
                <span className="font-extrabold text-xs text-slate-700 truncate" title={g.title}>
                  {g.title}
                </span>
                <span className="text-[10px] font-bold text-slate-400 shrink-0">
                  {g.abandoned_date ? new Date(g.abandoned_date).toLocaleDateString('it-IT') : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            message="Non ci sono serie abbandonate"
            icon={<span className="text-3xl not-italic">🏆</span>}
          />
        )}
      </div>
    </div>
  );
};

export default MobileStatsOverviewSection;
