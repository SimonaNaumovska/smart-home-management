export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  purchased: string;
  useBy?: string;
  storage: string;
  toBuy: boolean;
  frequentlyUsed: boolean;
  householdId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDTO {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  purchased: string;
  useBy?: string;
  storage: string;
  toBuy?: boolean;
  frequentlyUsed?: boolean;
  householdId: string;
}

export interface UpdateProductDTO {
  name?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  minStock?: number;
  purchased?: string;
  useBy?: string;
  storage?: string;
  toBuy?: boolean;
  frequentlyUsed?: boolean;
}

export interface GetProductsQuery {
  householdId: string;
  category?: string;
  toBuy?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}
