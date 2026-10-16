// src/components/admin/tasks/AdminTasksDataGridRow.tsx
import React, { memo } from 'react';
import type { AdminTaskItem, TaskPriority } from '@/api/adminTasksApi';
import type { SystemUserItem } from '@/api/adminApi';
import type { AdminCategoryOption } from '@/api/adminEventsApi';
import { TrashIcon } from '@/components/shared/utils/Icons';

export interface AdminTasksDataGridRowProps {
  task: AdminTaskItem;
  isDirty: boolean;
  disabled: boolean;
  users: SystemUserItem[];
  categories: AdminCategoryOption[];
  onCellChange: (taskId: number, field: keyof AdminTaskItem, value: unknown) => void;
  onSaveRow: (taskId: number) => void;
  onRevertRow: (taskId: number) => void;
  onDeleteTask: (taskId: number, title: string) => void;
}

const toInputDateTime = (isoStr?: string | null): string => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
};

export const AdminTasksDataGridRow: React.FC<AdminTasksDataGridRowProps> = memo(({
  task,
  isDirty,
  disabled,
  users,
  categories,
  onCellChange,
  onSaveRow,
  onRevertRow,
  onDeleteTask,
}) => {
  const isTitleMissing = !task.titolo || !task.titolo.trim();
  const isDateInvalid = Boolean(task.data_scadenza && task.data_scadenza < task.data_start);
  const isOverdue = Boolean(!task.fatto && task.data_scadenza && new Date(task.data_scadenza).getTime() < Date.now());

  return (
    <tr
      className={`transition-colors text-xs ${
        isDirty
          ? 'bg-amber-50/70 hover:bg-amber-50'
          : isDateInvalid || isTitleMissing
          ? 'bg-rose-50/40 hover:bg-rose-50/70'
          : task.fatto
          ? 'bg-slate-50/40 hover:bg-slate-50 opacity-75'
          : 'bg-white hover:bg-slate-50/60'
      }`}
    >
      {/* 1. ID */}
      <td className="py-2 px-3 font-mono font-bold text-slate-400 text-center w-16 select-none">
        <span className="flex items-center justify-center gap-1">
          {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
          #{task.id}
        </span>
      </td>

      {/* 2. Utente Assegnatario */}
      <td className="py-2 px-2 min-w-[130px] w-36">
        <select
          value={task.user_id}
          disabled={disabled}
          onChange={(e) => {
            const newUid = Number(e.target.value);
            const matchedUser = users.find((u) => u.id === newUid);
            onCellChange(task.id, 'user_id', newUid);
            if (matchedUser) {
              onCellChange(task.id, 'username', matchedUser.username);
            }
          }}
          className="w-full px-2 py-1 text-xs font-semibold border border-slate-200 rounded-lg bg-white/90 outline-none focus:border-amber-500 cursor-pointer"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username}
            </option>
          ))}
        </select>
      </td>

      {/* 3. Titolo Attività */}
      <td className="py-2 px-2 min-w-[200px]">
        <input
          type="text"
          value={task.titolo || ''}
          disabled={disabled}
          placeholder="Titolo attività..."
          onChange={(e) => onCellChange(task.id, 'titolo', e.target.value)}
          className={`w-full px-2.5 py-1 text-xs font-bold rounded-lg border bg-white/90 outline-none focus:border-amber-500 ${
            isTitleMissing
              ? 'border-rose-400 text-rose-800 bg-rose-50'
              : task.fatto
              ? 'border-slate-200 text-slate-500 line-through'
              : 'border-slate-200 text-slate-800'
          }`}
        />
      </td>

      {/* 4. Priorità */}
      <td className="py-2 px-2 w-28">
        <select
          value={task.priorita}
          disabled={disabled}
          onChange={(e) => onCellChange(task.id, 'priorita', e.target.value as TaskPriority)}
          className={`w-full px-2 py-1 text-xs font-extrabold rounded-lg border outline-none cursor-pointer ${
            task.priorita === 'Alta'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : task.priorita === 'Media'
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-sky-200 bg-sky-50 text-sky-700'
          }`}
        >
          <option value="Alta">🔴 Alta</option>
          <option value="Media">🟡 Media</option>
          <option value="Bassa">🔵 Bassa</option>
        </select>
      </td>

      {/* 5. Scadenza */}
      <td className="py-2 px-2 w-44">
        <input
          type="datetime-local"
          value={toInputDateTime(task.data_scadenza)}
          disabled={disabled}
          onChange={(e) => {
            const val = e.target.value;
            onCellChange(task.id, 'data_scadenza', val ? new Date(val).toISOString() : null);
          }}
          className={`w-full px-2 py-1 text-xs font-mono border rounded-lg bg-white/90 outline-none focus:border-amber-500 ${
            isDateInvalid
              ? 'border-rose-400 text-rose-800 bg-rose-50'
              : isOverdue
              ? 'border-rose-300 text-rose-700 font-bold bg-rose-50/40'
              : 'border-slate-200 text-slate-800'
          }`}
        />
      </td>

      {/* 6. Fatto / Completato */}
      <td className="py-2 px-2 text-center w-16">
        <input
          type="checkbox"
          checked={task.fatto}
          disabled={disabled}
          onChange={(e) => onCellChange(task.id, 'fatto', e.target.checked)}
          className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
          title={task.fatto ? `Completato ${task.data_fatto ? new Date(task.data_fatto).toLocaleDateString() : ''}` : 'Contrassegna come completato'}
        />
      </td>

      {/* 7. Categoria */}
      <td className="py-2 px-2 min-w-[150px] w-40">
        <select
          value={task.user_category_id ?? 0}
          disabled={disabled}
          onChange={(e) => {
            const val = Number(e.target.value);
            const matchedCat = categories.find((c) => c.id === val);
            onCellChange(task.id, 'user_category_id', val === 0 ? null : val);
            onCellChange(task.id, 'category_name', matchedCat?.category_name ?? null);
          }}
          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white/90 outline-none focus:border-amber-500 cursor-pointer text-slate-700"
        >
          <option value={0}>- Nessuna Categoria -</option>
          {categories
            .filter((c) => c.genre === 1 || c.genre === 3)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.category_name} ({c.username || 'Sistema'})
              </option>
            ))}
        </select>
      </td>

      {/* 8. Luogo */}
      <td className="py-2 px-2 min-w-[130px]">
        <input
          type="text"
          value={task.luogo || ''}
          disabled={disabled}
          placeholder="Luogo..."
          onChange={(e) => onCellChange(task.id, 'luogo', e.target.value)}
          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white/90 outline-none focus:border-amber-500 text-slate-600"
        />
      </td>

      {/* 9. Azioni Riga */}
      <td className="py-2 px-3 text-center whitespace-nowrap w-28">
        <div className="flex items-center justify-center gap-1">
          {/* Tasto Salva */}
          <button
            type="button"
            disabled={!isDirty || disabled}
            onClick={() => onSaveRow(task.id)}
            className={`p-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center ${
              isDirty
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-300 cursor-not-allowed opacity-40'
            }`}
            title="Salva modifiche a questa attività"
          >
            <span>💾</span>
          </button>

          {/* Tasto Annulla */}
          {isDirty && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onRevertRow(task.id)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              title="Annulla modifiche a questa riga"
            >
              <span>↩️</span>
            </button>
          )}

          {/* Tasto Elimina */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onDeleteTask(task.id, task.titolo)}
            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition cursor-pointer"
            title="Elimina definitivamente questa attività"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

AdminTasksDataGridRow.displayName = 'AdminTasksDataGridRow';
