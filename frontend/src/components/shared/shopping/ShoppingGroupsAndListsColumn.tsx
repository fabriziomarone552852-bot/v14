// src/components/shared/shopping/ShoppingGroupsAndListsColumn.tsx
import React, { useMemo, useState } from 'react';
import type { ConfigOption, ShoppingGroupSummary, ShoppingListSummary } from '@/types/shopping';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useModal } from '@/hooks/useModals';
import { AddButton } from '@/components/shared/utils/AddButton';
import { UsersIcon } from '@/components/shared/utils/Icons';
import { ShoppingListModal, makeEmptyForm, type ListFormState } from './ShoppingListModal';
import { ShoppingPersonalListsSection } from './ShoppingPersonalListsSection';
import { ShoppingGroupAccordionSection } from './ShoppingGroupAccordionSection';

interface ShoppingGroupsAndListsColumnProps {
  groups: ShoppingGroupSummary[];
  lists: ShoppingListSummary[];
  loadingGroups?: boolean;
  loadingLists?: boolean;
  activeListId: number | null;
  setActiveListId: (id: number | null) => void;
  listVisibilityOptions: ConfigOption[];
  listStatusOptions: ConfigOption[];
  onCreateGroup?: () => void;
  onOpenGroupDetail?: (group: ShoppingGroupSummary) => void;
  className?: string;
}

const getAvatarBg = (id: number) => {
  const palettes = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-teal-100 text-teal-700 border-teal-200',
  ];
  return palettes[id % palettes.length];
};

const ShoppingGroupsAndListsColumn: React.FC<ShoppingGroupsAndListsColumnProps> = ({
  groups,
  lists,
  loadingGroups = false,
  loadingLists: _loadingLists = false,
  activeListId,
  setActiveListId,
  listVisibilityOptions,
  listStatusOptions,
  onCreateGroup,
  onOpenGroupDetail,
  className = '',
}) => {
  const mutations = useShoppingMutations();
  const createModal = useModal<null>();

  const [form, setForm] = useState<ListFormState>(() => makeEmptyForm(''));
  const [isPersonalExpanded, setIsPersonalExpanded] = useState<boolean>(false);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Record<number, boolean>>({});

  const togglePersonalExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPersonalExpanded((prev) => !prev);
  };

  const toggleGroupExpanded = (groupId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedGroupIds((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const groupVisibilityId = useMemo(() => {
    const opt = listVisibilityOptions.find(
      (o) => o.codeValue?.toLowerCase() === 'group' || o.codeName?.toLowerCase() === 'group'
    );
    return opt ? Number(opt.id) : 2;
  }, [listVisibilityOptions]);

  const privateVisibilityId = useMemo(() => {
    const opt = listVisibilityOptions.find(
      (o) => o.codeValue?.toLowerCase() === 'private' || o.codeName?.toLowerCase() === 'private'
    );
    return opt ? Number(opt.id) : 1;
  }, [listVisibilityOptions]);

  const activeStatusId = useMemo(() => {
    const opt = listStatusOptions.find(
      (o) => o.codeValue?.toLowerCase() === 'active' || o.codeName?.toLowerCase() === 'active'
    );
    return opt ? Number(opt.id) : undefined;
  }, [listStatusOptions]);

  const personalLists = useMemo(() => {
    return lists.filter((l) => !l.groupId);
  }, [lists]);

  const listsByGroupId = useMemo(() => {
    const map = new Map<number, ShoppingListSummary[]>();
    for (const list of lists) {
      if (list.groupId) {
        const current = map.get(list.groupId) || [];
        current.push(list);
        map.set(list.groupId, current);
      }
    }
    return map;
  }, [lists]);

  const sortedActiveGroups = useMemo(() => {
    const active = groups.filter((g) => !g.archivedAt && !g.isArchived);
    return [...active].sort((a, b) => {
      const aLists = listsByGroupId.get(a.id) || [];
      const bLists = listsByGroupId.get(b.id) || [];
      const aOpen = aLists.filter((l) => !l.isCompleted).length;
      const bOpen = bLists.filter((l) => !l.isCompleted).length;
      const aHasActive = aOpen > 0;
      const bHasActive = bOpen > 0;

      if (aHasActive && !bHasActive) return -1;
      if (!aHasActive && bHasActive) return 1;
      if (aOpen !== bOpen) return bOpen - aOpen;
      return a.name.localeCompare(b.name);
    });
  }, [groups, listsByGroupId]);

  const totalOpenListsCount = useMemo(() => {
    return lists.filter((l) => !l.isCompleted).length;
  }, [lists]);

  const openCreateModal = (defaultGroupId?: number) => {
    setForm(makeEmptyForm(defaultGroupId ? String(defaultGroupId) : ''));
    createModal.open(null);
  };

  const handleCreateList = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = form.name.trim();
    if (!trimmedName) return;

    const isGroup = Boolean(form.destinationValue);
    const visibilityId = isGroup ? groupVisibilityId : privateVisibilityId;
    const groupId = isGroup ? Number(form.destinationValue) : null;

    const newList = await mutations.createList({
      name: trimmedName,
      description: form.description.trim() || undefined,
      groupId,
      visibilityId,
      statusId: activeStatusId,
      isCompleted: false,
    });

    if (newList?.id) {
      setActiveListId(newList.id);
      if (groupId) {
        setExpandedGroupIds((prev) => ({ ...prev, [groupId]: true }));
      } else {
        setIsPersonalExpanded(true);
      }
    }

    setForm(makeEmptyForm(''));
    createModal.close();
  };

  return (
    <div className={`h-full min-h-0 flex flex-col justify-between ${className}`}>
      <div className="flex flex-col flex-1 min-h-0 w-full min-w-0">
        {/* Header Section */}
        <div className="flex items-center border-b pb-2 mb-3 shrink-0 w-full">
          <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-gray-500" />
            <span>Gruppi & Liste</span>
          </h3>

          <div className="flex-1 flex justify-center">
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 shadow-2xs"
              title="Totale liste spesa attive"
            >
              {totalOpenListsCount} {totalOpenListsCount === 1 ? 'lista aperta' : 'liste aperte'}
            </span>
          </div>
        </div>

        {/* Lista Fisarmonica Gruppi e Liste Spesa */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 w-full min-w-0 p-1 pr-1.5 custom-scrollbar">
          {/* Sezione Personale (Private) */}
          <ShoppingPersonalListsSection
            lists={personalLists}
            isExpanded={isPersonalExpanded}
            onToggleExpanded={togglePersonalExpanded}
            activeListId={activeListId}
            onSelectList={setActiveListId}
            onOpenCreateModal={() => openCreateModal()}
          />

          {/* Sezioni Gruppi Condivisi */}
          {loadingGroups ? (
            <p className="py-6 text-center text-xs text-gray-400 animate-pulse">
              Caricamento gruppi...
            </p>
          ) : (
            sortedActiveGroups.map((group) => (
              <ShoppingGroupAccordionSection
                key={group.id}
                group={group}
                lists={listsByGroupId.get(group.id) || []}
                isExpanded={Boolean(expandedGroupIds[group.id])}
                onToggleExpanded={(e) => toggleGroupExpanded(group.id, e)}
                onOpenGroupDetail={onOpenGroupDetail}
                activeListId={activeListId}
                onSelectList={setActiveListId}
                onOpenCreateModal={openCreateModal}
                avatarClass={getAvatarBg(group.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Footer: Tasto Nuovo Gruppo */}
      {onCreateGroup && (
        <div className="flex flex-col gap-2 mt-3 shrink-0 w-full">
          <AddButton
            label="Nuovo Gruppo"
            onClick={onCreateGroup}
          />
        </div>
      )}

      {/* Modal Creazione Lista */}
      {createModal.isOpen && (
        <ShoppingListModal
          title="Nuova Lista Spesa"
          form={form}
          setForm={setForm}
          groups={groups}
          onClose={createModal.close}
          onSubmit={handleCreateList}
          submitLabel="Crea Lista"
        />
      )}
    </div>
  );
};

export default ShoppingGroupsAndListsColumn;
