// src/components/shared/utils/TaskTreeNode.tsx
import React, { useState, useRef } from 'react';
import type { UITask } from '@/types';
import { formatToItalianShortDate } from '@/utils/dateUtils';

interface TaskTreeNodeProps {
  task: UITask;
  depth: number;
  selectedTaskId?: number;
  maxSubtaskDepth: number;
  onToggleTask: (taskId: number, isCurrentlyDone: boolean) => void;
  onSelectTask: (task: UITask) => void; 
  onAddSubtask?: (parentId: number) => void;
}

export const TaskTreeNode: React.FC<TaskTreeNodeProps> = ({
  task, depth, selectedTaskId, 
  maxSubtaskDepth, onToggleTask, onSelectTask, onAddSubtask
}) => {
  const isSelected = selectedTaskId === task.id;
  const [isLongPressed, setIsLongPressed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    timerRef.current = setTimeout(() => {
      setIsLongPressed((prev) => !prev);
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(35);
        } catch {}
      }
    }, 450);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);
    if (deltaX > 8 || deltaY > 8) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div className="w-full select-none">
      {/* Container "group" per triggerare l'hover su PC o long-press su touch */}
      <div 
        className="group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div 
          className={`py-2 pr-4 text-sm flex items-start border-t border-gray-50 transition-colors ${
            isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50 active:bg-gray-100/70'
          }`}
          style={{ paddingLeft: `${12 + (depth * 16)}px` }}
        >
          {depth > 0 && <span className="text-gray-300 mr-2 font-mono mt-0.5 shrink-0">└</span>}
          
          <input 
            type="checkbox" 
            checked={task.done}
            onChange={() => onToggleTask(task.id, task.done)}
            className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 mr-2"
          />

          <div 
            className="flex-1 flex items-center justify-between gap-2 cursor-pointer" 
            onClick={() => onSelectTask(task)}
          >
            <span className={`break-words flex-1 min-w-0 ${
              task.done ? "line-through text-gray-400" : isSelected ? "font-extrabold text-gray-900" : "text-gray-700"
            }`}>
              {task.title}
            </span>
            
            {task.deadline !== 'Nessuna' && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap ${
                task.done ? 'bg-gray-100 text-gray-400' : 'text-red-500'
              }`}>
                {formatToItalianShortDate(task.deadline)}
              </span>
            )}
          </div>
        </div>

        {/* PULSANTE "+" (visibile su PC con hover, su mobile con pressione prolungata) */}
        {depth < maxSubtaskDepth - 1 && (
          <div 
            className={`${
              isLongPressed ? 'flex animate-fadeIn' : 'hidden'
            } group-hover:flex py-1 items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-blue-600 active:text-blue-600 cursor-pointer transition-colors`}
            style={{ paddingLeft: `${12 + ((depth + 1) * 16)}px` }}
            onClick={(e) => {
              e.stopPropagation(); 
              if (onAddSubtask) onAddSubtask(task.id);
            }}
          >
            <span className="text-lg leading-none mt-[-2px]">+</span> Aggiungi sottotask
          </div>
        )}
      </div>

      {/* RENDER RICORSIVO DEI FIGLI */}
      {task.subtasks && task.subtasks.map((child: UITask) => (
        <TaskTreeNode 
          key={child.id}
          task={child}
          depth={depth + 1}
          selectedTaskId={selectedTaskId}
          maxSubtaskDepth={maxSubtaskDepth}
          onToggleTask={onToggleTask}
          onSelectTask={onSelectTask}
          onAddSubtask={onAddSubtask}
        />
      ))}
    </div>
  );
};

export default TaskTreeNode;