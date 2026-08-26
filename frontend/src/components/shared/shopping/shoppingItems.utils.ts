// src/components/shared/shopping/shoppingItems.utils.ts
import type { ConfigOption } from '@/types/shopping';
import { getLocalTodayStr } from '@/utils/dateUtils';

export interface ItemFormState {
  shoppingListId: string;
  productName: string;
  brandName: string;
  brandId: string;
  quantity: string;
  unitId: string;
  notes: string;
}

export interface PurchaseFormState {
  quantity: string;
  supplierId: string;
  brandName: string;
  brandId: string;
  price: string;
  purchaseDate: string;
  currencyId: string;
  offerFlagId: string;
  isOnSale: boolean;
}

export const emptyItemForm = (shoppingListId = ''): ItemFormState => ({
  shoppingListId,
  productName: '',
  brandName: '',
  brandId: '',
  quantity: '',
  unitId: '',
  notes: '',
});

export const emptyPurchaseForm = (
  defaultCurrencyId = '',
  defaultQuantity = '1',
  defaultBrandName = '',
  defaultBrandId = ''
): PurchaseFormState => ({
  quantity: defaultQuantity,
  supplierId: '',
  brandName: defaultBrandName,
  brandId: defaultBrandId,
  price: '',
  purchaseDate: getLocalTodayStr(),
  currencyId: defaultCurrencyId,
  offerFlagId: '',
  isOnSale: false,
});

export const getConfigOptionLabel = (option: ConfigOption): string =>
  option.displayName?.trim() ||
  option.codeName?.trim() ||
  option.description?.trim() ||
  String(option.id);

export const getEurCurrencyId = (currencyOptions: ConfigOption[]): string =>
  currencyOptions.find(
    (option) =>
      option.codeValue?.toUpperCase() === 'EUR' ||
      option.codeName?.toUpperCase() === 'EUR'
  )?.id?.toString() ?? '';