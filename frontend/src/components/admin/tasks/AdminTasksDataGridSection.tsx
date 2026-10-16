// src/components/admin/tasks/AdminTasksDataGridSection.tsx
import React from 'react';
import { useAdminTasksDataGridLogic } from './useAdminTasksDataGridLogic';
import { AdminTasksDataGridFilters } from './AdminTasksDataGridFilters';
import { AdminTasksDataGridRow } from './AdminTasksDataGridRow';

export const AdminTasksDataGridSection: React.FC = () => {
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
    selectedPriority,
    setSelectedPriority,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    onlyAnomalies,
    setOnlyAnomalies,
    sortField,
    sortDirection,
    handleSort,
    filteredTasks,
    totalTasksCount,
    filteredSummary,
    pendingCount,
    hasRowChanges,
    getEffectiveTask,
    handleCellChange,
    handleRevertRow,
    handleSaveRow,
    handleSaveAllPending,
    handleRevertAllPending,
    handleDeleteTask,
    loadAllData,
  } = useAdminTasksDataGridLogic();

  return (
    <div className="space-y-4">
      {/* 1. HEADER SEZIONE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <h3 className="text-base font-extrabold text-slate-900">
              Data Grid Revisione & Sanatoria Attività / Tasks
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Console tabellare desktop per controllare priorità, scadenze, completamenti, categorie e riassegnazioni utenti delle attività di sistema.
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
      <AdminTasksDataGridFilters
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
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onlyAnomalies={onlyAnomalies}
        onToggleOnlyAnomalies={setOnlyAnomalies}
        filteredCount={filteredSummary.count}
        totalCount={totalTasksCount}
        completedCount={filteredSummary.completedCount}
        anomaliesCount={filteredSummary.anomaliesCount}
        loading={loading}
        onRefresh={loadAllData}
      />

      {/* 4. BARRA AZIONI MULTIPLE / DIRTY STATE */}
      {pendingCount > 0 && (
        <div className="rounded-2xl bg-amber-600 text-white p-3.5 shadow-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span className="text-xs font-bold">
              Hai {pendingCount} {pendingCount === 1 ? 'attività modificata non salvata' : 'attività modificate non salvate'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleRevertAllPending}
              className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition cursor-pointer"
            >
              Annulla Tutte
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveAllPending}
              className="px-4 py-1.5 rounded-xl bg-white text-amber-900 hover:bg-amber-50 font-black text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{saving ? 'Salvataggio...' : `💾 Salva Tutte (${pendingCount})`}</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. TABELLA DATA GRID */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 space-y-2">
          <div className="text-3xl animate-bounce">✅</div>
          <div className="text-xs font-bold">Caricamento registro attività e categorie...</div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-500 space-y-2">
          <div className="text-3xl">🔍</div>
          <div className="text-xs font-bold text-slate-700">Nessuna attività trovata</div>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Nessun task corrisponde ai filtri impostati. Prova a modificare i filtri o azzerare la ricerca.
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
                    className="py-2.5 px-2 w-28 cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('priorita')}
                  >
                    Priorità {sortField === 'priorita' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    className="py-2.5 px-2 w-44 cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('data_scadenza')}
                  >
                    Scadenza {sortField === 'data_scadenza' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    className="py-2.5 px-2 w-16 text-center cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('fatto')}
                  >
                    Fatto {sortField === 'fatto' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="py-2.5 px-2 min-w-[150px] w-40">Categoria</th>
                  <th className="py-2.5 px-2 min-w-[130px]">Luogo</th>
                  <th className="py-2.5 px-3 w-28 text-center">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((rawTask) => {
                  const effective = getEffectiveTask(rawTask);
                  const isDirty = hasRowChanges(rawTask.id);

                  return (
                    <AdminTasksDataGridRow
                      key={rawTask.id}
                      task={effective}
                      isDirty={isDirty}
                      disabled={saving}
                      users={users}
                      categories={categories}
                      onCellChange={handleCellChange}
                      onSaveRow={handleSaveRow}
                      onRevertRow={handleRevertRow}
                      onDeleteTask={handleDeleteTask}
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
