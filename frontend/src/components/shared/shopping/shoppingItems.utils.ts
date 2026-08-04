import type { ConfigOption } from '../../../types/shopping';
import { getLocalTodayStr } from '../../../utils/dateUtils';

export interface ItemFormState {
  shoppingListId: string;
  productName: string; // REFACTOR: Usa productName invece di nameOriginal
  quantity: string;
  unitId: string;
  notes: string;
}

export interface PurchaseFormState {
  supplierId: string;
  price: string;
  purchaseDate: string;
  currencyId: string;
  offerFlagId: string;
}

export const emptyItemForm = (shoppingListId = ''): ItemFormState => ({
  shoppingListId,
  productName: '', // REFACTOR: Usa productName
  quantity: '',
  unitId: '',
  notes: '',
  statusId: '',
});

export const emptyPurchaseForm = (
  defaultCurrencyId = ''
): PurchaseFormState => ({
  supplierId: '',
  price: '',
  purchaseDate: getLocalTodayStr(),
  currencyId: defaultCurrencyId,
  offerFlagId: '',
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