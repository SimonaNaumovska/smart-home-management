import { api } from "./client";
import type { Product } from "../types/Product";

interface ApiResponse<T> {
  status: string;
  data: T;
  count?: number;
}

interface GetProductsParams {
  householdId: string;
  category?: string;
  toBuy?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Inventory API Service - Connects to Express Backend
 * Uses the shared api() helper for consistent API calls
 */
class InventoryApiService {
  /**
   * Get all products for a household
   */
  async getProducts(params: GetProductsParams): Promise<Product[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("householdId", params.householdId);

    if (params.category) queryParams.append("category", params.category);
    if (params.toBuy !== undefined)
      queryParams.append("toBuy", params.toBuy.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset) queryParams.append("offset", params.offset.toString());

    const result: ApiResponse<Product[]> = await api(
      `/inventory?${queryParams}`,
    );
    return result.data;
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string, householdId: string): Promise<Product> {
    const result: ApiResponse<Product> = await api(
      `/inventory/${id}?householdId=${householdId}`,
    );
    return result.data;
  }

  /**
   * Create a new product
   */
  async createProduct(product: Omit<Product, "id">): Promise<Product> {
    const result: ApiResponse<Product> = await api("/inventory", {
      method: "POST",
      body: JSON.stringify(product),
    });
    return result.data;
  }

  /**
   * Update an existing product
   */
  async updateProduct(
    id: string,
    householdId: string,
    updates: Partial<Product>,
  ): Promise<Product> {
    const result: ApiResponse<Product> = await api(
      `/inventory/${id}?householdId=${householdId}`,
      {
        method: "PATCH",
        body: JSON.stringify(updates),
      },
    );
    return result.data;
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string, householdId: string): Promise<void> {
    await api(`/inventory/${id}?householdId=${householdId}`, {
      method: "DELETE",
    });
  }

  /**
   * Mark product as to buy or not
   */
  async markToBuy(
    id: string,
    householdId: string,
    toBuy: boolean,
  ): Promise<Product> {
    const result: ApiResponse<Product> = await api(
      `/inventory/${id}/mark-to-buy?householdId=${householdId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ toBuy }),
      },
    );
    return result.data;
  }

  /**
   * Get products with low stock
   */
  async getLowStockProducts(householdId: string): Promise<Product[]> {
    const result: ApiResponse<Product[]> = await api(
      `/inventory/low-stock?householdId=${householdId}`,
    );
    return result.data;
  }
}

export const inventoryApi = new InventoryApiService();
