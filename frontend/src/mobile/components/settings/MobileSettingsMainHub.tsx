// src/mobile/components/settings/MobileSettingsMainHub.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserServerSettings } from '@/types/settings';
import type { useAuth } from '@/context/AuthContext';
import type { useGoogleCalendarIntegration } from '@/hooks/useGoogleCalendarIntegration';
import { MobileSettingsProfileHeader } from './MobileSettingsProfileHeader';
import { MobileSettingsAdminBanner } from './MobileSettingsAdminBanner';
import { MobileSettingsNavList } from './MobileSettingsNavList';
import { MobileSettingsLogoutModal } from './MobileSettingsLogoutModal';

export interface MobileSettingsMainHubProps {
  user: ReturnType<typeof useAuth>['user'];
  logout: () => void;
  settings: UserServerSettings | null;
  displayUsername: string;
  roleName: string;
  googleSync: ReturnType<typeof useGoogleCalendarIntegration>;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (val: boolean) => void;
}

export const MobileSettingsMainHub: React.FC<MobileSettingsMainHubProps> = ({
  user,
  logout,
  settings,
  displayUsername,
  roleName,
  googleSync,
  showLogoutConfirm,
  setShowLogoutConfirm,
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-full space-y-4 animate-fadeIn pb-12">
      {/* 1. SCHEDA PROFILO UTENTE / HEADER COMPATTO */}
      <MobileSettingsProfileHeader
        displayUsername={displayUsername}
        roleName={roleName}
        isSuperuser={user?.is_superuser}
        email={settings?.email}
      />

      {/* 2. SEZIONE SUPERUSER (Se Admin) */}
      {user?.is_superuser && (
        <MobileSettingsAdminBanner onOpenAdmin={() => navigate('/admin')} />
      )}

      {/* 3. LISTA DELLE VOCI PRINCIPALI DI NAVIGAZIONE */}
      <MobileSettingsNavList
        onNavigate={navigate}
        isGoogleConnected={googleSync.status?.is_connected}
        onTriggerLogout={() => setShowLogoutConfirm(true)}
      />

      {/* 4. MODALE / DIALOGO DI CONFERMA LOGOUT */}
      <MobileSettingsLogoutModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirmLogout={logout}
      />
    </div>
  );
};

export default MobileSettingsMainHub;
