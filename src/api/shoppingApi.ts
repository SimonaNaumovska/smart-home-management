import type { Product } from "../types/Product";
import { inventoryApi } from "./inventoryApi";

/**
 * Shopping API Service - Leverages Inventory API
 * Shopping list is a filtered view of products where toBuy = true
 * All mutations use the existing inventory endpoints
 */
class ShoppingApiService {
  /**
   * Get all shopping items (products with toBuy = true)
   */
  async getShoppingItems(householdId: string): Promise<Product[]> {
    return inventoryApi.getProducts({ householdId, toBuy: true });
  }

  /**
   * Get shopping items filtered by category
   */
  async getShoppingItemsByCategory(
    householdId: string,
    category: string,
  ): Promise<Product[]> {
    return inventoryApi.getProducts({ householdId, toBuy: true, category });
  }

  /**
   * Mark item as purchased (delegates to inventory API)
   * Increases quantity by 1 and sets toBuy to false
   */
  async markPurchased(
    productId: string,
    householdId: string,
    currentQuantity: number,
  ): Promise<Product> {
    return inventoryApi.updateProduct(productId, householdId, {
      quantity: currentQuantity + 1,
      toBuy: false,
    });
  }

  /**
   * Remove item from shopping list (set toBuy to false)
   */
  async removeFromShoppingList(
    productId: string,
    householdId: string,
  ): Promise<Product> {
    return inventoryApi.markToBuy(productId, householdId, false);
  }

  /**
   * Add item to shopping list (set toBuy to true)
   */
  async addToShoppingList(
    productId: string,
    householdId: string,
  ): Promise<Product> {
    return inventoryApi.markToBuy(productId, householdId, true);
  }
}

export const shoppingApi = new ShoppingApiService();
