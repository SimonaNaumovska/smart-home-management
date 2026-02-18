import { useState, useEffect } from "react";
import type { Product } from "../../types/Product";

interface UseInventoryViewProps {
  onAddProduct: (product: Product) => void;
  onBulkAddItems: (items: Partial<Product>[]) => Promise<number>;
}

export const useInventoryView = ({
  onAddProduct,
  onBulkAddItems,
}: UseInventoryViewProps) => {
  // View management
  const [inventoryTab, setInventoryTab] = useState<"food" | "cleaning">("food");
  const [inventoryView, setInventoryView] = useState<
    "form" | "dashboard" | "receipt" | "barcode"
  >("dashboard");
  const [isMobileView, setIsMobileView] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Food form states
  const [foodName, setFoodName] = useState("");
  const [foodQuantity, setFoodQuantity] = useState("");
  const [foodUnit, setFoodUnit] = useState("kg");
  const [foodMinStock, setFoodMinStock] = useState("");
  const [foodPurchased, setFoodPurchased] = useState("");
  const [foodUseBy, setFoodUseBy] = useState("");
  const [foodStorage, setFoodStorage] = useState("");
  const [foodFrequentlyUsed, setFoodFrequentlyUsed] = useState(false);
  const [foodToBuy, setFoodToBuy] = useState(false);

  // Cleaning form states
  const [cleaningName, setCleaningName] = useState("");
  const [cleaningQuantity, setCleaningQuantity] = useState("");
  const [cleaningUnit, setCleaningUnit] = useState("L");
  const [cleaningMinStock, setCleaningMinStock] = useState("");
  const [cleaningPurchased, setCleaningPurchased] = useState("");
  const [cleaningStorage, setCleaningStorage] = useState("");
  const [cleaningFrequentlyUsed, setCleaningFrequentlyUsed] = useState(false);
  const [cleaningToBuy, setCleaningToBuy] = useState(false);

  // Business logic functions
  const addFoodProduct = () => {
    // Validate required fields
    if (!foodName || !foodName.trim()) {
      alert("Please enter an item name");
      return;
    }
    if (foodQuantity === "" || isNaN(Number(foodQuantity))) {
      alert("Please enter a valid quantity");
      return;
    }
    if (foodMinStock === "" || isNaN(Number(foodMinStock))) {
      alert("Please enter a valid minimum stock level");
      return;
    }

    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: foodName,
      category: "Food & Beverage",
      quantity: Number(foodQuantity),
      unit: foodUnit,
      minStock: Number(foodMinStock),
      purchased: foodPurchased,
      useBy: foodUseBy,
      storage: foodStorage,
      toBuy: foodToBuy,
      frequentlyUsed: foodFrequentlyUsed,
    };

    onAddProduct(newProduct);

    // reset form
    setFoodName("");
    setFoodQuantity("");
    setFoodUnit("kg");
    setFoodMinStock("");
    setFoodPurchased("");
    setFoodUseBy("");
    setFoodStorage("");
    setFoodFrequentlyUsed(false);
    setFoodToBuy(false);

    // Show success message and navigate back to dashboard
    alert(`✓ ${foodName} added successfully!`);
    setInventoryView("dashboard");
  };

  const addCleaningProduct = () => {
    // Validate required fields
    if (!cleaningName || !cleaningName.trim()) {
      alert("Please enter an item name");
      return;
    }
    if (cleaningQuantity === "" || isNaN(Number(cleaningQuantity))) {
      alert("Please enter a valid quantity");
      return;
    }
    if (cleaningMinStock === "" || isNaN(Number(cleaningMinStock))) {
      alert("Please enter a valid minimum stock level");
      return;
    }

    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: cleaningName,
      category: "Cleaning",
      quantity: Number(cleaningQuantity),
      unit: cleaningUnit,
      minStock: Number(cleaningMinStock),
      purchased: cleaningPurchased,
      useBy: "",
      storage: cleaningStorage,
      toBuy: cleaningToBuy,
      frequentlyUsed: cleaningFrequentlyUsed,
    };

    onAddProduct(newProduct);

    // reset form
    setCleaningName("");
    setCleaningQuantity("");
    setCleaningUnit("L");
    setCleaningMinStock("");
    setCleaningPurchased("");
    setCleaningStorage("");
    setCleaningFrequentlyUsed(false);
    setCleaningToBuy(false);

    // Show success message and navigate back to dashboard
    alert(`✓ ${cleaningName} added successfully!`);
    setInventoryView("dashboard");
  };

  const addProduct = () => {
    if (inventoryTab === "food") {
      addFoodProduct();
    } else {
      addCleaningProduct();
    }
  };

  const handleBulkAdd = async (items: Partial<Product>[]) => {
    const count = await onBulkAddItems(items);
    alert(`✅ Added ${count} items to inventory!`);
  };

  return {
    // View state
    inventoryTab,
    inventoryView,
    isMobileView,
    setInventoryTab,
    setInventoryView,

    // Food form state
    foodForm: {
      name: foodName,
      quantity: foodQuantity,
      unit: foodUnit,
      minStock: foodMinStock,
      purchased: foodPurchased,
      useBy: foodUseBy,
      storage: foodStorage,
      frequentlyUsed: foodFrequentlyUsed,
      toBuy: foodToBuy,
      setName: setFoodName,
      setQuantity: setFoodQuantity,
      setUnit: setFoodUnit,
      setMinStock: setFoodMinStock,
      setPurchased: setFoodPurchased,
      setUseBy: setFoodUseBy,
      setStorage: setFoodStorage,
      setFrequentlyUsed: setFoodFrequentlyUsed,
      setToBuy: setFoodToBuy,
    },

    // Cleaning form state
    cleaningForm: {
      name: cleaningName,
      quantity: cleaningQuantity,
      unit: cleaningUnit,
      minStock: cleaningMinStock,
      purchased: cleaningPurchased,
      storage: cleaningStorage,
      frequentlyUsed: cleaningFrequentlyUsed,
      toBuy: cleaningToBuy,
      setName: setCleaningName,
      setQuantity: setCleaningQuantity,
      setUnit: setCleaningUnit,
      setMinStock: setCleaningMinStock,
      setPurchased: setCleaningPurchased,
      setStorage: setCleaningStorage,
      setFrequentlyUsed: setCleaningFrequentlyUsed,
      setToBuy: setCleaningToBuy,
    },

    // Actions
    addProduct,
    handleBulkAdd,
  };
};
