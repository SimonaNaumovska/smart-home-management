import { useState } from "react";
import type { Product } from "../../types/Product";

interface UseInventoryDashboardProps {
  products: Product[];
}

export const useInventoryDashboard = ({
  products,
}: UseInventoryDashboardProps) => {
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterStorage, setFilterStorage] = useState<string>("All");
  const [sortBy, setSortBy] = useState<
    "name" | "category" | "quantity" | "useBy"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const storageLocations = ["All", ...new Set(products.map((p) => p.storage))];

  const getStockLevel = (product: Product): string => {
    if (product.quantity === 0) return "None";
    if (product.quantity <= product.minStock) return "Low";
    if (product.quantity <= product.minStock * 1.5) return "Medium";
    return "High";
  };

  const getStockLevelColor = (level: string): string => {
    switch (level) {
      case "None":
        return "#f44336";
      case "Low":
        return "#FF9800";
      case "Medium":
        return "#FFC107";
      case "High":
        return "#4CAF50";
      default:
        return "#9E9E9E";
    }
  };

  const isExpired = (product: Product): boolean => {
    if (!product.useBy) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(product.useBy);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate < today;
  };

  const expiresSoon = (product: Product): boolean => {
    if (!product.useBy) return false;
    const today = new Date();
    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiryDate = new Date(product.useBy);
    return expiryDate >= today && expiryDate <= in7Days;
  };

  let filteredProducts = products;
  if (filterCategory !== "All") {
    filteredProducts = filteredProducts.filter(
      (p) => p.category === filterCategory,
    );
  }
  if (filterStorage !== "All") {
    filteredProducts = filteredProducts.filter(
      (p) => p.storage === filterStorage,
    );
  }

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case "name":
        compareValue = a.name.localeCompare(b.name);
        break;
      case "category":
        compareValue = a.category.localeCompare(b.category);
        break;
      case "quantity":
        compareValue = a.quantity - b.quantity;
        break;
      case "useBy":
        if (!a.useBy && !b.useBy) compareValue = 0;
        else if (!a.useBy) compareValue = 1;
        else if (!b.useBy) compareValue = -1;
        else
          compareValue =
            new Date(a.useBy).getTime() - new Date(b.useBy).getTime();
        break;
    }

    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  const handleSort = (column: "name" | "category" | "quantity" | "useBy") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  return {
    filterCategory,
    filterStorage,
    sortBy,
    sortOrder,
    categories,
    storageLocations,
    sortedProducts,
    setFilterCategory,
    setFilterStorage,
    getStockLevel,
    getStockLevelColor,
    isExpired,
    expiresSoon,
    handleSort,
  };
};
