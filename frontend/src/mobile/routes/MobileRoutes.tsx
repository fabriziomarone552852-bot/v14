// src/mobile/routes/MobileRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MobileAppShell from '../layouts/MobileAppShell';
import MobileSettingsView from '../views/MobileSettingsView';
import MobileHomeView from '../views/MobileHomeView';
import MobileDayView from '../views/MobileDayView';
import MobileWeekView from '../views/MobileWeekView';
import MobileMonthView from '../views/MobileMonthView';
import MobileYearView from '../views/MobileYearView';

import MobileShoppingView from '../views/MobileShoppingView';

// Viste secondarie caricate su richiesta (Lazy)
const AdminPage = React.lazy(() => import('@/views/AdminPage'));
const NotFoundPage = React.lazy(() => import('@/views/NotFoundPage'));

// Pagine archivio caricate on-demand
const TasksPage = React.lazy(() => import('@/views/Archive/TasksPage'));
const EventsPage = React.lazy(() => import('@/views/Archive/EventsPage'));
const CategoriesPage = React.lazy(() => import('@/views/Archive/CategoriesPage'));
const CategoryEditPage = React.lazy(() => import('@/views/Archive/CategoryEditPage'));
const CountdownsPage = React.lazy(() => import('@/views/Archive/CountdownsPage'));
const HabitsPage = React.lazy(() => import('@/views/Archive/HabitsPage'));
const NotesPage = React.lazy(() => import('@/views/Archive/NotesPage'));
const ReviewsPage = React.lazy(() => import('@/views/Archive/ReviewsPage'));
const TagsPage = React.lazy(() => import('@/views/Archive/TagsPage'));
const SuppliersPage = React.lazy(() => import('@/views/Archive/SuppliersPage'));
const ShoppingArchivePage = React.lazy(() => import('@/views/Archive/ShoppingArchivePage'));

export const MobileRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/change-password" element={<Navigate to="/" replace />} />

      <Route
        element={
          <MobileAppShell />
        }
      >
        {/* Sezione 1: Agenda Mobile (Home Zero-Scroll / Giorno / Settimana / Mese / Anno) */}
        <Route path="/" element={<MobileHomeView />} />
        <Route path="/giorno" element={<MobileDayView />} />
        <Route path="/settimana" element={<MobileWeekView />} />
        <Route path="/mese" element={<MobileMonthView />} />
        <Route path="/anno" element={<MobileYearView />} />

        {/* Sezione 2: Shopping / Spesa */}
        <Route path="/shopping" element={<MobileShoppingView />} />
        <Route path="/shopping-archive" element={<ShoppingArchivePage />} />

        {/* Sezione 3: Impostazioni & Hub Altro */}
        <Route path="/settings" element={<MobileSettingsView />} />
        <Route path="/settings/user" element={<MobileSettingsView subview="user" />} />
        <Route path="/settings/profile" element={<MobileSettingsView subview="user" />} />
        <Route path="/settings/app" element={<MobileSettingsView subview="app" />} />
        <Route path="/settings/sync" element={<MobileSettingsView subview="sync" />} />
        <Route path="/settings/archive" element={<MobileSettingsView subview="archive" />} />

        {/* Sezioni di approfondimento accessibili dall'Hub Impostazioni */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/archivio" element={<MobileSettingsView subview="archive" />} />
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

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default MobileRoutes;
