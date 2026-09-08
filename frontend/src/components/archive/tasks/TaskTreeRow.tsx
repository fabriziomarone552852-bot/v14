// src/components/tasks/TaskTreeRow.tsx
import React from 'react';
import { CalendarIcon } from '@/components/shared/utils/Icons';
import { Badge } from '@/components/shared/utils/Badges';
import type { DbTask } from '@/types';
import { formatToItalianShortDate, getLocalTodayStr } from '@/utils/dateUtils';
import { formatName } from '@/utils/uiUtils';

export interface TaskTreeNode extends DbTask {
  children: TaskTreeNode[];
  category_name?: string;
  category_color?: string;
}

interface TaskTreeRowProps {
  node: TaskTreeNode;
  level?: number;
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  onToggleTaskCompletion: (task: DbTask) => void;
  onSelectTask: (task: DbTask) => void;
  onOpenNewSubtask: (parentTask: DbTask) => void;
  isSearchMode?: boolean;
}

export const TaskTreeRow: React.FC<TaskTreeRowProps> = ({
  node,
  level = 0,
  expandedIds,
  onToggleExpand,
  onToggleTaskCompletion,
  onSelectTask,
  onOpenNewSubtask,
  isSearchMode = false,
}) => {
  const hasChildren = Boolean(node.children && node.children.length > 0);
  const isExpanded = expandedIds.has(node.id);
  const todayStr = getLocalTodayStr();
  const isOverdue =
    !node.fatto && !!node.data_scadenza && node.data_scadenza.substring(0, 10) < todayStr;

  const formattedDeadline = node.data_scadenza
    ? formatToItalianShortDate(node.data_scadenza.substring(0, 10))
    : null;

  const categoryName = formatName(node.category?.category_name || node.category_name || 'Generico');
  const categoryColor = node.category?.colore || node.category_color || '#9CA3AF';

  // È una sottotask visualizzata a livello principale nei risultati di ricerca?
  const isSubtaskInSearch = isSearchMode && level === 0 && Boolean(node.parent_id);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Alta':
        return '#ef4444'; // red-500
      case 'Media':
        return '#f59e0b'; // amber-500
      case 'Bassa':
      default:
        return '#eab308'; // yellow-500
    }
  };

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {/* Contenitore con scope hover locale per riga + tasto aggiungi sottotask */}
      <div className="group">
        {/* RIGA PRINCIPALE DEL TASK */}
        <div
          className={`grid grid-cols-[1fr_28px_28px_82px] sm:grid-cols-[1fr_130px_90px_110px] items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 hover:bg-gray-50 transition-colors cursor-pointer ${
            node.fatto ? 'bg-gray-50/40 text-gray-400' : 'bg-white'
          }`}
          onClick={() => onSelectTask(node)}
        >
          {/* COLONNA 1: Checkbox + Espansione + Titolo Task */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 min-w-0"
            style={{ paddingLeft: level > 0 ? `${level * 14}px` : undefined }}
          >
            {/* Checkbox di Completamento - Spostato a filo bordo sinistro */}
            <input
              type="checkbox"
              checked={node.fatto}
              onChange={(e) => {
                e.stopPropagation();
                onToggleTaskCompletion(node);
              }}
              className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 shrink-0 cursor-pointer"
            />

            {/* Tasto Espansione se ha figli (mostrato solo se hasChildren o isSubtaskInSearch) */}
            {hasChildren || isSubtaskInSearch ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(node.id);
                }}
                className="p-0.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer flex items-center justify-center w-4 h-4 shrink-0"
                title={isExpanded ? 'Comprimi sotto-task' : 'Espandi sotto-task'}
              >
                {isSubtaskInSearch ? (
                  <svg
                    className={`w-3.5 h-3.5 ${isExpanded ? 'text-blue-600' : 'text-gray-400'} select-none`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={isExpanded ? "M19 9l-7 7-7-7" : "M5 12h14"} />
                  </svg>
                ) : (
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-150 ${
                      isExpanded ? 'rotate-90 text-blue-600' : 'text-gray-400'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ) : null}

            {/* Titolo e Descrizione Task */}
            <div className="min-w-0 flex flex-col justify-center flex-1">
              <span
                className={`text-xs sm:text-sm font-semibold truncate ${
                  node.fatto
                    ? 'line-through text-gray-400'
                    : 'text-gray-900 group-hover:text-blue-600 transition-colors'
                }`}
                title={node.titolo}
              >
                {node.titolo}
              </span>
              {node.descrizione && (
                <span className="text-[10px] sm:text-xs text-gray-400 truncate max-w-lg">
                  {node.descrizione}
                </span>
              )}
            </div>
          </div>

          {/* COLONNA 2: Categoria (Pallino colorato su mobile, Badge su desktop) */}
          <div className="w-7 sm:w-[130px] flex items-center justify-center sm:justify-start min-w-0">
            {/* Desktop: Badge completo */}
            <div className="hidden sm:block max-w-full truncate">
              <Badge variant="category" colorHex={categoryColor} className="max-w-full truncate">
                {categoryName}
              </Badge>
            </div>
            {/* Mobile: Pallino colorato compatto con tooltip */}
            <div
              className="sm:hidden w-3.5 h-3.5 rounded-full shadow-2xs border border-black/10 shrink-0"
              style={{ backgroundColor: categoryColor }}
              title={`Categoria: ${categoryName}`}
              aria-label={`Categoria: ${categoryName}`}
            />
          </div>

          {/* COLONNA 3: Priorità (Pallino colorato su mobile, Badge su desktop) */}
          <div className="w-7 sm:w-[90px] flex items-center justify-center sm:justify-start">
            {/* Desktop: Badge completo */}
            <div className="hidden sm:block">
              <Badge variant="priority" priority={node.priorita || 'Bassa'}>
                {node.priorita || 'Bassa'}
              </Badge>
            </div>
            {/* Mobile: Pallino colorato compatto con tooltip */}
            <div
              className="sm:hidden w-3.5 h-3.5 rounded-full shadow-2xs border border-black/10 shrink-0"
              style={{ backgroundColor: getPriorityColor(node.priorita) }}
              title={`Priorità: ${node.priorita || 'Bassa'}`}
              aria-label={`Priorità: ${node.priorita || 'Bassa'}`}
            />
          </div>

          {/* COLONNA 4: Scadenza */}
          <div className="w-[82px] sm:w-[110px] flex items-center justify-start text-[11px] sm:text-xs font-semibold">
            {formattedDeadline ? (
              <div
                className={`flex items-center gap-1 ${
                  isOverdue
                    ? 'text-red-600 font-bold'
                    : node.fatto
                    ? 'text-gray-400'
                    : 'text-gray-600'
                }`}
              >
                <CalendarIcon
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${
                    isOverdue ? 'text-red-500' : 'text-gray-400'
                  }`}
                />
                <span className="truncate">{formattedDeadline}</span>
              </div>
            ) : (
              <span className="text-gray-300 font-medium px-1 sm:px-2">—</span>
            )}
          </div>
        </div>

        {/* PULSANTE "+ Aggiungi sottotask" sotto la riga del task su hover */}
        <div
          className="hidden group-hover:flex py-1.5 px-4 items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors cursor-pointer bg-slate-50/50 border-t border-gray-100"
          style={{ paddingLeft: `${20 + (level + 1) * 20}px` }}
          onClick={(e) => {
            e.stopPropagation();
            onOpenNewSubtask(node);
          }}
        >
          <span className="text-base font-bold leading-none mt-[-2px]">+</span>
          <span>Aggiungi sottotask</span>
        </div>
      </div>

      {/* SOTTO-TASK RICORSIVE (Mostrate quando il nodo è espanso) */}
      {hasChildren && isExpanded && (
        <div className="bg-slate-50/30">
          {node.children.map((child) => (
            <TaskTreeRow
              key={child.id}
              node={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onToggleTaskCompletion={onToggleTaskCompletion}
              onSelectTask={onSelectTask}
              onOpenNewSubtask={onOpenNewSubtask}
              isSearchMode={isSearchMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskTreeRow;
