// src/router/AppRouter.tsx
import React, { useState, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/context/AuthContext';

const IS_MOBILE_BUILD = import.meta.env.VITE_APP_TARGET === 'mobile';

// Pagine Auth & Layout
const LoginPage = React.lazy(() => import('@/views/LoginPage'));
const PasswordChangeScreen = React.lazy(() => import('@/views/PasswordChangeScreen'));
const MobileRoutes = React.lazy(() => import('@/mobile/routes/MobileRoutes'));

// Pagine Desktop (escluse fisicamente dall'APK Android in build:mobile)
const AppShellLayout = !IS_MOBILE_BUILD ? React.lazy(() => import('@/components/AppShellLayout')) : () => null;
const HomePage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/HomePage')) : () => null;
const DayPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/DayPage')) : () => null;
const WeekPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/WeekPage')) : () => null;
const MonthPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/MonthPage')) : () => null;
const YearPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/YearPage')) : () => null;
const UserSettingsPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/UserSettingsPage')) : () => null;
const ShoppingPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/ShoppingPage')) : () => null;
const AdminPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/AdminPage')) : () => null;
const NotFoundPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/NotFoundPage')) : () => null;
const TVSeriesPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/Trackers/TVSeriesPage')) : () => null;

// Pagine Archivio Desktop
const ArchivePage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/Archive/ArchivePage')) : () => null;
const TasksPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/Archive/TasksPage')) : () => null;
const EventsPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/Archive/EventsPage')) : () => null;
const CategoriesPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/Archive/CategoriesPage')) : () => null;
const CategoryEditPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/Archive/CategoryEditPage')) : () => null;
const CountdownsPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/Archive/CountdownsPage')) : () => null;
const HabitsPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/Archive/HabitsPage')) : () => null;
const NotesPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/Archive/NotesPage')) : () => null;
const ReviewsPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/Archive/ReviewsPage')) : () => null;
const TagsPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/Archive/TagsPage')) : () => null;
const SuppliersPage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/Archive/SuppliersPage')) : () => null;
const ShoppingArchivePage = !IS_MOBILE_BUILD ? React.lazy(() => import('@/views/Archive/ShoppingArchivePage')) : () => null;

const RouteLoader: React.FC = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-slate-900">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppRouter: React.FC = () => {
  const { isAuthenticated, mustChangePassword, logout } = useAuth();
  const isNative = Capacitor.isNativePlatform();

  // Mobile preview mode state for Desktop browser testing
  const [isMobileMode] = useState<boolean>(() => {
    if (isNative) return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'mobile') return true;
    if (params.get('mode') === 'desktop') return false;
    return localStorage.getItem('smartagenda_view_mode') === 'mobile';
  });

  // Priorità 1: cambio password obbligatorio
  if (mustChangePassword) {
    return (
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/change-password" element={<PasswordChangeScreen />} />
          <Route path="*" element={<Navigate to="/change-password" replace />} />
        </Routes>
      </Suspense>
    );
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // Se siamo su Android Nativo o se l'utente ha attivato la preview Mobile da browser:
  if (isNative || isMobileMode) {
    return (
      <Suspense fallback={<RouteLoader />}>
        <MobileRoutes />
      </Suspense>
    );
  }

  // Visualizzazione Desktop Standard (Invariata)
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/change-password" element={<Navigate to="/" replace />} />
        <Route
          element={
            <AppShellLayout
              onLogout={logout}
            />
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/giorno" element={<DayPage />} />
          <Route path="/settimana" element={<WeekPage />} />
          <Route path="/mese" element={<MonthPage />} />
          <Route path="/anno" element={<YearPage />} />
          <Route path="/archivio" element={<ArchivePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/:id/edit" element={<CategoryEditPage />} />
          <Route path="/countdowns" element={<CountdownsPage />} />
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/fornitori" element={<SuppliersPage />} />
          <Route path="/shopping-archive" element={<ShoppingArchivePage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          
          <Route path="/trackers/serie-tv" element={<TVSeriesPage />} />

          <Route path="/admin" element={<AdminPage />} />
          <Route path="/settings" element={<UserSettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRouter;