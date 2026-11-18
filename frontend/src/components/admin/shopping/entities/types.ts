// src/components/admin/shopping/entities/types.ts
import type {
  ShoppingProductOption,
  ShoppingSupplierOption,
  ShoppingListSummary,
  ShoppingGroupSummary,
} from '@/types/shopping';

export type AdminShoppingEntityTab = 'products' | 'brands' | 'suppliers' | 'lists' | 'groups';

export interface EnrichedProductItem extends ShoppingProductOption {
  batchCount: number;
  draftName?: string;
  isSaving?: boolean;
}

export interface EnrichedBrandItem extends ShoppingSupplierOption {
  productCount: number;
  batchCount: number;
  draftName?: string;
  isSaving?: boolean;
}

export interface EnrichedSupplierItem extends ShoppingSupplierOption {
  batchCount: number;
  draftName?: string;
  isSaving?: boolean;
}

export interface EnrichedListItem extends ShoppingListSummary {
  itemCount: number;
  draftName?: string;
  draftDescription?: string;
  isSaving?: boolean;
}

export interface EnrichedGroupItem extends ShoppingGroupSummary {
  draftName?: string;
  draftDescription?: string;
  isSaving?: boolean;
}

export interface EntityFeedbackMessage {
  type: 'success' | 'error';
  text: string;
}
