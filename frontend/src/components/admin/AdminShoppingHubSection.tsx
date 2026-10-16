// src/components/admin/AdminShoppingHubSection.tsx
import React, { useState } from 'react';
import { AdminReceiptQuickEntrySection } from './AdminReceiptQuickEntrySection';
import { AdminShoppingDataGridSection } from './shopping/AdminShoppingDataGridSection';
import { AdminShoppingMergeProductsSection } from './shopping/AdminShoppingMergeProductsSection';

export type AdminShoppingSubTab = 'receipts' | 'data-grid' | 'merge-products';

export const AdminShoppingHubSection: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<AdminShoppingSubTab>('receipts');

  const subTabs = [
    {
      id: 'receipts' as AdminShoppingSubTab,
      label: 'Inserimento Rapido Scontrini',
      icon: '🧾',
    },
    {
      id: 'data-grid' as AdminShoppingSubTab,
      label: 'Data Grid Revisione Lotti',
      icon: '📊',
    },
    {
      id: 'merge-products' as AdminShoppingSubTab,
      label: 'Unione Prodotti Duplicati',
      icon: '🔀',
    },
  ];

  return (
    <div className="space-y-6">
      {/* SUB-BARRA SEGMENTED TABS (Proposta A: Barra Pillole Secondaria) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200/80 shadow-2xs">
        {subTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-white text-emerald-800 shadow-xs border border-emerald-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CONTENUTO DELLA SOTTO-VISTA SELEZIONATA */}
      <div className="pt-1">
        {activeSubTab === 'receipts' && <AdminReceiptQuickEntrySection />}
        {activeSubTab === 'data-grid' && <AdminShoppingDataGridSection />}
        {activeSubTab === 'merge-products' && <AdminShoppingMergeProductsSection />}
      </div>
    </div>
  );
};

export default AdminShoppingHubSection;
