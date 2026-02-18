import { useState, useEffect } from "react";
import type { Product } from "../../types/Product";

interface UseMobileInventoryViewProps {
  products: Product[];
}

export const useMobileInventoryView = ({
  products,
}: UseMobileInventoryViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingButton(window.scrollY > 300);
      if (fabMenuOpen) setFabMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fabMenuOpen]);

  const getStockStatus = (
    product: Product,
  ): "high" | "medium" | "low" | "none" => {
    if (product.quantity === 0) return "none";
    if (product.quantity <= product.minStock) return "low";
    if (product.quantity <= product.minStock * 1.5) return "medium";
    return "high";
  };

  const getStockIcon = (status: string): string => {
    switch (status) {
      case "high":
        return "🟢";
      case "medium":
        return "🟡";
      case "low":
        return "🔴";
      case "none":
        return "⚫";
      default:
        return "⚪";
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const categorizedProducts = filteredProducts.reduce(
    (acc, product) => {
      const category = product.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
      return acc;
    },
    {} as Record<string, Product[]>,
  );

  const lowStockProducts = filteredProducts.filter(
    (p) => getStockStatus(p) === "low" || getStockStatus(p) === "none",
  );
  
  const frequentProducts = filteredProducts.filter((p) => p.frequentlyUsed);

  const handleProductTap = (product: Product) => {
    setSelectedProduct(product);
    setEditingProduct({ ...product });
    setIsBottomSheetOpen(true);
  };

  const closeBottomSheet = () => {
    setIsBottomSheetOpen(false);
    setSelectedProduct(null);
    setEditingProduct(null);
  };

  return {
    searchQuery,
    expandedCategory,
    selectedProduct,
    isBottomSheetOpen,
    editingProduct,
    showFloatingButton,
    fabMenuOpen,
    filteredProducts,
    categorizedProducts,
    lowStockProducts,
    frequentProducts,
    setSearchQuery,
    setExpandedCategory,
    setEditingProduct,
    setFabMenuOpen,
    getStockStatus,
    getStockIcon,
    handleProductTap,
    closeBottomSheet,
  };
};
