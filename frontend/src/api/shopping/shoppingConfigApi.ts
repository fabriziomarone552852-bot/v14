// src/api/shopping/shoppingConfigApi.ts
import type {
  ShoppingConfigBundle,
  ShoppingProductOption,
} from '@/types/shopping';
import { apiRequest, toNumberOrNull } from './shoppingClient';

export type ConfigOptionApi = {
  id: number;
  value?: string | null;
  label?: string | null;
  code_value?: string | null;
  code_name?: string | null;
  display_name?: string | null;
  description?: string | null;
  sort_order?: number | null;
  is_active?: boolean;
};

export type ShoppingConfigBundleApi = {
  unitOptions?: ConfigOptionApi[];
  currencyOptions?: ConfigOptionApi[];
  offerFlagOptions?: ConfigOptionApi[];
  visibilityOptions?: ConfigOptionApi[];
  listStatusOptions?: ConfigOptionApi[];
  itemStatusOptions?: ConfigOptionApi[];
  groupRoleOptions?: ConfigOptionApi[];
  groupStatusOptions?: ConfigOptionApi[];
  supplierStatusOptions?: ConfigOptionApi[];
};

export type ShoppingProductOptionApi = {
  id: number;
  name_normalized?: string | null;
  display_name?: string | null;
  default_unit_id?: number | null;
  default_unit_name?: string | null;
  default_unit_code_name?: string | null;
  last_purchase_price?: number | string | null;
  last_purchase_currency_id?: number | null;
  last_purchase_currency_code_name?: string | null;
  last_supplier_id?: number | null;
  last_supplier_name?: string | null;
  last_purchase_date?: string | null;
};

export function normalizeShoppingConfigBundle(
  config: ShoppingConfigBundleApi
): ShoppingConfigBundle {
  const normalize = (option: ConfigOptionApi) => {
    const codeName = option.code_name ?? option.label ?? option.value ?? '';
    const displayName = option.display_name ?? option.label ?? codeName;

    return {
      id: Number(option.id),
      codeName: codeName,
      displayName: displayName,
    };
  };

  return {
    unitOptions: (config.unitOptions ?? []).map(normalize),
    currencyOptions: (config.currencyOptions ?? []).map(normalize),
    offerFlagOptions: (config.offerFlagOptions ?? []).map(normalize),
    visibilityOptions: (config.visibilityOptions ?? []).map(normalize),
    listStatusOptions: (config.listStatusOptions ?? []).map(normalize),
    itemStatusOptions: (config.itemStatusOptions ?? []).map(normalize),
    groupRoleOptions: (config.groupRoleOptions ?? []).map(normalize),
    supplierStatusOptions: (config.supplierStatusOptions ?? []).map(normalize),
  };
}

export function normalizeShoppingProductOption(
  product: ShoppingProductOptionApi
): ShoppingProductOption {
  return {
    id: Number(product.id),
    nameNormalized: product.name_normalized ?? '',
    displayName: product.display_name ?? product.name_normalized ?? '',
    defaultUnitId: product.default_unit_id ?? null,
    defaultUnitCodeName:
      product.default_unit_code_name ?? product.default_unit_name ?? null,
    lastPurchasePrice: toNumberOrNull(product.last_purchase_price),
    lastPurchaseCurrencyId: product.last_purchase_currency_id ?? null,
    lastPurchaseCurrencyCodeName:
      product.last_purchase_currency_code_name ?? null,
    lastSupplierId: product.last_supplier_id ?? null,
    lastSupplierName: product.last_supplier_name ?? null,
    lastPurchaseDate: product.last_purchase_date ?? null,
  };
}

export async function fetchShoppingConfig(
  signal?: AbortSignal
): Promise<ShoppingConfigBundle> {
  const data = await apiRequest<ShoppingConfigBundleApi>('/config', {
    method: 'GET',
    signal,
  });

  return normalizeShoppingConfigBundle(data ?? {});
}

export async function fetchShoppingProducts(
  signal?: AbortSignal
): Promise<ShoppingProductOption[]> {
  const data = await apiRequest<ShoppingProductOptionApi[]>('/products', {
    method: 'GET',
    signal,
  });

  return (data ?? []).map(normalizeShoppingProductOption);
}
