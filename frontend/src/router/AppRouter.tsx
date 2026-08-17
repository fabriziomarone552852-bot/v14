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
import TasksPage from '@/views/TasksPage';
import EventsPage from '@/views/EventsPage';
import CategoriesPage from '@/views/CategoriesPage';
import CategoryEditPage from '@/views/CategoryEditPage';
import UserSettingsPage from '@/views/UserSettingsPage';
import LoginPage from '@/views/LoginPage';
import PasswordChangeScreen from '@/views/PasswordChangeScreen';
import ShoppingPage from '@/views/ShoppingPage';

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
          <Route element={<AppShellLayout onLogout={logout} />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/giorno" element={<DayPage />} />
            <Route path="/settimana" element={<WeekPage />} />
            <Route path="/mese" element={<MonthPage />} />
            <Route path="/anno" element={<YearPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:id/edit" element={<CategoryEditPage />} />
            <Route path="/shopping" element={<ShoppingPage />} />
            <Route path="/settings" element={<UserSettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
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