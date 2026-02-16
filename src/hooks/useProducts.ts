import { useState, useEffect } from "react";
import type { Product } from "../types/Product";
import {
  syncProducts,
  addProduct as addProductDB,
  updateProduct as updateProductDB,
  deleteProduct as deleteProductDB,
  toggleToBuyStatus as toggleToBuyStatusDB,
  markItemPurchased as markItemPurchasedDB,
} from "../supabase/database";

export const useProducts = (householdId: string) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!householdId) return;

    const unsubscribe = syncProducts(householdId, (syncedProducts) => {
      setProducts(syncedProducts);
    });

    return () => {
      unsubscribe();
    };
  }, [householdId]);

  const addProduct = async (product: Product) => {
    setProducts((prev) => [...prev, product]);
    await addProductDB(householdId, product);
  };

  const updateProduct = async (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    await updateProductDB(householdId, product);
  };

  const deleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await deleteProductDB(householdId, productId);
  };

  const toggleToBuy = async (productId: string, toBuy: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, toBuy } : p)),
    );
    await toggleToBuyStatusDB(householdId, productId, toBuy);
  };

  const markPurchased = async (
    productId: string,
    quantity: number,
    unit: string,
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, quantity: p.quantity + quantity, toBuy: false }
          : p,
      ),
    );
    await markItemPurchasedDB(householdId, productId, quantity, unit);
  };

  const handleBulkAddItems = async (items: Partial<Product>[]) => {
    const newProducts = items.map((item) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
      category: item.category || "food",
      quantity: item.quantity || 0,
      unit: item.unit || "unit",
      minStock: item.minStock || 0,
      purchased: item.purchased || new Date().toISOString().split("T")[0],
      useBy: item.useBy || "",
    })) as Product[];

    setProducts((prev) => [...prev, ...newProducts]);

    for (const product of newProducts) {
      await addProductDB(householdId, product);
    }

    return newProducts.length;
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleToBuy,
    markPurchased,
    handleBulkAddItems,
  };
};
