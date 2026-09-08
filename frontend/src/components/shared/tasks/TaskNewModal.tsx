// src/components/shared/tasks/TaskNewModal.tsx
import React from 'react';
import { type DbTask, type TaskSummary, CategoryGenre } from '@/types';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import CategorySelect from '@/components/shared/utils/CategorySelect';
import BaseModal from '@/components/shared/dialog/BaseModal';
import TaskTreeSelector from '@/components/shared/utils/TaskTreeSelector';
import { CloseIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';
import PrioritySelect from '@/components/shared/utils/PrioritySelect';
import { FormInput, FormTextarea, LocationAutocompleteInput } from '@/components/shared/form';
import { useTaskFormLogic } from '@/hooks/forms/useTaskFormLogic';

interface TaskNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: TaskSummary | null;
  onTaskSaved?: (savedTask?: DbTask) => void;
  initialParentId?: number | null;
  initialDate?: string | null;
}

const TaskNewModal: React.FC<TaskNewModalProps> = ({ 
  isOpen, 
  onClose, 
  taskToEdit, 
  onTaskSaved,
  initialParentId,
  initialDate
}) => {
  const {
    newTaskForm,
    setNewTaskForm,
    tasks,
    maxDepth,
    isDatePickerOpen,
    setIsDatePickerOpen,
    isSubtaskPanelOpen,
    setIsSubtaskPanelOpen,
    isSaving,
    handleSalvaNuovaTask,
    isConfirmDisabled,
    confirm,
  } = useTaskFormLogic({
    isOpen,
    onClose,
    taskToEdit,
    initialParentId,
    initialDate,
    onTaskSaved,
  });

  if (!isOpen) return null;

  // Isoliamo il pannello sinistro in una variabile
  const SubtaskPanel = isSubtaskPanelOpen ? (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
        <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">Scegli Task</h4>
        <button type="button" onClick={() => { setIsSubtaskPanelOpen(false); setNewTaskForm({...newTaskForm, parent_id: ''}); }} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
        <TaskTreeSelector 
          tasks={tasks} 
          selectedParentId={newTaskForm.parent_id} 
          maxDepth={maxDepth}
          onSelect={(id) => setNewTaskForm(prev => ({ ...prev, parent_id: id }))}
          onMaxDepthReached={() => confirm({ title: "Attenzione", message: `Limite di ${maxDepth} livelli raggiunto.`, isDestructive: false, onConfirm: () => {} })}
        />
      </div>
    </div>
  ) : undefined;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Modifica Task' : 'Nuova Task'}
      maxWidthClass="max-w-md"
      sidePanel={SubtaskPanel} 
      formId="task-form"
      confirmText={taskToEdit ? 'Aggiorna Task' : 'Salva Task'}
      isLoading={isSaving}
      isConfirmDisabled={isConfirmDisabled}
      overflowVisible={true}
    >
      <form id="task-form" onSubmit={handleSalvaNuovaTask} className="space-y-4">
        <FormInput
          label="Titolo Task"
          type="text"
          required
          placeholder="Es. Comprare il pane..."
          value={newTaskForm.titolo}
          onChange={(e) => setNewTaskForm({...newTaskForm, titolo: e.target.value})}
        />

        <FormTextarea
          label="Descrizione"
          placeholder="Aggiungi dettagli..."
          value={newTaskForm.descrizione}
          onChange={(e) => setNewTaskForm({...newTaskForm, descrizione: e.target.value})}
          className="h-20"
        />

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isSubtaskToggle" checked={isSubtaskPanelOpen} onChange={(e) => { setIsSubtaskPanelOpen(e.target.checked); if (!e.target.checked) setNewTaskForm({...newTaskForm, parent_id: ''}); }} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" />
            <label htmlFor="isSubtaskToggle" className="text-sm font-bold text-gray-700 cursor-pointer select-none">Questa è una Sottotask</label>
          </div>
          {isSubtaskPanelOpen && newTaskForm.parent_id && (
            <div className="mt-2 text-xs font-bold text-blue-600 flex items-start gap-1">
              <CheckCircleIcon className="h-4 w-4 shrink-0" />
               <span className="break-words">Collegata a: {tasks.find((t: DbTask) => t.id.toString() === newTaskForm.parent_id)?.titolo}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 items-end">
          <div className="w-full">
            <CategorySelect  
              value={newTaskForm.category} 
              onChange={(catName) => setNewTaskForm({...newTaskForm, category: catName})} 
              genreType={CategoryGenre.TASKS} 
            />
          </div>

          <div className="w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priorità</label>
            <PrioritySelect 
              value={newTaskForm.priorita} 
              onChange={(val) => setNewTaskForm({...newTaskForm, priorita: val})} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-end">
          <div className="w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Scadenza</label>
            <DatePicker 
              value={newTaskForm.data_scadenza}
              onChange={(date) => setNewTaskForm({ ...newTaskForm, data_scadenza: date })}
              isOpen={isDatePickerOpen}
              onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
              onClose={() => setIsDatePickerOpen(false)}
            />
          </div>

          <LocationAutocompleteInput
            label="Luogo"
            placeholder="Es. Via Roma 10, Milano o Scrivania..."
            value={newTaskForm.luogo}
            onChange={(val) => setNewTaskForm({ ...newTaskForm, luogo: val })}
          />
        </div>

      </form>
    </BaseModal>
  );
};

export default TaskNewModal;