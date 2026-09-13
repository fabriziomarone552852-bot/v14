// src/mobile/components/modals/MobileTaskNewModal.tsx
import React, { useState } from 'react';
import { type DbTask, type TaskSummary, CategoryGenre } from '@/types';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import CategorySelect from '@/components/shared/utils/CategorySelect';
import MobileBaseModal from './MobileBaseModal';
import PrioritySelect from '@/components/shared/utils/PrioritySelect';
import { FormInput, FormTextarea, LocationAutocompleteInput } from '@/components/shared/form';
import { useTaskFormLogic } from '@/hooks/forms/useTaskFormLogic';
import { MobileTaskSubtaskSection } from './task/MobileTaskSubtaskSection';
import { MobileTaskParentSelectorOverlay } from './task/MobileTaskParentSelectorOverlay';

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
  initialDate,
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
              onChange={(e) => setNewTaskForm({ ...newTaskForm, titolo: e.target.value })}
            />
          </div>

          {/* Rigo 2: Descrizione */}
          <div className="w-full">
            <FormTextarea
              label="Descrizione"
              placeholder="Aggiungi dettagli o note..."
              value={newTaskForm.descrizione}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, descrizione: e.target.value })}
              className="h-20"
            />
          </div>

          {/* Rigo 3: Sottotask con selezione in Overlay */}
          <MobileTaskSubtaskSection
            isSubtaskPanelOpen={isSubtaskPanelOpen}
            onToggleSubtask={handleToggleSubtaskCheckbox}
            parentTaskTitle={parentTaskTitle}
            onOpenParentOverlay={() => setIsSubtaskOverlayOpen(true)}
          />

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
              onChange={(val) => setNewTaskForm({ ...newTaskForm, priorita: val })}
              overlay={true}
            />
          </div>

          {/* Rigo 6: Categoria */}
          <div className="w-full">
            <CategorySelect
              value={newTaskForm.category}
              onChange={(catName) => setNewTaskForm({ ...newTaskForm, category: catName })}
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
      <MobileTaskParentSelectorOverlay
        isOpen={isSubtaskOverlayOpen}
        onClose={() => setIsSubtaskOverlayOpen(false)}
        tasks={tasks}
        selectedParentId={newTaskForm.parent_id}
        maxDepth={maxDepth}
        onSelectParent={(id) => setNewTaskForm((prev) => ({ ...prev, parent_id: String(id) }))}
        onMaxDepthReached={() =>
          confirm({
            title: 'Attenzione',
            message: `Limite di ${maxDepth} livelli raggiunto.`,
            isDestructive: false,
            onConfirm: () => {},
          })
        }
      />
    </>
  );
};

export default MobileTaskNewModal;
