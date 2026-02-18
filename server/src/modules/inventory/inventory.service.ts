import supabase from "../../config/supabase";
import { AppError } from "../../middleware/errorHandler";
import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  GetProductsQuery,
} from "./inventory.types";

export class InventoryService {
  /**
   * Get all products for a household
   */
  async getProducts(query: GetProductsQuery): Promise<Product[]> {
    let queryBuilder = supabase
      .from("products")
      .select("*")
      .eq("householdId", query.householdId);

    // Apply filters
    if (query.category) {
      queryBuilder = queryBuilder.eq("category", query.category);
    }

    if (query.toBuy !== undefined) {
      queryBuilder = queryBuilder.eq("toBuy", query.toBuy);
    }

    if (query.search) {
      queryBuilder = queryBuilder.ilike("name", `%${query.search}%`);
    }

    // Apply pagination
    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder = queryBuilder.range(
        query.offset,
        query.offset + (query.limit || 50) - 1,
      );
    }

    // Order by name
    queryBuilder = queryBuilder.order("name", { ascending: true });

    const { data, error } = await queryBuilder;

    if (error) {
      throw new AppError(`Failed to fetch products: ${error.message}`, 500);
    }

    return data || [];
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string, householdId: string): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("householdId", householdId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new AppError("Product not found", 404);
      }
      throw new AppError(`Failed to fetch product: ${error.message}`, 500);
    }

    return data;
  }

  /**
   * Create a new product
   */
  async createProduct(productData: CreateProductDTO): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .insert({
        ...productData,
        toBuy: productData.toBuy ?? false,
        frequentlyUsed: productData.frequentlyUsed ?? false,
      })
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to create product: ${error.message}`, 500);
    }

    return data;
  }

  /**
   * Update an existing product
   */
  async updateProduct(
    id: string,
    householdId: string,
    updates: UpdateProductDTO,
  ): Promise<Product> {
    // Verify product exists and belongs to household
    await this.getProductById(id, householdId);

    const { data, error } = await supabase
      .from("products")
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("householdId", householdId)
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to update product: ${error.message}`, 500);
    }

    return data;
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string, householdId: string): Promise<void> {
    // Verify product exists and belongs to household
    await this.getProductById(id, householdId);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .eq("householdId", householdId);

    if (error) {
      throw new AppError(`Failed to delete product: ${error.message}`, 500);
    }
  }

  /**
   * Mark product as to buy
   */
  async markToBuy(
    id: string,
    householdId: string,
    toBuy: boolean,
  ): Promise<Product> {
    return this.updateProduct(id, householdId, { toBuy });
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(householdId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("householdId", householdId)
      .filter("quantity", "lte", "minStock")
      .order("quantity", { ascending: true });

    if (error) {
      throw new AppError(
        `Failed to fetch low stock products: ${error.message}`,
        500,
      );
    }

    return data || [];
  }
}

export default new InventoryService();
