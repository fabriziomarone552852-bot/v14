// src/components/admin/events/AdminEventsDataGridRow.tsx
import React, { memo } from 'react';
import type { AdminEventItem, AdminCategoryOption } from '@/api/adminEventsApi';
import type { SystemUserItem } from '@/api/adminApi';
import { TrashIcon } from '@/components/shared/utils/Icons';

export interface AdminEventsDataGridRowProps {
  event: AdminEventItem;
  isDirty: boolean;
  disabled: boolean;
  users: SystemUserItem[];
  categories: AdminCategoryOption[];
  onCellChange: (eventId: number, field: keyof AdminEventItem, value: unknown) => void;
  onSaveRow: (eventId: number) => void;
  onRevertRow: (eventId: number) => void;
  onDeleteEvent: (eventId: number, title: string) => void;
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

export const AdminEventsDataGridRow: React.FC<AdminEventsDataGridRowProps> = memo(({
  event,
  isDirty,
  disabled,
  users,
  categories,
  onCellChange,
  onSaveRow,
  onRevertRow,
  onDeleteEvent,
}) => {
  const isDateInvalid = Boolean(event.data_fine && event.data_fine < event.data_inizio);
  const isTitleMissing = !event.titolo || !event.titolo.trim();

  return (
    <tr
      className={`transition-colors text-xs ${
        isDirty
          ? 'bg-amber-50/70 hover:bg-amber-50'
          : isDateInvalid || isTitleMissing
          ? 'bg-rose-50/40 hover:bg-rose-50/70'
          : 'bg-white hover:bg-slate-50/60'
      }`}
    >
      {/* 1. ID */}
      <td className="py-2 px-3 font-mono font-bold text-slate-400 text-center w-16 select-none">
        <span className="flex items-center justify-center gap-1">
          {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
          #{event.id}
        </span>
      </td>

      {/* 2. Utente Assegnatario */}
      <td className="py-2 px-2 min-w-[130px] w-36">
        <select
          value={event.user_id}
          disabled={disabled}
          onChange={(e) => {
            const newUid = Number(e.target.value);
            const matchedUser = users.find((u) => u.id === newUid);
            onCellChange(event.id, 'user_id', newUid);
            if (matchedUser) {
              onCellChange(event.id, 'username', matchedUser.username);
            }
          }}
          className="w-full px-2 py-1 text-xs font-semibold border border-slate-200 rounded-lg bg-white/90 outline-none focus:border-violet-500 cursor-pointer"
        >
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username}
            </option>
          ))}
        </select>
      </td>

      {/* 3. Titolo Impegno */}
      <td className="py-2 px-2 min-w-[200px]">
        <input
          type="text"
          value={event.titolo || ''}
          disabled={disabled}
          placeholder="Titolo impegno..."
          onChange={(e) => onCellChange(event.id, 'titolo', e.target.value)}
          className={`w-full px-2.5 py-1 text-xs font-bold rounded-lg border bg-white/90 outline-none focus:border-violet-500 ${
            isTitleMissing ? 'border-rose-400 text-rose-800 bg-rose-50' : 'border-slate-200 text-slate-800'
          }`}
        />
      </td>

      {/* 4. Data / Ora Inizio */}
      <td className="py-2 px-2 w-44">
        <input
          type="datetime-local"
          value={toInputDateTime(event.data_inizio)}
          disabled={disabled}
          onChange={(e) => {
            const val = e.target.value;
            if (val) {
              onCellChange(event.id, 'data_inizio', new Date(val).toISOString());
            }
          }}
          className="w-full px-2 py-1 text-xs font-mono border border-slate-200 rounded-lg bg-white/90 outline-none focus:border-violet-500 text-slate-800"
        />
      </td>

      {/* 5. Data / Ora Fine */}
      <td className="py-2 px-2 w-44">
        <input
          type="datetime-local"
          value={toInputDateTime(event.data_fine)}
          disabled={disabled}
          onChange={(e) => {
            const val = e.target.value;
            onCellChange(event.id, 'data_fine', val ? new Date(val).toISOString() : null);
          }}
          className={`w-full px-2 py-1 text-xs font-mono border rounded-lg bg-white/90 outline-none focus:border-violet-500 ${
            isDateInvalid ? 'border-rose-400 text-rose-800 bg-rose-50' : 'border-slate-200 text-slate-800'
          }`}
        />
      </td>

      {/* 6. Tutto il Giorno */}
      <td className="py-2 px-2 text-center w-16">
        <input
          type="checkbox"
          checked={event.tutto_il_giorno}
          disabled={disabled}
          onChange={(e) => onCellChange(event.id, 'tutto_il_giorno', e.target.checked)}
          className="w-4 h-4 rounded text-violet-600 accent-violet-600 cursor-pointer"
          title="Impegno esteso all'intera giornata"
        />
      </td>

      {/* 7. Categoria */}
      <td className="py-2 px-2 min-w-[150px] w-40">
        <select
          value={event.user_category_id ?? 0}
          disabled={disabled}
          onChange={(e) => {
            const val = Number(e.target.value);
            const matchedCat = categories.find((c) => c.id === val);
            onCellChange(event.id, 'user_category_id', val === 0 ? null : val);
            onCellChange(event.id, 'category_name', matchedCat?.category_name ?? null);
          }}
          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white/90 outline-none focus:border-violet-500 cursor-pointer text-slate-700"
        >
          <option value={0}>- Nessuna Categoria -</option>
          {categories
            .filter((c) => c.genre === 2 || c.genre === 3)
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
          value={event.luogo || ''}
          disabled={disabled}
          placeholder="Luogo..."
          onChange={(e) => onCellChange(event.id, 'luogo', e.target.value)}
          className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white/90 outline-none focus:border-violet-500 text-slate-600"
        />
      </td>

      {/* 9. Ricorrenza (rrule) */}
      <td className="py-2 px-2 min-w-[110px] w-32">
        {event.rrule ? (
          <span
            className="inline-block max-w-[120px] truncate text-[11px] font-mono px-2 py-0.5 rounded bg-violet-100/70 text-violet-800"
            title={event.rrule}
          >
            🔁 {event.rrule.replace('RRULE:', '')}
          </span>
        ) : (
          <span className="text-slate-300 text-[11px]">—</span>
        )}
      </td>

      {/* 10. Azioni Riga */}
      <td className="py-2 px-3 text-center whitespace-nowrap w-28">
        <div className="flex items-center justify-center gap-1">
          {/* Tasto Salva */}
          <button
            type="button"
            disabled={!isDirty || disabled}
            onClick={() => onSaveRow(event.id)}
            className={`p-1.5 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center ${
              isDirty
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-300 cursor-not-allowed opacity-40'
            }`}
            title="Salva modifiche a questo impegno"
          >
            <span>💾</span>
          </button>

          {/* Tasto Annulla */}
          {isDirty && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onRevertRow(event.id)}
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
            onClick={() => onDeleteEvent(event.id, event.titolo)}
            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition cursor-pointer"
            title="Elimina definitivamente questo impegno"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

AdminEventsDataGridRow.displayName = 'AdminEventsDataGridRow';
