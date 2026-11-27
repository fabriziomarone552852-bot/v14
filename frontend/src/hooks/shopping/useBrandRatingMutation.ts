// src/hooks/shopping/useBrandRatingMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createShoppingBrand,
  saveProductBrandPreference,
  shoppingQueryKeys,
} from '@/api/shoppingApi';
import { showTrackerToast } from '@/components/trackers/shared/TrackerToast';
import type {
  ShoppingListItem,
  ShoppingListSummary,
  ShoppingProductOption,
} from '@/types/shopping';

export interface SaveBrandRatingArgs {
  productId: number;
  productName: string;
  brandId: number | null;
  brandName: string;
  shoppingListId?: number | null;
  notes: string | null;
}

/**
 * Custom hook con aggiornamento ottimistico a 0ms per modificare il giudizio (👍/👎 + commento)
 * di un brand associato a un prodotto, sincronizzando istantaneamente catalogo e righe lista in RAM.
 */
export function useBrandRatingMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ productId, brandId, brandName, notes }: SaveBrandRatingArgs) => {
      let resolvedBrandId = brandId;
      if (!resolvedBrandId) {
        const createdBrand = await createShoppingBrand(brandName.trim());
        resolvedBrandId = createdBrand.id;
      }
      return saveProductBrandPreference({
        productId,
        brandId: resolvedBrandId,
        notes,
      });
    },
    onMutate: async ({ productId, productName, brandId, brandName, shoppingListId, notes }) => {
      const cancelPromises: Promise<void>[] = [
        queryClient.cancelQueries({ queryKey: shoppingQueryKeys.products() }),
        queryClient.cancelQueries({ queryKey: shoppingQueryKeys.lists() }),
      ];
      if (shoppingListId != null) {
        cancelPromises.push(
          queryClient.cancelQueries({ queryKey: shoppingQueryKeys.items(shoppingListId) })
        );
      }
      await Promise.all(cancelPromises);

      const prevProducts = queryClient.getQueriesData<ShoppingProductOption[]>({
        queryKey: shoppingQueryKeys.products(),
      });
      const prevLists = queryClient.getQueriesData<ShoppingListSummary[]>({
        queryKey: shoppingQueryKeys.lists(),
      });
      const prevItems =
        shoppingListId != null
          ? queryClient.getQueriesData<ShoppingListItem[]>({
              queryKey: shoppingQueryKeys.items(shoppingListId),
            })
          : [];

      const normProd = productName.trim().toLowerCase();
      const normBrand = brandName.trim().toLowerCase();

      // 1. Aggiorna istantaneamente il catalogo prodotti in RAM
      queryClient.setQueriesData<ShoppingProductOption[]>(
        { queryKey: shoppingQueryKeys.products() },
        (old) => {
          if (!old) return old;
          return old.map((prod) => {
            const matchesProd =
              (productId > 0 && prod.id === productId) ||
              (prod.displayName || prod.nameNormalized || '').trim().toLowerCase() === normProd;
            if (!matchesProd) return prod;

            const existingLinks = prod.productBrands ?? [];
            const foundIdx = existingLinks.findIndex((pb) => {
              if (brandId && pb.brandId === brandId) return true;
              return (pb.brand?.nameNormalized || '').trim().toLowerCase() === normBrand;
            });

            if (foundIdx >= 0) {
              const nextLinks = existingLinks.map((pb, idx) =>
                idx === foundIdx ? { ...pb, notes } : pb
              );
              return { ...prod, productBrands: nextLinks };
            }

            return {
              ...prod,
              productBrands: [
                ...existingLinks,
                {
                  id: -Date.now(),
                  productId: prod.id,
                  brandId: brandId ?? 0,
                  notes,
                  brand: {
                    id: brandId ?? 0,
                    nameNormalized: brandName.trim(),
                    typeCode: 2,
                  },
                },
              ],
            };
          });
        }
      );

      // Helper per aggiornare eventuali righe lista che usano la stessa coppia prodotto + brand
      const patchListItemNotes = (it: ShoppingListItem): ShoppingListItem => {
        const sameProd =
          (productId > 0 && it.productId === productId) ||
          it.productName.trim().toLowerCase() === normProd;
        const sameBrand = (it.brandName || '').trim().toLowerCase() === normBrand;
        if (sameProd && sameBrand) {
          return { ...it, brandNotes: notes };
        }
        return it;
      };

      // 2. Aggiorna istantaneamente la lista attiva in RAM
      if (shoppingListId != null) {
        queryClient.setQueriesData<ShoppingListItem[]>(
          { queryKey: shoppingQueryKeys.items(shoppingListId) },
          (old) => (old ? old.map(patchListItemNotes) : old)
        );
      }

      // 3. Aggiorna istantaneamente anche gli items annidati nelle liste
      queryClient.setQueriesData<ShoppingListSummary[]>(
        { queryKey: shoppingQueryKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.map((list) =>
            list.items ? { ...list, items: list.items.map(patchListItemNotes) } : list
          );
        }
      );

      return { prevProducts, prevLists, prevItems, shoppingListId };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevProducts) {
        context.prevProducts.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
      if (context?.prevLists) {
        context.prevLists.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
      if (context?.prevItems) {
        context.prevItems.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
      showTrackerToast('Impossibile salvare il giudizio sul marchio. Riprova.', 'warning');
    },
    onSettled: (_data, _err, vars) => {
      const promises: Promise<void>[] = [
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.products() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.brands() }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.lists() }),
      ];
      if (vars.shoppingListId != null) {
        promises.push(
          queryClient.invalidateQueries({
            queryKey: shoppingQueryKeys.items(vars.shoppingListId),
          })
        );
      }
      void Promise.all(promises);
    },
  });

  return {
    saveBrandRating: (args: SaveBrandRatingArgs) => mutation.mutate(args),
  };
}
