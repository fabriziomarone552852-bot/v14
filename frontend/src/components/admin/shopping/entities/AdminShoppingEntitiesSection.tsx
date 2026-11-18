// src/components/admin/shopping/entities/AdminShoppingEntitiesSection.tsx
import React from 'react';
import { useAdminShoppingEntitiesLogic } from './useAdminShoppingEntitiesLogic';
import { AdminShoppingProductsTable } from './AdminShoppingProductsTable';
import { AdminShoppingBrandsTable } from './AdminShoppingBrandsTable';
import { AdminShoppingSuppliersTable } from './AdminShoppingSuppliersTable';
import { AdminShoppingListsGroupsTable } from './AdminShoppingListsGroupsTable';
import { SearchIcon, CloseIcon } from '@/components/shared/utils/Icons';

export const AdminShoppingEntitiesSection: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    message,
    setMessage,
    isLoading,
    isSaving,
    filteredProducts,
    filteredBrands,
    filteredSuppliers,
    filteredLists,
    filteredGroups,
    totalProductsCount,
    totalBrandsCount,
    totalSuppliersCount,
    totalListsCount,
    handleDraftChange,
    handleCancelDraft,
    isDraftDirty,
    handleSaveProduct,
    handleSaveBrand,
    handleSaveSupplier,
    handleSaveList,
    handleSaveGroup,
  } = useAdminShoppingEntitiesLogic();

  const entityTabs = [
    {
      id: 'products' as const,
      label: 'Articoli / Prodotti',
      icon: '🛒',
      count: totalProductsCount,
    },
    {
      id: 'brands' as const,
      label: 'Marche / Brand',
      icon: '🏷️',
      count: totalBrandsCount,
    },
    {
      id: 'suppliers' as const,
      label: 'Negozi / Punti Vendita',
      icon: '🏬',
      count: totalSuppliersCount,
    },
    {
      id: 'lists' as const,
      label: 'Liste & Gruppi',
      icon: '📋',
      count: totalListsCount,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. HEADER SEZIONE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏷️</span>
            <h3 className="text-base font-extrabold text-slate-900">
              Anagrafiche, Cataloghi & Denominazioni Shopping
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pannello di controllo per correggere refusi ed errori nelle denominazioni di articoli, marche, supermercati e liste con aggiornamento immediato in tutta l&apos;app.
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

      {/* 3. BARRA STRUMENTI: PILLOLE ENTITÀ + RICERCA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Pillole selettore entità */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {entityTabs.map((tab) => {
            const isActive = activeTab === tab.id || (tab.id === 'lists' && (activeTab === 'lists' || activeTab === 'groups'));
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-emerald-800 shadow-xs border border-emerald-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Campo ricerca rapida */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca per nome o ID..."
            className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
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

      {/* 4. CONTENUTO TABELLARE */}
      {isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 space-y-2">
          <div className="text-3xl animate-bounce">🏷️</div>
          <div className="text-xs font-bold">Caricamento anagrafiche e cataloghi in corso...</div>
        </div>
      ) : activeTab === 'products' ? (
        <AdminShoppingProductsTable
          products={filteredProducts}
          isDraftDirty={(id) => isDraftDirty('products', id)}
          onDraftChange={(id, val) => handleDraftChange('products', id, 'name', val)}
          onCancelDraft={(id) => handleCancelDraft('products', id)}
          onSave={handleSaveProduct}
          disabled={isSaving}
        />
      ) : activeTab === 'brands' ? (
        <AdminShoppingBrandsTable
          brands={filteredBrands}
          isDraftDirty={(id) => isDraftDirty('brands', id)}
          onDraftChange={(id, val) => handleDraftChange('brands', id, 'name', val)}
          onCancelDraft={(id) => handleCancelDraft('brands', id)}
          onSave={handleSaveBrand}
          disabled={isSaving}
        />
      ) : activeTab === 'suppliers' ? (
        <AdminShoppingSuppliersTable
          suppliers={filteredSuppliers}
          isDraftDirty={(id) => isDraftDirty('suppliers', id)}
          onDraftChange={(id, val) => handleDraftChange('suppliers', id, 'name', val)}
          onCancelDraft={(id) => handleCancelDraft('suppliers', id)}
          onSave={handleSaveSupplier}
          disabled={isSaving}
        />
      ) : (
        <AdminShoppingListsGroupsTable
          lists={filteredLists}
          groups={filteredGroups}
          isDraftDirty={(type, id) => isDraftDirty(type, id)}
          onDraftChange={handleDraftChange}
          onCancelDraft={handleCancelDraft}
          onSaveList={handleSaveList}
          onSaveGroup={handleSaveGroup}
          disabled={isSaving}
        />
      )}
    </div>
  );
};
