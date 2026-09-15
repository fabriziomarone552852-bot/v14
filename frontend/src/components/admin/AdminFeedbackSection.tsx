// src/components/admin/AdminFeedbackSection.tsx
import React from 'react';
import { useAdminFeedbackLogic } from './feedback/useAdminFeedbackLogic';
import AdminFeedbackStats from './feedback/AdminFeedbackStats';
import AdminFeedbackFilters from './feedback/AdminFeedbackFilters';
import AdminFeedbackTable from './feedback/AdminFeedbackTable';
import AdminFeedbackDetailModal from './feedback/AdminFeedbackDetailModal';

export const AdminFeedbackSection: React.FC = () => {
  const {
    filteredReports,
    loading,
    error,
    stats,
    statusFilter,
    setStatusFilter,
    severityFilter,
    setSeverityFilter,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    selectedReport,
    isUpdating,
    isDeleting,
    updateSuccessMsg,
    loadReports,
    handleOpenDetail,
    handleCloseDetail,
    handleSaveReportChanges,
    handleDeleteReport,
  } = useAdminFeedbackLogic();

  return (
    <div className="space-y-6">
      {/* 1. Statistiche & KPI Card */}
      <AdminFeedbackStats
        total={stats.total}
        newCount={stats.newCount}
        inProgressCount={stats.inProgressCount}
        resolvedCount={stats.resolvedCount}
      />

      {/* 2. Barra Filtri e Ricerca */}
      <AdminFeedbackFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        severityFilter={severityFilter}
        onSeverityFilterChange={setSeverityFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        loading={loading}
        onRefresh={loadReports}
      />

      {/* Messaggio di errore se presente */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* 3. Tabella Report */}
      <AdminFeedbackTable
        reports={filteredReports}
        onSelectReport={handleOpenDetail}
      />

      {/* 4. Modale Dettaglio & Gestione Segnalazione */}
      <AdminFeedbackDetailModal
        report={selectedReport}
        onClose={handleCloseDetail}
        onSave={handleSaveReportChanges}
        onDelete={handleDeleteReport}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        updateSuccessMsg={updateSuccessMsg}
      />
    </div>
  );
};

export default AdminFeedbackSection;
