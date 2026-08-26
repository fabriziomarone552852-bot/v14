// src/router/AppRouter.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Pagine
import HomePage from '@/views/HomePage';
import DayPage from '@/views/DayPage';
import WeekPage from '@/views/WeekPage';
import MonthPage from '@/views/MonthPage';
import YearPage from '@/views/YearPage';
// Pagine Generali & Auth
import UserSettingsPage from '@/views/UserSettingsPage';
import LoginPage from '@/views/LoginPage';
import PasswordChangeScreen from '@/views/PasswordChangeScreen';
import ShoppingPage from '@/views/ShoppingPage';
import AdminPage from '@/views/AdminPage';
import NotFoundPage from '@/views/NotFoundPage';

// Pagine Archivio (Raccolte nella cartella Archive)
import {
  ArchivePage,
  TasksPage,
  EventsPage,
  CategoriesPage,
  CategoryEditPage,
  CountdownsPage,
  HabitsPage,
  NotesPage,
  ReviewsPage,
  TagsPage,
  SuppliersPage,
  ShoppingArchivePage,
} from '@/views/Archive';

// Layout
import AppShellLayout from '@/components/AppShellLayout';

const AppRouter: React.FC = () => {
  const { isAuthenticated, mustChangePassword, logout } = useAuth();

  // Priorità 1: cambio password obbligatorio
  if (mustChangePassword) {
    return (
      <Routes>
        <Route path="/change-password" element={<PasswordChangeScreen />} />
        <Route path="*" element={<Navigate to="/change-password" replace />} />
      </Routes>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/change-password" element={<Navigate to="/" replace />} />
          <Route element={<AppShellLayout onLogout={logout} />}>
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

            <Route path="/admin" element={<AdminPage />} />
            <Route path="/settings" element={<UserSettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </>
  );
};

export default AppRouter;