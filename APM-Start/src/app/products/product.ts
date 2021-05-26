/* Defines the product entity */
export interface Product {
  id: number;
  productName: string;
  productCode?: string; //question mark means they are nullable fields
  description?: string;
  price?: number;
  categoryId?: number;
  quantityInStock?: number;
  searchKey?: string[];
  supplierIds?: number[];
}
