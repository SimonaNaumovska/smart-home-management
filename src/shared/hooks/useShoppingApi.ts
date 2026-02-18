import { useState, useEffect, useCallback, useRef } from "react";
import type { Product } from "../../types/Product";
import { shoppingApi } from "../../api/shoppingApi";

/**
 * useShoppingApi Hook - Backend API Version
 * Uses Express backend to fetch products with toBuy = true
 *
 * Note: This hook focuses on shopping list operations
 * For full product management, use useProductsApi
 */
export const useShoppingApi = (householdId: string) => {
  const [shoppingItems, setShoppingItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if this is the initial load
  const isInitialLoadRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingTimeoutRef = useRef<number | null>(null);

  // Fetch shopping items from backend
  const fetchShoppingItems = useCallback(
    async (showLoading = true) => {
      if (!householdId) return;

      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        // Only show loading on initial load, not on polls
        if (showLoading && isInitialLoadRef.current) {
          setLoading(true);
        }

        const data = await shoppingApi.getShoppingItems(householdId);
        setShoppingItems(data);
        setError(null);

        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Failed to fetch shopping items",
        );
        console.error("Error fetching shopping items:", err);
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [householdId],
  );

  // Setup polling with proper cleanup
  useEffect(() => {
    // Initial fetch
    fetchShoppingItems(true);

    // Setup polling - fetch without showing loading
    const startPolling = () => {
      pollingTimeoutRef.current = setTimeout(() => {
        fetchShoppingItems(false).then(() => {
          // Schedule next poll after this one completes
          startPolling();
        });
      }, 5000);
    };

    startPolling();

    // Cleanup
    return () => {
      // Clear polling timeout
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }

      // Cancel in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Reset initial load flag
      isInitialLoadRef.current = true;
    };
  }, [fetchShoppingItems]);

  const markPurchased = async (productId: string) => {
    const product = shoppingItems.find((p) => p.id === productId);
    if (!product) return;

    const oldProduct = { ...product };

    try {
      // Optimistic update - remove from shopping list (assumes toBuy becomes false)
      setShoppingItems((prev) => prev.filter((p) => p.id !== productId));
      setError(null);

      // Call backend with current quantity
      const updatedProduct = await shoppingApi.markPurchased(
        productId,
        householdId,
        product.quantity,
      );

      // If item still has toBuy=true (edge case), add it back
      if (updatedProduct.toBuy) {
        setShoppingItems((prev) => {
          const exists = prev.find((p) => p.id === productId);
          if (!exists) {
            return [...prev, updatedProduct];
          }
          return prev.map((p) => (p.id === productId ? updatedProduct : p));
        });
      }
    } catch (err) {
      // Rollback on error - restore item
      setShoppingItems((prev) => {
        const exists = prev.find((p) => p.id === productId);
        if (!exists) {
          return [...prev, oldProduct];
        }
        return prev;
      });
      const errorMsg =
        err instanceof Error ? err.message : "Failed to mark as purchased";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const removeFromList = async (productId: string) => {
    const originalIndex = shoppingItems.findIndex((p) => p.id === productId);
    const productToRemove = shoppingItems[originalIndex];

    try {
      // Optimistic update
      setShoppingItems((prev) => prev.filter((p) => p.id !== productId));
      setError(null);

      // Call backend - toggle toBuy to false
      await shoppingApi.removeFromShoppingList(productId, householdId);
    } catch (err) {
      // Rollback on error - restore at original position
      if (productToRemove && originalIndex !== -1) {
        setShoppingItems((prev) => {
          const newItems = [...prev];
          newItems.splice(originalIndex, 0, productToRemove);
          return newItems;
        });
      }
      const errorMsg =
        err instanceof Error ? err.message : "Failed to remove from list";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const addToList = async (productId: string, product: Product) => {
    try {
      // Optimistic update
      if (!shoppingItems.find((p) => p.id === productId)) {
        setShoppingItems((prev) => [...prev, { ...product, toBuy: true }]);
      }
      setError(null);

      // Call backend
      const updatedProduct = await shoppingApi.addToShoppingList(
        productId,
        householdId,
      );

      // Sync with server response
      setShoppingItems((prev) =>
        prev.map((p) => (p.id === productId ? updatedProduct : p)),
      );
    } catch (err) {
      // Rollback on error
      setShoppingItems((prev) => prev.filter((p) => p.id !== productId));
      const errorMsg =
        err instanceof Error ? err.message : "Failed to add to list";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Manual refetch function
  const refetch = useCallback(() => {
    fetchShoppingItems(true);
  }, [fetchShoppingItems]);

  return {
    shoppingItems,
    loading,
    error,
    markPurchased,
    removeFromList,
    addToList,
    refetch,
  };
};
