// src/components/admin/habits_goals/AdminHabitsGoalsSection.tsx
import React from 'react';
import { useAdminHabitsGoalsLogic } from './useAdminHabitsGoalsLogic';
import { AdminHabitsRoutinesTable } from './AdminHabitsRoutinesTable';
import { AdminCountdownsTable } from './AdminCountdownsTable';
import { SearchIcon, CloseIcon } from '@/components/shared/utils/Icons';
import type { HabitsGoalsSubTab } from './types';

export const AdminHabitsGoalsSection: React.FC = () => {
  const {
    subTab,
    setSubTab,
    selectedUserId,
    setSelectedUserId,
    searchQuery,
    setSearchQuery,
    message,
    setMessage,
    isLoading,
    isSaving,
    users,
    filteredHabits,
    filteredRoutines,
    filteredCountdowns,
    counts,
    handleHabitDraftChange,
    handleCancelHabitDraft,
    isHabitDraftDirty,
    handleSaveHabit,
    handleDeleteHabit,
    handleCountdownDraftChange,
    handleCancelCountdownDraft,
    isCountdownDraftDirty,
    handleSaveCountdown,
    handleDeleteCountdown,
  } = useAdminHabitsGoalsLogic();

  const subTabsConfig: { id: HabitsGoalsSubTab; label: string; icon: string; count: number }[] = [
    { id: 'habits', label: 'Abitudini', icon: '⚡', count: counts.habits },
    { id: 'routines', label: 'Routine', icon: '🔁', count: counts.routines },
    { id: 'countdowns', label: 'Traguardi / Countdown', icon: '⏳', count: counts.countdowns },
  ];

  return (
    <div className="space-y-4">
      {/* 1. HEADER SEZIONE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h3 className="text-base font-extrabold text-slate-900">
              Sanatoria & Revisione Abitudini, Routine & Traguardi
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Console per correggere refusi nei titoli, ricalibrare gli obiettivi o modificare date e stati di abitudini, routine e conti alla rovescia di qualsiasi utente.
          </p>
        </div>
      </div>

      {/* 2. MESSAGGIO DI FEEDBACK */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-2xl p-3.5 text-xs font-semibold animate-fadeIn ${
            message.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="p-1 rounded-lg hover:bg-black/5 cursor-pointer text-slate-500"
          >
            <CloseIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. BARRA STRUMENTI: PILLOLE SUBTAB + FILTRI UTENTE E RICERCA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Pillole SubTab */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {subTabsConfig.map((tab) => {
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-amber-900 shadow-xs border border-amber-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filtri Utente & Ricerca */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Selettore Utente */}
          <select
            value={selectedUserId ?? ''}
            onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
            className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-500 cursor-pointer"
          >
            <option value="">Tutti gli Utenti ({users.length})</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username} (#{u.id})
              </option>
            ))}
          </select>

          {/* Ricerca Rapida */}
          <div className="relative flex-1 md:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per titolo o ID..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-500 transition"
            />
            <SearchIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. CONTENUTO TABELLARE */}
      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 space-y-2">
          <div className="text-3xl animate-bounce">🎯</div>
          <div className="text-xs font-bold">Caricamento abitudini, routine e countdown...</div>
        </div>
      ) : subTab === 'habits' ? (
        <AdminHabitsRoutinesTable
          items={filteredHabits}
          isDraftDirty={isHabitDraftDirty}
          onDraftChange={handleHabitDraftChange}
          onCancelDraft={handleCancelHabitDraft}
          onSave={handleSaveHabit}
          onDelete={handleDeleteHabit}
          disabled={isSaving}
        />
      ) : subTab === 'routines' ? (
        <AdminHabitsRoutinesTable
          items={filteredRoutines}
          isDraftDirty={isHabitDraftDirty}
          onDraftChange={handleHabitDraftChange}
          onCancelDraft={handleCancelHabitDraft}
          onSave={handleSaveHabit}
          onDelete={handleDeleteHabit}
          disabled={isSaving}
        />
      ) : (
        <AdminCountdownsTable
          items={filteredCountdowns}
          isDraftDirty={isCountdownDraftDirty}
          onDraftChange={handleCountdownDraftChange}
          onCancelDraft={handleCancelCountdownDraft}
          onSave={handleSaveCountdown}
          onDelete={handleDeleteCountdown}
          disabled={isSaving}
        />
      )}
    </div>
  );
};
