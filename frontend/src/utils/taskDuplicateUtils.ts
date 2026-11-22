import type { DbTask, Priorita } from '@/types';

/**
 * Nodo leggero e immutabile che rappresenta una sottotask da clonare
 * al salvataggio della task principale duplicata.
 * Non include date né stato completato (tutte le copie nascono "da fare" e senza scadenza).
 */
export interface SubtaskTemplateNode {
  titolo: string;
  descrizione: string | null;
  priorita: Priorita;
  user_category_id: number | null;
  luogo: string | null;
  children: SubtaskTemplateNode[];
}

/**
 * Estrae esclusivamente l'albero dei discendenti SOTTO `rootTaskId` (escludendo
 * la task stessa e tutti i suoi eventuali antenati superiori).
 * Include sia sottotask aperte che completate, preservando l'intera gerarchia.
 */
export const extractDescendantSubtree = (
  flatTasks: DbTask[],
  rootTaskId: number
): SubtaskTemplateNode[] => {
  if (!Array.isArray(flatTasks) || flatTasks.length === 0) return [];

  const childrenByParent = new Map<number, DbTask[]>();
  flatTasks.forEach((task) => {
    if (task.parent_id != null) {
      const siblings = childrenByParent.get(task.parent_id) ?? [];
      siblings.push(task);
      childrenByParent.set(task.parent_id, siblings);
    }
  });

  const visited = new Set<number>([rootTaskId]);

  const buildNodes = (parentId: number): SubtaskTemplateNode[] => {
    const directChildren = childrenByParent.get(parentId) ?? [];
    const result: SubtaskTemplateNode[] = [];

    for (const child of directChildren) {
      if (visited.has(child.id)) continue;
      visited.add(child.id);

      const categoryId =
        child.user_category_id != null
          ? Number(child.user_category_id)
          : child.category?.id !== undefined
            ? Number(child.category.id)
            : null;

      result.push({
        titolo: child.titolo,
        descrizione: child.descrizione ?? null,
        priorita: child.priorita || 'Bassa',
        user_category_id: Number.isFinite(categoryId) ? categoryId : null,
        luogo: child.luogo ?? null,
        children: buildNodes(child.id),
      });
    }

    return result;
  };

  return buildNodes(rootTaskId);
};

/**
 * Conta il numero totale di sottotask presenti nell'albero da clonare.
 */
export const countSubtreeNodes = (nodes: SubtaskTemplateNode[]): number => {
  return nodes.reduce(
    (total, node) => total + 1 + countSubtreeNodes(node.children),
    0
  );
};

/**
 * Calcola quanti livelli extra di profondità si trovano sotto la task principale:
 * - 0 se non ci sono sottotask
 * - 1 se ci sono solo figli diretti
 * - 2 se ci sono figli + nipoti, ecc.
 */
export const getSubtreeMaxDepth = (nodes: SubtaskTemplateNode[]): number => {
  if (nodes.length === 0) return 0;
  return 1 + Math.max(...nodes.map((node) => getSubtreeMaxDepth(node.children)));
};
