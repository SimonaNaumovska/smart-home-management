import { useState, useEffect, useCallback, useRef } from "react";
import type { Product } from "../../types/Product";
import { inventoryApi } from "../../api/inventoryApi";

/**
 * useProducts Hook - Backend API Version
 * Uses Express backend instead of direct Supabase access
 *
 * Migration from useProducts (Supabase) to useProductsApi (Backend)
 * Note: Currently uses polling instead of real-time subscriptions
 */
export const useProductsApi = (householdId: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if this is the initial load
  const isInitialLoadRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollingTimeoutRef = useRef<number | null>(null);

  // Fetch products from backend
  const fetchProducts = useCallback(
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

        const data = await inventoryApi.getProducts({ householdId });
        setProducts(data);
        setError(null); // Clear any previous errors

        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Failed to fetch products",
        );
        console.error("Error fetching products:", err);
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
    fetchProducts(true);

    // Setup polling - fetch without showing loading
    const startPolling = () => {
      pollingTimeoutRef.current = setTimeout(() => {
        fetchProducts(false).then(() => {
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
  }, [fetchProducts]);

  const addProduct = async (product: Product) => {
    const tempId = crypto.randomUUID();
    const tempProduct = { ...product, id: tempId };

    try {
      // Optimistic update with temporary ID
      setProducts((prev) => [...prev, tempProduct]);
      setError(null);

      // Call backend (exclude id if present, backend will generate)
      const { id: _id, ...productWithoutId } = product as Product & {
        id?: string;
      };
      const newProduct = await inventoryApi.createProduct({
        ...productWithoutId,
        householdId,
      } as Omit<Product, "id">);

      // Replace temp product with real one from server
      setProducts((prev) =>
        prev.map((p) => (p.id === tempId ? newProduct : p)),
      );
    } catch (err) {
      // Rollback on error
      setProducts((prev) => prev.filter((p) => p.id !== tempId));
      const errorMsg =
        err instanceof Error ? err.message : "Failed to add product";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateProduct = async (product: Product) => {
    const oldProduct = products.find((p) => p.id === product.id);

    try {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? product : p)),
      );
      setError(null);

      // Call backend - only send updatable fields
      const { id, ...updates } = product;
      const result = await inventoryApi.updateProduct(id, householdId, updates);

      // Update with server response to ensure consistency
      setProducts((prev) => prev.map((p) => (p.id === result.id ? result : p)));
    } catch (err) {
      // Rollback on error
      if (oldProduct) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? oldProduct : p)),
        );
      }
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update product";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteProduct = async (productId: string) => {
    const oldProduct = products.find((p) => p.id === productId);
    const originalIndex = products.findIndex((p) => p.id === productId);

    try {
      // Optimistic update
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setError(null);

      // Call backend
      await inventoryApi.deleteProduct(productId, householdId);
    } catch (err) {
      // Rollback on error - restore to original position
      if (oldProduct && originalIndex !== -1) {
        setProducts((prev) => {
          const restored = [...prev];
          restored.splice(originalIndex, 0, oldProduct);
          return restored;
        });
      }
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete product";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const toggleToBuy = async (productId: string, toBuy: boolean) => {
    const oldProduct = products.find((p) => p.id === productId);

    try {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, toBuy } : p)),
      );
      setError(null);

      // Call backend
      const result = await inventoryApi.markToBuy(
        productId,
        householdId,
        toBuy,
      );

      // Update with server response
      setProducts((prev) => prev.map((p) => (p.id === result.id ? result : p)));
    } catch (err) {
      // Rollback on error
      if (oldProduct) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? oldProduct : p)),
        );
      }
      const errorMsg =
        err instanceof Error ? err.message : "Failed to toggle toBuy status";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const markPurchased = async (
    productId: string,
    quantity: number,
    _unit: string, // Not currently used, kept for API compatibility
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const newQuantity = product.quantity + quantity;
    const oldProduct = { ...product };

    try {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, quantity: newQuantity, toBuy: false }
            : p,
        ),
      );
      setError(null);

      // Call backend with only the fields that changed
      const result = await inventoryApi.updateProduct(productId, householdId, {
        quantity: newQuantity,
        toBuy: false,
      });

      // Update with server response
      setProducts((prev) => prev.map((p) => (p.id === result.id ? result : p)));
    } catch (err) {
      // Rollback on error
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? oldProduct : p)),
      );
      const errorMsg =
        err instanceof Error ? err.message : "Failed to mark purchased";
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const handleBulkAddItems = async (items: Partial<Product>[]) => {
    if (items.length === 0) return 0;

    try {
      setError(null);
      const createdProducts: Product[] = [];

      // Add items one by one
      for (const item of items) {
        // Build product without id (backend generates it)
        const newProduct: Omit<Product, "id"> = {
          name: item.name || "",
          category: item.category || "food",
          quantity: item.quantity ?? 0,
          unit: item.unit || "unit",
          minStock: item.minStock ?? 0,
          purchased: item.purchased || new Date().toISOString().split("T")[0],
          useBy: item.useBy || "",
          storage: item.storage || "",
          toBuy: item.toBuy ?? false,
          frequentlyUsed: item.frequentlyUsed ?? false,
          householdId,
        } as Omit<Product, "id">;

        const created = await inventoryApi.createProduct(newProduct);
        createdProducts.push(created);
      }

      // Add all created products to state at once
      setProducts((prev) => [...prev, ...createdProducts]);

      return createdProducts.length;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to bulk add items";
      setError(errorMsg);

      // Refetch to ensure consistency
      await fetchProducts(false);

      throw new Error(errorMsg);
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleToBuy,
    markPurchased,
    handleBulkAddItems,
    refetch: () => fetchProducts(true),
  };
};
