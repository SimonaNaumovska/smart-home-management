import { useState, useMemo } from "react";
import type { Product } from "../../types/Product";

interface UseShoppingListProps {
  products: Product[];
}

export function useShoppingList({ products }: UseShoppingListProps) {
  const [filter, setFilter] = useState<"all" | "food" | "cleaning">("all");
  const [sortBy, setSortBy] = useState<"name" | "category">("category");

  // Get items to buy
  const shoppingItems = useMemo(
    () => products.filter((p) => p.toBuy),
    [products],
  );

  // Filter by category
  const filteredItems = useMemo(() => {
    if (filter === "all") {
      return shoppingItems;
    }
    return shoppingItems.filter((p) => p.category === filter);
  }, [filter, shoppingItems]);

  // Sort items
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else {
        return a.category.localeCompare(b.category);
      }
    });
  }, [filteredItems, sortBy]);

  // Group by category for better visualization
  const groupedByCategory = useMemo(() => {
    return sortedItems.reduce(
      (acc, item) => {
        const category = item.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      },
      {} as Record<string, Product[]>,
    );
  }, [sortedItems]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: shoppingItems.length,
      food: shoppingItems.filter((p) => p.category === "food").length,
      cleaning: shoppingItems.filter((p) => p.category === "cleaning").length,
    };
  }, [shoppingItems]);

  // Helper functions
  const getCategoryColor = (category: string) => {
    if (category === "food") return "#FFE0B2";
    if (category === "cleaning") return "#C8E6C9";
    return "#E0E0E0";
  };

  const getCategoryEmoji = (category: string) => {
    if (category === "food") return "🛒";
    if (category === "cleaning") return "🧹";
    return "📦";
  };

  return {
    filter,
    setFilter,
    sortBy,
    setSortBy,
    shoppingItems,
    sortedItems,
    groupedByCategory,
    stats,
    getCategoryColor,
    getCategoryEmoji,
  };
}
