// src/views/UserSettingsPage.tsx
import React from 'react';
import { SettingsIcon } from '@/components/shared/utils/Icons';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/data/loadingMessages';

import ProfileSection from '@/components/settings/ProfileSection';
import TaskHierarchySection from '@/components/settings/TaskHierarchySection';
import IntegrationsSection from '@/components/settings/IntegrationsSection';
import MemorySection from '@/components/settings/MemorySection';
import DangerZoneSection from '@/components/settings/DangerZoneSection';

import { useUserSettingsPageLogic } from '@/components/settings/useUserSettingsPageLogic';
import { UserSettingsTabsNav } from '@/components/settings/UserSettingsTabsNav';
import { UserSettingsActionBar } from '@/components/settings/UserSettingsActionBar';

const panelClass =
  'rounded-[30px] border border-white/70 bg-white/95 shadow-[0_12px_34px_rgba(15,23,42,0.08)] backdrop-blur';

export const UserSettingsPage: React.FC = () => {
  const logic = useUserSettingsPageLogic();

  if (logic.loading) {
    return <PageLoadingState messages={LOADING_MESSAGES.settings} />;
  }

  if (!logic.settings) {
    return <PageErrorState message={ERROR_MESSAGES.settings} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-full bg-[#f5f7fb] p-4 md:p-6 pb-24">
      <div className="mx-auto max-w-[1200px] space-y-6">
        {/* Toast Notifica di Successo */}
        {logic.success && (
          <div className="fixed right-6 top-6 z-50 w-full max-w-sm rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg transition-all animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold text-sm">
                ✓
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-emerald-800">Operazione riuscita</h2>
                <p className="mt-0.5 text-xs text-emerald-700">{logic.success}</p>
              </div>
              <button
                type="button"
                onClick={() => logic.setSuccess(null)}
                className="rounded-full p-1 text-emerald-600 transition hover:bg-emerald-100 cursor-pointer"
                aria-label="Chiudi"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Banner Notifica di Errore */}
        {logic.error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-bold text-sm">
                !
              </div>
              <div>
                <h2 className="text-sm font-bold text-rose-800">Attenzione</h2>
                <p className="mt-0.5 text-xs text-rose-700">{logic.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* HEADER SEMPLIFICATO */}
        <section className={`${panelClass} p-6`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <SettingsIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Impostazioni Utente
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Personalizza il tuo profilo, la gerarchia dei task, le integrazioni e la memoria.
              </p>
            </div>
          </div>
        </section>

        {/* SELETTORE TAB */}
        <UserSettingsTabsNav
          activeTab={logic.activeTab}
          onTabChange={logic.setActiveTab}
        />

        {/* CORPO DELLA SCHEDA ATTIVA */}
        <div className="space-y-6">
          <div className={`${panelClass} p-6 lg:p-8 animate-fadeIn min-h-[300px]`}>
            {logic.activeTab === 'profile' && (
              <ProfileSection
                settings={logic.settings}
                email={logic.form.email}
                onEmailChange={(val) => logic.setForm((prev) => ({ ...prev, email: val }))}
                onChangePasswordSubmit={logic.handleChangePasswordSubmit}
                disabled={logic.saving}
              />
            )}

            {logic.activeTab === 'tasks' && (
              <TaskHierarchySection
                maxDepth={logic.form.maxDepth}
                onMaxDepthChange={(val) => logic.setForm((prev) => ({ ...prev, maxDepth: val }))}
                disabled={logic.saving}
              />
            )}

            {logic.activeTab === 'integrations' && <IntegrationsSection />}

            {logic.activeTab === 'memory' && (
              <MemorySection
                onClearClientCache={logic.handleClearClientCache}
                isClearing={logic.isClearingCache}
              />
            )}

            {logic.activeTab === 'danger' && (
              <DangerZoneSection
                onDeactivateAccount={logic.handleDeactivateAccount}
                isDeleting={logic.deactivating}
              />
            )}
          </div>

          {/* BARRA INFERIORE PULSANTI */}
          <UserSettingsActionBar
            hasChanges={logic.hasChanges}
            saving={logic.saving}
            onReset={logic.handleResetForm}
            onSubmit={() => logic.handleSubmit()}
          />
        </div>
      </div>
    </div>
  );
};

export default UserSettingsPage;