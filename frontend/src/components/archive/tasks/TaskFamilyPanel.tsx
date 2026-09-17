// src/components/archive/tasks/TaskFamilyPanel.tsx
import React from "react";
import type { Task } from "@/types/tasks";

type ToggleFattoFn = (task: Task) => Promise<void> | void;

interface TaskFamilyPanelProps {
  familyTaskId: number | null;
  familyRoot: Task | null;
  loadingFamily: boolean;
  toggleFatto: ToggleFattoFn;
  setEditingTaskId: (id: number | null) => void;
  setParentForSubtaskId: (id: number | null) => void;
  setFamilyTaskId: (id: number | null) => void;
  formatDateTime: (value: string | null | undefined) => string;
  loading: boolean;
}

const TaskFamilyPanel: React.FC<TaskFamilyPanelProps> = ({
  familyTaskId,
  familyRoot,
  loadingFamily,
  toggleFatto,
  setEditingTaskId,
  setParentForSubtaskId,
  setFamilyTaskId,
  formatDateTime,
  loading,
}) => {
  const renderFamilyTree = (task: Task): React.ReactNode => {
    const subtasks: Task[] = Array.isArray(task.subtasks) ? task.subtasks : [];
    const hasChildren = subtasks.length > 0;

    return (
      <li key={task.id} style={{ marginBottom: 4 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <input
            type="checkbox"
            checked={task.fatto}
            onChange={() => toggleFatto(task)}
            disabled={loading}
          />
          <span>
            {task.titolo} ({task.priorita}) {task.luogo ? `- ${task.luogo}` : ""}
            {task.fatto && task.data_fatto && (
              <span style={{ marginLeft: 8, fontSize: 11, color: "#555" }}>
                completato il {formatDateTime(task.data_fatto)}
              </span>
            )}
          </span>
          <button
            style={{ fontSize: 12 }}
            onClick={() => {
              setEditingTaskId(null);
              setParentForSubtaskId(task.id);
              setFamilyTaskId(task.id);
            }}
            disabled={loading}
          >
            + Sottotask
          </button>
        </div>
        {hasChildren && (
          <ul style={{ marginLeft: 16 }}>
            {subtasks.map((st) => renderFamilyTree(st))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div style={{ width: 320, paddingLeft: 24 }}>
      <h2>Famiglia task</h2>
      {!familyTaskId && (
        <p>Seleziona “Famiglia” su un task per vedere il ramo.</p>
      )}
      {familyTaskId && loadingFamily && <p>Caricamento famiglia...</p>}
      {familyTaskId && !loadingFamily && !familyRoot && (
        <p>Nessuna famiglia trovata.</p>
      )}
      {familyTaskId && familyRoot && (
        <div
          style={{
            border: "1px solid #ddd",
            padding: 12,
            borderRadius: 4,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <p style={{ fontWeight: "bold", marginBottom: 8 }}>
            Root: {familyRoot.titolo}
          </p>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {renderFamilyTree(familyRoot)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TaskFamilyPanel;