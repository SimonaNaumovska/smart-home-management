import { useState } from "react";
import type { Product } from "../../types/Product";

interface UseConsumptionLoggerProps {
  products: Product[];
  onLogConsumption: (productId: string, amount: number) => void;
}

export const useConsumptionLogger = ({
  products,
  onLogConsumption,
}: UseConsumptionLoggerProps) => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [amount, setAmount] = useState("");

  const foodProducts = products.filter((p) => p.category === "Food & Beverage");
  const selectedProductData = products.find((p) => p.id === selectedProduct);

  const handleLog = () => {
    if (!selectedProduct || !amount) return;

    onLogConsumption(selectedProduct, Number(amount));
    setSelectedProduct("");
    setAmount("");
  };

  return {
    selectedProduct,
    amount,
    foodProducts,
    selectedProductData,
    setSelectedProduct,
    setAmount,
    handleLog,
  };
};
