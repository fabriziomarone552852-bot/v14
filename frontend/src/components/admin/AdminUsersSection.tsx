// src/components/admin/AdminUsersSection.tsx
import React from 'react';
import type { SystemUserItem } from '@/api/adminApi';
import { useAdminUsersLogic } from './users/useAdminUsersLogic';
import { AdminUsersTable } from './users/AdminUsersTable';
import { AdminUserEditModal } from './users/AdminUserEditModal';
import { AdminUserPasswordResetModal } from './users/AdminUserPasswordResetModal';

interface AdminUsersSectionProps {
  users: SystemUserItem[];
  onRefresh: () => Promise<void>;
}

export const AdminUsersSection: React.FC<AdminUsersSectionProps> = ({ users, onRefresh }) => {
  const logic = useAdminUsersLogic({ onRefresh });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-800">👥 Gestione Utenti, Abilitazione & Reset Credenziali</h3>
        <p className="text-xs text-slate-500">
          Visualizza, modifica i dati, disabilita/ripristina gli account oppure imposta una password temporanea/standard per il recupero.
        </p>
      </div>

      {logic.message && (
        <div
          className={`rounded-xl p-3 text-xs font-medium ${
            logic.message.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {logic.message.text}
        </div>
      )}

      {/* Tabella Utenti */}
      <AdminUsersTable
        users={users}
        onStartEdit={logic.startEdit}
        onStartResetPassword={logic.startResetPassword}
        onToggleActive={logic.handleToggleActive}
      />

      {/* Modal Modifica Dati Utente */}
      <AdminUserEditModal
        editingUser={logic.editingUser}
        editForm={logic.editForm}
        setEditForm={logic.setEditForm}
        saving={logic.saving}
        onClose={() => logic.setEditingUser(null)}
        onSubmit={logic.handleSaveUser}
      />

      {/* Modal Reset Password Utente */}
      <AdminUserPasswordResetModal
        resetUser={logic.resetUser}
        newPassword={logic.newPassword}
        setNewPassword={logic.setNewPassword}
        saving={logic.saving}
        onClose={() => logic.setResetUser(null)}
        onSubmit={logic.handleResetPassword}
      />
    </div>
  );
};

export default AdminUsersSection;
