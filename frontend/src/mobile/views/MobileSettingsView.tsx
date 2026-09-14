// src/mobile/views/MobileSettingsView.tsx
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useMobileSettingsLogic } from '../hooks/useMobileSettingsLogic';
import { MobileUserSettingsSection } from '../components/settings/MobileUserSettingsSection';
import { MobileAppSettingsSection } from '../components/settings/MobileAppSettingsSection';
import { MobileSyncSettingsSection } from '../components/settings/MobileSyncSettingsSection';
import { MobileArchiveHubSection } from '../components/settings/MobileArchiveHubSection';
import { MobileChangelogSection } from '../components/settings/MobileChangelogSection';
import { MobileSettingsMainHub } from '../components/settings/MobileSettingsMainHub';

interface MobileSettingsViewProps {
  subview?: 'main' | 'user' | 'app' | 'sync' | 'archive' | 'changelog';
}

export const MobileSettingsView: React.FC<MobileSettingsViewProps> = ({ subview: propSubview }) => {
  const location = useLocation();

  const currentSubview = useMemo(() => {
    if (propSubview) return propSubview;
    const path = location.pathname;
    if (path === '/settings/user' || path === '/settings/profile') return 'user';
    if (path === '/settings/app') return 'app';
    if (path === '/settings/sync') return 'sync';
    if (path === '/settings/archive' || path === '/settings/archivio') return 'archive';
    if (path === '/settings/changelog' || path === '/settings/info') return 'changelog';
    return 'main';
  }, [propSubview, location.pathname]);

  const {
    user,
    logout,
    settings,
    email,
    setEmail,
    maxDepth,
    loading,
    savingUser,
    savingApp,
    isClearingCache,
    showLogoutConfirm,
    setShowLogoutConfirm,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    passwordLoading,
    notification,
    googleSync,
    displayUsername,
    roleName,
    handleSaveEmail,
    handleChangePasswordSubmit,
    handleSaveMaxDepth,
    handleClearCache,
  } = useMobileSettingsLogic();

  if (currentSubview === 'user') {
    return (
      <MobileUserSettingsSection
        displayUsername={displayUsername}
        email={email}
        setEmail={setEmail}
        loading={loading}
        savingUser={savingUser}
        notification={notification}
        isPasswordModalOpen={isPasswordModalOpen}
        setIsPasswordModalOpen={setIsPasswordModalOpen}
        passwordLoading={passwordLoading}
        onSaveEmail={handleSaveEmail}
        onChangePasswordSubmit={handleChangePasswordSubmit}
      />
    );
  }

  if (currentSubview === 'app') {
    return (
      <MobileAppSettingsSection
        maxDepth={maxDepth}
        savingApp={savingApp}
        isClearingCache={isClearingCache}
        notification={notification}
        onSaveMaxDepth={handleSaveMaxDepth}
        onClearCache={handleClearCache}
      />
    );
  }

  if (currentSubview === 'sync') {
    return <MobileSyncSettingsSection googleSync={googleSync} />;
  }

  if (currentSubview === 'archive') {
    return <MobileArchiveHubSection />;
  }

  if (currentSubview === 'changelog') {
    return <MobileChangelogSection />;
  }

  return (
    <MobileSettingsMainHub
      user={user}
      logout={logout}
      settings={settings}
      displayUsername={displayUsername}
      roleName={roleName}
      googleSync={googleSync}
      showLogoutConfirm={showLogoutConfirm}
      setShowLogoutConfirm={setShowLogoutConfirm}
    />
  );
};

export default MobileSettingsView;
