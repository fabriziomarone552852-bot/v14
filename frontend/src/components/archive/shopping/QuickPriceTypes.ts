export interface QuickPriceRow {
  id: string;
  productName: string;
  brandName: string;
  brandId: string;
  price: string;
  quantity: string;
  unitId: string;
  purchaseDate: string;
  supplierId: string;
  isOnSale: boolean;
}

export interface DropdownOption {
  value: string;
  label: string;
}
