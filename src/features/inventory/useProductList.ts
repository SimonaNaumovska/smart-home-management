import { useState } from "react";
import type { Product } from "../../types/Product";

export const useProductList = () => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  return {
    editingProduct,
    setEditingProduct,
  };
};
