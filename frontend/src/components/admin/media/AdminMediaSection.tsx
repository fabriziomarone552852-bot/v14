// src/components/admin/media/AdminMediaSection.tsx
import React from 'react';
import { useAdminMediaLogic } from './useAdminMediaLogic';
import { AdminMediaPlatformsTable } from './AdminMediaPlatformsTable';
import { AdminMediaListsTable } from './AdminMediaListsTable';
import { AdminMediaQuotesTable } from './AdminMediaQuotesTable';
import { SearchIcon, CloseIcon } from '@/components/shared/utils/Icons';
import type { MediaAdminSubTab } from './types';

export const AdminMediaSection: React.FC = () => {
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
    filteredPlatforms,
    totalPlatformsCount,
    handleDraftPlatformChange,
    handleCancelPlatformDraft,
    isPlatformDirty,
    handleSavePlatform,
    handleDeletePlatform,
    filteredLists,
    totalListsCount,
    handleDraftListChange,
    handleCancelListDraft,
    isListDirty,
    handleSaveList,
    handleDeleteList,
    filteredQuotes,
    totalQuotesCount,
    handleDraftQuoteChange,
    handleCancelQuoteDraft,
    isQuoteDirty,
    handleSaveQuote,
    handleDeleteQuote,
    refetchAll,
  } = useAdminMediaLogic();

  const subTabsConfig: { id: MediaAdminSubTab; label: string; icon: string; count: number }[] = [
    { id: 'platforms', label: 'Piattaforme Visione', icon: '📺', count: totalPlatformsCount },
    { id: 'lists', label: 'Liste Multimediali', icon: '📑', count: totalListsCount },
    { id: 'quotes', label: 'Citazioni TV & Film', icon: '💬', count: totalQuotesCount },
  ];

  return (
    <div className="space-y-4">
      {/* 1. HEADER SEZIONE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎬</span>
            <h3 className="text-base font-extrabold text-slate-900">
              Sanatoria & Revisione Trackers Media (Piattaforme, Liste & Citazioni)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Console centralizzata per correggere refusi nei nomi delle piattaforme streaming personalizzate, rettificare titoli o descrizioni delle liste multimediali e correggere frasi o citazioni salvate per Film e Serie TV.
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
                    ? 'bg-white text-indigo-900 shadow-xs border border-indigo-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-indigo-100 text-indigo-700 font-extrabold' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filtri */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Selettore Utente */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">Utente:</span>
            <select
              value={selectedUserId ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedUserId(val === '' ? null : Number(val));
              }}
              className="text-xs font-medium border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 outline-none focus:border-indigo-500 cursor-pointer text-slate-700"
            >
              <option value="">Tutti gli Utenti</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  👤 {u.username}
                </option>
              ))}
            </select>
          </div>

          {/* Campo Ricerca */}
          <div className="relative min-w-[200px] flex-1">
            <SearchIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca nome o testo..."
              className="w-full pl-8 pr-7 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-indigo-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Ricarica */}
          <button
            type="button"
            onClick={refetchAll}
            disabled={isLoading || isSaving}
            title="Ricarica dati"
            className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition shadow-xs disabled:opacity-40"
          >
            🔄
          </button>
        </div>
      </div>

      {/* 4. TABELLA ATTIVA */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs font-bold">
          Caricamento dati media e piattaforme in corso...
        </div>
      ) : subTab === 'platforms' ? (
        <AdminMediaPlatformsTable
          items={filteredPlatforms}
          isDraftDirty={isPlatformDirty}
          onDraftChange={handleDraftPlatformChange}
          onCancelDraft={handleCancelPlatformDraft}
          onSave={handleSavePlatform}
          onDelete={handleDeletePlatform}
          disabled={isSaving}
        />
      ) : subTab === 'lists' ? (
        <AdminMediaListsTable
          items={filteredLists}
          isDraftDirty={isListDirty}
          onDraftChange={handleDraftListChange}
          onCancelDraft={handleCancelListDraft}
          onSave={handleSaveList}
          onDelete={handleDeleteList}
          disabled={isSaving}
        />
      ) : (
        <AdminMediaQuotesTable
          items={filteredQuotes}
          isDraftDirty={isQuoteDirty}
          onDraftChange={handleDraftQuoteChange}
          onCancelDraft={handleCancelQuoteDraft}
          onSave={handleSaveQuote}
          onDelete={handleDeleteQuote}
          disabled={isSaving}
        />
      )}
    </div>
  );
};
