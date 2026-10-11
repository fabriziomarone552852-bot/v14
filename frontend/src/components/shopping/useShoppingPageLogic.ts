import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useShoppingCoreListLogic } from '@/hooks/shopping/useShoppingCoreListLogic';
import { useShoppingGroupActions } from '@/hooks/shopping/useShoppingGroupActions';

export const useShoppingPageLogic = () => {
  const queryClient = useQueryClient();
  const core = useShoppingCoreListLogic();

  const {
    refreshGroups,
    refreshLists,
    groups,
    searchParams,
    setSearchParams,
  } = core;

  // Gestione Azioni Gruppi (Desktop)
  const groupActions = useShoppingGroupActions({ refreshGroups, refreshLists, queryClient });
  const { detailGroup, setDetailGroup } = groupActions;

  // Apertura automatica dettaglio gruppo da URL (?openGroup=ID)
  const paramOpenGroup = searchParams.get('openGroup');
  useEffect(() => {
    if (paramOpenGroup && groups.length > 0 && !detailGroup) {
      const parsed = parseInt(paramOpenGroup, 10);
      if (!isNaN(parsed) && parsed > 0) {
        const group = groups.find((g) => g.id === parsed);
        if (group) {
          setDetailGroup(group);
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('openGroup');
          setSearchParams(newParams, { replace: true });
        }
      }
    }
  }, [paramOpenGroup, groups, detailGroup, setDetailGroup, searchParams, setSearchParams]);

  return {
    queryClient,
    ...core,
    ...groupActions,
    // Alias retrocompatibili per viste desktop
    handleCreateListInGroupModal: core.handleOpenCreateGroupList,
    handleSaveModalListSubmit: core.handleSaveEditList,
  };
};
