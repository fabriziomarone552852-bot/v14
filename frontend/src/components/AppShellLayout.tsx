// src/components/AppShellLayout.tsx
import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  SettingsIcon,
  SwitchSidebarIcon,
  ShoppingIcon,
  UniversityIcon,
  MenuBarsIcon,
} from './shared/utils/Icons';
import { NotificationsSidebar } from '@/components/shared/notifications/NotificationsSidebar';
import { SidebarItem } from './navigation/SidebarItem';
import { AgendaNavSection } from './navigation/AgendaNavSection';
import { TrackersNavSection } from './navigation/TrackersNavSection';

interface AppShellLayoutProps {
  onLogout?: () => void;
}

const AppShellLayout: React.FC<AppShellLayoutProps> = ({ onLogout }) => {
  const location = useLocation();
  const { user } = useAuth();

  // true = Sidebar estesa (w-64), false = Mini Sidebar con icone (w-20)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const displayUsername = user?.username ? user.username.toUpperCase() : 'OSPITE';
  const isActive = (path: string) => location.pathname === path;

  // Funzione per generare classi CSS dinamiche e perfette per i bottoni principali
  const getNavLinkClass = (active: boolean) => {
    const base = 'flex items-center transition-all duration-200 rounded-xl focus:outline-none cursor-pointer';
    const layout = isSidebarOpen ? 'px-4 py-3 gap-4 mx-2 justify-start' : 'py-3 mx-3 justify-center';
    const colors = active
      ? 'bg-blue-600 text-white shadow-md'
      : 'text-gray-400 hover:bg-gray-700 hover:text-white';
    return `${base} ${layout} ${colors}`;
  };

  const isArchiveActive =
    isActive('/archivio') ||
    isActive('/tasks') ||
    isActive('/events') ||
    isActive('/categories') ||
    location.pathname.startsWith('/categories/') ||
    isActive('/countdowns') ||
    isActive('/habits') ||
    isActive('/notes') ||
    isActive('/reviews') ||
    isActive('/tags') ||
    isActive('/fornitori');

  const prefs = user?.module_preferences || {};
  const showAgenda = prefs.agenda !== false;
  const showShopping = prefs.shopping !== false;
  const showTrackers = prefs.trackers !== false;

  const mainNavItems = [
    { to: '/universita', label: 'Università', icon: <UniversityIcon className="w-6 h-6 shrink-0" /> },
    ...(showShopping ? [{ to: '/shopping', label: 'Shopping', icon: <ShoppingIcon className="w-6 h-6 shrink-0" /> }] : []),
  ];

  return (
    <div className="app-container flex h-screen overflow-hidden relative bg-gray-50">
      {/* SIDEBAR DINAMICA (Sfondo scuro nativo) */}
      <aside
        className={`h-full z-40 bg-gray-900 transition-all duration-300 ease-in-out shrink-0 overflow-hidden flex flex-col shadow-xl ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-full flex flex-col py-4 justify-between">
          {/* HEADER DELLA SIDEBAR */}
          <div
            className={`flex items-center mb-8 min-h-[40px] ${
              isSidebarOpen ? 'justify-between px-6' : 'justify-center px-0'
            }`}
          >
            {isSidebarOpen && (
              <div className="flex items-center gap-3 truncate pr-2">
                <img src="/favicon.png" alt="Vita Logo" className="w-8 h-8 shrink-0 object-contain" />
                <div className="truncate">
                  <h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block leading-none">
                    Benvenuto
                  </h2>
                  <h1 className="text-base font-extrabold text-white truncate leading-tight mt-0.5">{displayUsername}</h1>
                </div>
              </div>
            )}

            {/* Tasto Switch Sidebar */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all focus:outline-none cursor-pointer"
              title={isSidebarOpen ? 'Rimpicciolisci menu' : 'Espandi menu'}
            >
              <SwitchSidebarIcon
                className={`h-5 w-5 transition-transform duration-300 ${isSidebarOpen ? 'rotate-0' : 'rotate-180'}`}
              />
            </button>
          </div>

          {/* NAVIGAZIONE PRINCIPALE */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
            {/* ITEM: AGENDA CON SOTTOMENU */}
            {showAgenda && (
              <AgendaNavSection
                isSidebarOpen={isSidebarOpen}
                getNavLinkClass={getNavLinkClass}
              />
            )}

            {/* ITEM: TRACKERS CON SOTTOMENU */}
            {showTrackers && (
              <TrackersNavSection
                isSidebarOpen={isSidebarOpen}
                getNavLinkClass={getNavLinkClass}
              />
            )}

            {/* ========================================= */}
            {/* VOCI PRINCIPALI MAPPATE IN AUTOMATICO */}
            {/* ========================================= */}
            {mainNavItems.map((item) => (
              <SidebarItem
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                isActive={isActive(item.to)}
                isSidebarOpen={isSidebarOpen}
              />
            ))}

            {/* ========================================= */}
            {/* SEZIONE ARCHIVIO DATI (Icona a 3 linee) */}
            {/* ========================================= */}
            <div className="pt-3 mt-2 border-t border-gray-800 flex flex-col gap-1">
              <SidebarItem
                to="/archivio"
                label="Archivio"
                icon={<MenuBarsIcon className="w-6 h-6 shrink-0" />}
                isActive={isArchiveActive}
                isSidebarOpen={isSidebarOpen}
              />
            </div>

            {/* ========================================= */}
            {/* SEZIONE RISERVATA AL SUPERUSER (SU) */}
            {/* ========================================= */}
            {user?.is_superuser && (
              <div className="pt-3 mt-1 border-t border-gray-800 flex flex-col gap-1">
                {isSidebarOpen && (
                  <p className="px-6 text-[9px] font-bold text-amber-500 uppercase tracking-wider mb-1">Pannello SU</p>
                )}
                <SidebarItem
                  to="/admin"
                  label="Amministrazione SU"
                  icon={<span className="text-base">🛡️</span>}
                  isActive={isActive('/admin')}
                  isSidebarOpen={isSidebarOpen}
                />
              </div>
            )}
          </nav>

          {/* FOOTER SIDEBAR: Settings + Logout */}
          <div className="pt-4 mt-2 border-t border-gray-800 flex flex-col gap-2 shrink-0">
            <div
              className={`flex ${
                isSidebarOpen ? 'flex-row items-center justify-between px-6' : 'flex-col gap-4 items-center px-0'
              }`}
            >
              <div className="flex items-center gap-2">
                <Link
                  to="/settings"
                  className="p-2 rounded-xl text-gray-400 hover:bg-gray-700 hover:text-white transition-colors focus:outline-none relative"
                  title="Impostazioni"
                >
                  <SettingsIcon className="w-6 h-6" />
                </Link>
              </div>
              <button
                onClick={onLogout}
                className={`font-bold rounded-xl text-red-400 transition-colors focus:outline-none ${
                  isSidebarOpen
                    ? 'text-sm w-full py-1 hover:text-white hover:bg-red-600'
                    : 'text-[14px] pb-2 hover:text-red-200'
                }`}
                title="Disconnetti"
              >
                Esci
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTENUTO PRINCIPALE */}
      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 relative">
          <Outlet />
        </main>
      </div>
      <NotificationsSidebar />
    </div>
  );
};

export default AppShellLayout;