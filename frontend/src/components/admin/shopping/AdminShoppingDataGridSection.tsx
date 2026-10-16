// src/components/admin/shopping/AdminShoppingDataGridSection.tsx
import React from 'react';
import { useAdminShoppingDataGridLogic } from './useAdminShoppingDataGridLogic';
import { AdminShoppingDataGridFilters } from './AdminShoppingDataGridFilters';
import { AdminShoppingDataGridRow } from './AdminShoppingDataGridRow';

export const AdminShoppingDataGridSection: React.FC = () => {
  const {
    loading,
    saving,
    message,
    products,
    suppliers,
    brands,
    datePreset,
    setDatePreset,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedSupplierId,
    setSelectedSupplierId,
    selectedBrandId,
    setSelectedBrandId,
    searchQuery,
    setSearchQuery,
    onlyAnomalies,
    setOnlyAnomalies,
    onlyOffers,
    setOnlyOffers,
    sortField,
    sortDirection,
    handleSort,
    filteredBatches,
    totalBatchesCount,
    filteredSummary,
    pendingCount,
    hasRowChanges,
    getEffectiveBatch,
    handleCellChange,
    handleRevertRow,
    handleSaveRow,
    handleSaveAllPending,
    handleRevertAllPending,
    handleDeleteBatch,
    loadAllData,
  } = useAdminShoppingDataGridLogic();

  return (
    <div className="space-y-4">
      {/* 1. HEADER SEZIONE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h3 className="text-base font-extrabold text-slate-900">
              Data Grid Revisione & Sanatoria Lotti Spesa
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Console tabellare desktop per correggere in linea date, prodotti, brand, negozi, prezzi e quantità senza dover ricorrere a pgAdmin.
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
      <AdminShoppingDataGridFilters
        datePreset={datePreset}
        onDatePresetChange={setDatePreset}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        suppliers={suppliers}
        selectedSupplierId={selectedSupplierId}
        onSupplierChange={setSelectedSupplierId}
        brands={brands}
        selectedBrandId={selectedBrandId}
        onBrandChange={setSelectedBrandId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onlyAnomalies={onlyAnomalies}
        onToggleOnlyAnomalies={setOnlyAnomalies}
        onlyOffers={onlyOffers}
        onToggleOnlyOffers={setOnlyOffers}
        filteredCount={filteredSummary.count}
        totalCount={totalBatchesCount}
        totalAmount={filteredSummary.totalAmount}
        anomaliesCount={filteredSummary.anomaliesCount}
        loading={loading}
        onRefresh={loadAllData}
      />

      {/* 4. BARRA AZIONI MULTIPLE / DIRTY STATE (Se ci sono modifiche pendenti) */}
      {pendingCount > 0 && (
        <div className="rounded-2xl bg-amber-500 text-white p-3.5 shadow-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span className="text-xs font-bold">
              Hai {pendingCount} {pendingCount === 1 ? 'riga modificata non salvata' : 'righe modificate non salvate'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleRevertAllPending}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer"
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
          <div className="text-3xl animate-bounce">🛒</div>
          <div className="text-xs font-bold">Caricamento storico lotti e cataloghi...</div>
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-500 space-y-2">
          <div className="text-3xl">🔍</div>
          <div className="text-xs font-bold text-slate-700">Nessuna registrazione trovata</div>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Nessun acquisto corrisponde ai filtri impostati. Prova a modificare l&apos;intervallo temporale o azzerare la ricerca.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[65vh]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 sticky top-0 z-10 select-none">
                <tr>
                  <th className="py-2.5 px-3 w-16"># ID</th>
                  <th
                    className="py-2.5 px-2 w-32 cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('purchaseDate')}
                  >
                    Data {sortField === 'purchaseDate' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    className="py-2.5 px-2 min-w-[220px] w-56 cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('productName')}
                  >
                    Prodotto {sortField === 'productName' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="py-2.5 px-2 min-w-[220px] w-56">Brand</th>
                  <th className="py-2.5 px-1.5 w-20 text-center" title="Valutazione Brand/Prodotto">Val.</th>
                  <th className="py-2.5 px-2 min-w-[140px]">Punto Vendita</th>
                  <th
                    className="py-2.5 px-2 w-20 text-center cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('quantityPurchased')}
                  >
                    Q.tà {sortField === 'quantityPurchased' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    className="py-2.5 px-2 w-24 text-right cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('purchasePrice')}
                  >
                    Tot. (€) {sortField === 'purchasePrice' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th
                    className="py-2.5 px-3 w-24 text-right cursor-pointer hover:text-slate-800"
                    onClick={() => handleSort('unitPrice')}
                  >
                    Unit. (€) {sortField === 'unitPrice' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="py-2.5 px-2 w-16 text-center">Offerta</th>
                  <th className="py-2.5 px-3 w-28 text-center">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map((rawBatch) => {
                  const effective = getEffectiveBatch(rawBatch);
                  const isDirty = hasRowChanges(rawBatch.id);

                  return (
                    <AdminShoppingDataGridRow
                      key={rawBatch.id}
                      batch={effective}
                      isDirty={isDirty}
                      products={products}
                      suppliers={suppliers}
                      brands={brands}
                      disabled={saving}
                      onCellChange={handleCellChange}
                      onSaveRow={handleSaveRow}
                      onRevertRow={handleRevertRow}
                      onDeleteBatch={handleDeleteBatch}
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

export default AdminShoppingDataGridSection;
