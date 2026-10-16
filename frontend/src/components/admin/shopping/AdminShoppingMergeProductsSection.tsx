// src/components/admin/shopping/AdminShoppingMergeProductsSection.tsx
import React from 'react';
import { useAdminShoppingMergeLogic } from './useAdminShoppingMergeLogic';

export const AdminShoppingMergeProductsSection: React.FC = () => {
  const {
    products,
    sourceProductId,
    setSourceProductId,
    targetProductId,
    setTargetProductId,
    merging,
    loading,
    message,
    productBatchCounts,
    sourceProduct,
    targetProduct,
    sourceBatchesCount,
    handleMerge,
    loadData,
  } = useAdminShoppingMergeLogic();

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🔀</span>
            <h3 className="text-base font-extrabold text-slate-900">
              Unione & Deduplicazione Prodotti Duplicati
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Risolvi le anomalie di descrizioni difformi per lo stesso articolo (es. &quot;latte p. scremato&quot; e &quot;latte parzialmente scremato&quot;).
            Sposta in un solo click tutti i lotti passati sotto il prodotto corretto e unifica le statistiche dei prezzi.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition shadow-2xs cursor-pointer flex items-center gap-1.5"
        >
          <span>🔄</span>
          <span>Aggiorna Catalogo</span>
        </button>
      </div>

      {/* 2. FEEDBACK MESSAGE */}
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

      {/* 3. CARD DI CONFIGURAZIONE FUSIONE */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* BOX 1: PRODOTTO DUPLICATO (DA ELIMINARE) */}
          <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs uppercase tracking-wider">
              <span>🗑️</span>
              <span>1. Prodotto Duplicato (Da eliminare)</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Seleziona la dicitura anomala o il duplicato che desideri rimuovere dal catalogo:
            </p>

            <select
              value={sourceProductId}
              onChange={(e) => setSourceProductId(e.target.value ? Number(e.target.value) : '')}
              disabled={loading || merging}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-rose-200 bg-white text-slate-800 outline-none focus:border-rose-500 cursor-pointer"
            >
              <option value="">- Seleziona Prodotto Duplicato -</option>
              {products.map((p) => {
                const count = productBatchCounts[p.id] || 0;
                const name = p.displayName || p.nameNormalized;
                return (
                  <option key={p.id} value={p.id} disabled={p.id === targetProductId}>
                    {name} ({count} {count === 1 ? 'registrazione' : 'registrazioni'})
                  </option>
                );
              })}
            </select>

            {sourceProduct && (
              <div className="p-3 bg-white/80 rounded-xl border border-rose-100 text-xs space-y-1">
                <div className="font-extrabold text-slate-900">
                  {sourceProduct.displayName || sourceProduct.nameNormalized}
                </div>
                <div className="text-[11px] text-rose-700 font-semibold font-mono">
                  {sourceBatchesCount} lotti di acquisto storici collegati
                </div>
              </div>
            )}
          </div>

          {/* BOX 2: PRODOTTO MASTER (DA MANTENERE) */}
          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
              <span>🎯</span>
              <span>2. Prodotto Principale / Master (Da mantenere)</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Seleziona la voce corretta e definitiva verso cui far confluire tutte le registrazioni:
            </p>

            <select
              value={targetProductId}
              onChange={(e) => setTargetProductId(e.target.value ? Number(e.target.value) : '')}
              disabled={loading || merging}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-emerald-200 bg-white text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">- Seleziona Prodotto Principale -</option>
              {products.map((p) => {
                const count = productBatchCounts[p.id] || 0;
                const name = p.displayName || p.nameNormalized;
                return (
                  <option key={p.id} value={p.id} disabled={p.id === sourceProductId}>
                    {name} ({count} {count === 1 ? 'registrazione' : 'registrazioni'})
                  </option>
                );
              })}
            </select>

            {targetProduct && (
              <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 text-xs space-y-1">
                <div className="font-extrabold text-slate-900">
                  {targetProduct.displayName || targetProduct.nameNormalized}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold font-mono">
                  {productBatchCounts[targetProduct.id] || 0} lotti storici attuali
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. RIEPILOGO AZIONE E PULSANTE DI ESECUZIONE */}
        {sourceProduct && targetProduct && (() => {
          const sName = sourceProduct.displayName || sourceProduct.nameNormalized;
          const tName = targetProduct.displayName || targetProduct.nameNormalized;
          return (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
              <div className="space-y-1">
                <div className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                  <span>Riepilogo Fusione:</span>
                  <span className="font-mono text-rose-700 bg-rose-100/60 px-2 py-0.5 rounded">
                    {sName}
                  </span>
                  <span>➔</span>
                  <span className="font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                    {tName}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  I {sourceBatchesCount} lotti di &quot;{sName}&quot; verranno trasferiti su &quot;{tName}&quot;. Il prodotto &quot;{sName}&quot; verrà eliminato.
                </p>
              </div>

              <button
                type="button"
                disabled={merging}
                onClick={handleMerge}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm transition disabled:opacity-50 cursor-pointer shrink-0 flex items-center gap-2"
              >
                <span>{merging ? 'Fusione in corso...' : '🔀 Esegui Fusione Prodotti'}</span>
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default AdminShoppingMergeProductsSection;
