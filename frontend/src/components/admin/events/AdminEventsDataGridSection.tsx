// src/components/admin/events/AdminEventsDataGridSection.tsx
import React from 'react';
import { useAdminEventsDataGridLogic } from './useAdminEventsDataGridLogic';
import { AdminEventsDataGridFilters } from './AdminEventsDataGridFilters';
import { AdminEventsDataGridRow } from './AdminEventsDataGridRow';

export const AdminEventsDataGridSection: React.FC = () => {
  const {
    loading,
    saving,
    message,
    users,
    categories,
    datePreset,
    setDatePreset,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedUserId,
    setSelectedUserId,
    selectedCategoryId,
    setSelectedCategoryId,
    searchQuery,
    setSearchQuery,
    onlyAnomalies,
    setOnlyAnomalies,
    timeFilter,
    setTimeFilter,
    sortField,
    sortDirection,
    handleSort,
    filteredEvents,
    totalEventsCount,
    filteredSummary,
    pendingCount,
    hasRowChanges,
    getEffectiveEvent,
    handleCellChange,
    handleRevertRow,
    handleSaveRow,
    handleSaveAllPending,
    handleRevertAllPending,
    handleDeleteEvent,
    loadAllData,
  } = useAdminEventsDataGridLogic();

  return (
    <div className="space-y-4">
      {/* 1. HEADER SEZIONE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <h3 className="text-base font-extrabold text-slate-900">
              Data Grid Revisione & Sanatoria Eventi Agenda
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Console tabellare desktop per verificare, riassegnare e correggere in linea date, orari, categorie, luoghi e utenti senza ricorrere a pgAdmin.
          </p>
        </div>
      </div>

      {/* 2. MESSAGGI DI FEEDBACK */}
      {message && (
        <div
          className={`rounded-2xl p-4 text-xs font-semibold animate-fadeIn ${
            message.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 3. BARRA FILTRI */}
      <AdminEventsDataGridFilters
        datePreset={datePreset}
        onDatePresetChange={setDatePreset}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        users={users}
        selectedUserId={selectedUserId}
        onUserChange={setSelectedUserId}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={setSelectedCategoryId}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onlyAnomalies={onlyAnomalies}
        onToggleOnlyAnomalies={setOnlyAnomalies}
        filteredCount={filteredSummary.count}
        totalCount={totalEventsCount}
        anomaliesCount={filteredSummary.anomaliesCount}
        loading={loading}
        onRefresh={loadAllData}
      />

      {/* 4. BARRA AZIONI MULTIPLE / DIRTY STATE */}
      {pendingCount > 0 && (
        <div className="rounded-2xl bg-violet-600 text-white p-3.5 shadow-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span className="text-xs font-bold">
              Hai {pendingCount} {pendingCount === 1 ? 'impegno modificato non salvato' : 'impegni modificati non salvati'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleRevertAllPending}
              className="px-3 py-1.5 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs transition cursor-pointer"
            >
              Annulla Tutte
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveAllPending}
              className="px-4 py-1.5 rounded-xl bg-white text-violet-900 hover:bg-violet-50 font-black text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{saving ? 'Salvataggio...' : `💾 Salva Tutte (${pendingCount})`}</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. TABELLA DATA GRID */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 space-y-2">
          <div className="text-3xl animate-bounce">📅</div>
          <div className="text-xs font-bold">Caricamento storico eventi e categorie...</div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-500 space-y-2">
          <div className="text-3xl">🔍</div>
          <div className="text-xs font-bold text-slate-700">Nessun impegno trovato</div>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Nessun evento corrisponde ai filtri impostati. Prova a modificare l&apos;intervallo temporale o azzerare la ricerca.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[65vh]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 sticky top-0 z-10 select-none">
                <tr>
                  <th className="py-2.5 px-3 w-16 text-center"># ID</th>
                  <th
                    className="py-2.5 px-2 min-w-[130px] w-36 cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('username')}
                  >
                    Utente {sortField === 'username' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    className="py-2.5 px-2 min-w-[200px] cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('titolo')}
                  >
                    Titolo {sortField === 'titolo' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    className="py-2.5 px-2 w-44 cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('data_inizio')}
                  >
                    Inizio {sortField === 'data_inizio' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="py-2.5 px-2 w-44">Fine</th>
                  <th className="py-2.5 px-2 w-16 text-center">Tutto Giorno</th>
                  <th
                    className="py-2.5 px-2 min-w-[150px] w-40 cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('category_name')}
                  >
                    Categoria {sortField === 'category_name' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="py-2.5 px-2 min-w-[130px]">Luogo</th>
                  <th className="py-2.5 px-2 min-w-[110px] w-32">Ricorrenza</th>
                  <th className="py-2.5 px-3 w-28 text-center">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((rawEvent) => {
                  const effective = getEffectiveEvent(rawEvent);
                  const isDirty = hasRowChanges(rawEvent.id);

                  return (
                    <AdminEventsDataGridRow
                      key={rawEvent.id}
                      event={effective}
                      isDirty={isDirty}
                      disabled={saving}
                      users={users}
                      categories={categories}
                      onCellChange={handleCellChange}
                      onSaveRow={handleSaveRow}
                      onRevertRow={handleRevertRow}
                      onDeleteEvent={handleDeleteEvent}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
