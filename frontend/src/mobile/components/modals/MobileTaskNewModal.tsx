// src/mobile/components/modals/MobileTaskNewModal.tsx
import React, { useState } from 'react';
import { type DbTask, type TaskSummary, CategoryGenre } from '@/types';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import CategorySelect from '@/components/shared/utils/CategorySelect';
import MobileBaseModal from './MobileBaseModal';
import TaskTreeSelector from '@/components/shared/utils/TaskTreeSelector';
import { CheckCircleIcon, CloseIcon, ChevronRightIcon } from '@/components/shared/utils/Icons';
import PrioritySelect from '@/components/shared/utils/PrioritySelect';
import { FormInput, FormTextarea, LocationAutocompleteInput } from '@/components/shared/form';
import { useTaskFormLogic } from '@/hooks/forms/useTaskFormLogic';

interface MobileTaskNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: TaskSummary | null;
  onTaskSaved?: (savedTask?: DbTask) => void;
  initialParentId?: number | null;
  initialDate?: string | null;
}

export const MobileTaskNewModal: React.FC<MobileTaskNewModalProps> = ({ 
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

  // Stato per l'overlay modale dell'albero delle task
  const [isSubtaskOverlayOpen, setIsSubtaskOverlayOpen] = useState(false);

  if (!isOpen) return null;

  const parentTaskTitle = newTaskForm.parent_id
    ? tasks.find((t: DbTask) => t.id.toString() === newTaskForm.parent_id)?.titolo
    : undefined;

  const handleToggleSubtaskCheckbox = (checked: boolean) => {
    setIsSubtaskPanelOpen(checked);
    if (checked) {
      setIsSubtaskOverlayOpen(true);
    } else {
      setNewTaskForm((prev) => ({ ...prev, parent_id: '' }));
    }
  };

  return (
    <>
      <MobileBaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={taskToEdit ? 'Modifica Task' : 'Nuova Task'}
        formId="mobile-task-form"
        confirmText={taskToEdit ? 'Aggiorna Task' : 'Salva Task'}
        isLoading={isSaving}
        isConfirmDisabled={isConfirmDisabled}
      >
        <form id="mobile-task-form" onSubmit={handleSalvaNuovaTask} className="space-y-4">
          {/* Rigo 1: Titolo Task */}
          <div className="w-full">
            <FormInput
              label="Titolo Task"
              type="text"
              required
              placeholder="Es. Comprare il pane, Revisionare appunti..."
              value={newTaskForm.titolo}
              onChange={(e) => setNewTaskForm({...newTaskForm, titolo: e.target.value})}
            />
          </div>

          {/* Rigo 2: Descrizione */}
          <div className="w-full">
            <FormTextarea
              label="Descrizione"
              placeholder="Aggiungi dettagli o note..."
              value={newTaskForm.descrizione}
              onChange={(e) => setNewTaskForm({...newTaskForm, descrizione: e.target.value})}
              className="h-20"
            />
          </div>

          {/* Rigo 3: Sottotask con selezione in Overlay */}
          <div className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <input 
                  type="checkbox" 
                  id="mobileIsSubtaskToggle" 
                  checked={isSubtaskPanelOpen} 
                  onChange={(e) => handleToggleSubtaskCheckbox(e.target.checked)} 
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" 
                />
                <label htmlFor="mobileIsSubtaskToggle" className="text-sm font-bold text-gray-800 cursor-pointer select-none">
                  Questa è una Sottotask
                </label>
              </div>

              {isSubtaskPanelOpen && (
                <button
                  type="button"
                  onClick={() => setIsSubtaskOverlayOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  {parentTaskTitle ? 'Cambia' : 'Seleziona'}
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isSubtaskPanelOpen && (
              <div 
                onClick={() => setIsSubtaskOverlayOpen(true)}
                className="mt-1 pt-2 border-t border-gray-200/70 flex items-center justify-between text-xs cursor-pointer hover:bg-gray-100/60 p-1.5 rounded-lg transition-colors"
              >
                {parentTaskTitle ? (
                  <div className="flex items-center gap-1.5 text-blue-700 font-bold min-w-0">
                    <CheckCircleIcon className="h-4 w-4 shrink-0 text-blue-600" />
                    <span className="truncate">Padre: {parentTaskTitle}</span>
                  </div>
                ) : (
                  <span className="text-amber-600 font-semibold italic">
                    Nessun task genitore selezionato (tocca per scegliere)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Rigo 4: Scadenza con DatePicker in Overlay */}
          <div className="w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Scadenza</label>
            <DatePicker 
              value={newTaskForm.data_scadenza}
              onChange={(date) => setNewTaskForm({ ...newTaskForm, data_scadenza: date })}
              isOpen={isDatePickerOpen}
              onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
              onClose={() => setIsDatePickerOpen(false)}
              placeholder="Nessuna scadenza"
              overlay={true}
            />
          </div>

          {/* Rigo 5: Priorità */}
          <div className="w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priorità</label>
            <PrioritySelect 
              value={newTaskForm.priorita} 
              onChange={(val) => setNewTaskForm({...newTaskForm, priorita: val})} 
              overlay={true}
            />
          </div>

          {/* Rigo 6: Categoria */}
          <div className="w-full">
            <CategorySelect  
              value={newTaskForm.category} 
              onChange={(catName) => setNewTaskForm({...newTaskForm, category: catName})} 
              genreType={CategoryGenre.TASKS} 
              overlay={true}
            />
          </div>

          {/* Rigo 7: Luogo */}
          <div className="w-full">
            <LocationAutocompleteInput
              label="Luogo"
              placeholder="Es. Via Roma 10, Milano o Scrivania..."
              value={newTaskForm.luogo}
              onChange={(val) => setNewTaskForm({ ...newTaskForm, luogo: val })}
            />
          </div>

        </form>
      </MobileBaseModal>

      {/* OVERLAY MODALE PER SCELTA TASK PADRE */}
      {isSubtaskOverlayOpen && (
        <div
          className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn pointer-events-auto select-none"
          onClick={() => setIsSubtaskOverlayOpen(false)}
          aria-hidden="true"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-full max-w-sm max-h-[80vh] flex flex-col animate-fadeIn pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 shrink-0">
              <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                Scegli Task Padre
              </h4>
              <button
                type="button"
                onClick={() => setIsSubtaskOverlayOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar py-2">
              <TaskTreeSelector
                tasks={tasks}
                selectedParentId={newTaskForm.parent_id}
                maxDepth={maxDepth}
                onSelect={(id: string | number) => {
                  setNewTaskForm((prev) => ({ ...prev, parent_id: String(id) }));
                  setIsSubtaskOverlayOpen(false);
                }}
                onMaxDepthReached={() =>
                  confirm({
                    title: 'Attenzione',
                    message: `Limite di ${maxDepth} livelli raggiunto.`,
                    isDestructive: false,
                    onConfirm: () => {},
                  })
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileTaskNewModal;
