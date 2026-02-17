import { useState, useEffect } from "react";
import type { Product, User, Room } from "../../types/Product";
import { FoodForm } from "./FoodForm";
import { CleaningForm } from "./CleaningForm";
import { ProductList } from "./ProductList";
import { ReceiptScanner } from "./ReceiptScanner";
import BarcodeScanner from "./BarcodeScanner";
import { MobileInventoryView } from "./MobileInventoryView";

interface InventoryViewProps {
  products: Product[];
  activeUser: User | null;
  rooms: Room[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onBulkAddItems: (items: Partial<Product>[]) => Promise<number>;
}

export const InventoryView = ({
  products,
  activeUser,
  rooms,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBulkAddItems,
}: InventoryViewProps) => {
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

  return (
    <>
      {/* Header */}
      <div className="inventory-header-section">
        <h2>📦 Inventory Management</h2>
      </div>

      {/* Active user indicator */}
      {activeUser && (
        <div
          className="active-user-badge"
          style={{ backgroundColor: activeUser.color }}
        >
          <span className="active-user-avatar">{activeUser.avatar}</span>
          Active User: {activeUser.name}
        </div>
      )}

      {/* Mobile Back Button */}
      {isMobileView && inventoryView !== "dashboard" && (
        <button
          onClick={() => setInventoryView("dashboard")}
          className="mobile-back-btn"
        >
          ← Back to Inventory
        </button>
      )}

      {inventoryView === "dashboard" ? (
        isMobileView ? (
          <MobileInventoryView
            products={products}
            onUpdateProduct={onUpdateProduct}
            onDeleteProduct={onDeleteProduct}
            onNavigateToForm={() => setInventoryView("form")}
            onNavigateToReceipt={() => setInventoryView("receipt")}
            onNavigateToBarcode={() => setInventoryView("barcode")}
          />
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="inventory-stats-grid">
              <div className="stat-card stat-blue">
                <div className="stat-value">{products.length}</div>
                <div className="stat-label">Total Items</div>
              </div>

              <div className="stat-card stat-red">
                <div className="stat-value">
                  {products.filter((p) => p.quantity === 0).length}
                </div>
                <div className="stat-label">Out of Stock</div>
              </div>

              <div className="stat-card stat-orange">
                <div className="stat-value">
                  {
                    products.filter(
                      (p) => p.quantity > 0 && p.quantity <= p.minStock,
                    ).length
                  }
                </div>
                <div className="stat-label">Low Stock</div>
              </div>

              <div className="stat-card stat-pink">
                <div className="stat-value">
                  {
                    products.filter((p) => {
                      if (!p.useBy) return false;
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const expiryDate = new Date(p.useBy);
                      expiryDate.setHours(0, 0, 0, 0);
                      return expiryDate < today;
                    }).length
                  }
                </div>
                <div className="stat-label">Expired</div>
              </div>

              <div className="stat-card stat-purple">
                <div className="stat-value">
                  {products.filter((p) => p.toBuy).length}
                </div>
                <div className="stat-label">Shopping List</div>
              </div>
            </div>

            {/* Compact Icon Toolbar - BELOW Stats */}
            <div className="inventory-toolbar">
              <button
                onClick={() => setInventoryView("dashboard")}
                className="toolbar-icon-btn active"
              >
                <span className="btn-icon">📊</span>
                <span className="btn-label">Dashboard</span>
              </button>
              <button
                onClick={() => setInventoryView("form")}
                className="toolbar-icon-btn"
              >
                <span className="btn-icon">➕</span>
                <span className="btn-label">Add Items</span>
              </button>
              <button
                onClick={() => setInventoryView("receipt")}
                className="toolbar-icon-btn"
              >
                <span className="btn-icon">📸</span>
                <span className="btn-label">Receipt</span>
              </button>
              <button
                onClick={() => setInventoryView("barcode")}
                className="toolbar-icon-btn"
              >
                <span className="btn-icon">📷</span>
                <span className="btn-label">Barcode</span>
              </button>
            </div>

            {/* Product List */}
            <ProductList
              products={products}
              onUse={() => {}}
              onDelete={onDeleteProduct}
              onEdit={onUpdateProduct}
            />
          </>
        )
      ) : (
        <>
          {/* Compact Icon Toolbar - For non-dashboard views (Desktop only) */}
          {!isMobileView && (
            <div className="inventory-toolbar">
              <button
                onClick={() => setInventoryView("dashboard")}
                className="toolbar-icon-btn"
              >
                <span className="btn-icon">📊</span>
                <span className="btn-label">Dashboard</span>
              </button>
              <button
                onClick={() => setInventoryView("form")}
                className={`toolbar-icon-btn ${inventoryView === "form" ? "active" : ""}`}
              >
                <span className="btn-icon">➕</span>
                <span className="btn-label">Add Items</span>
              </button>
              <button
                onClick={() => setInventoryView("receipt")}
                className={`toolbar-icon-btn ${inventoryView === "receipt" ? "active" : ""}`}
              >
                <span className="btn-icon">📸</span>
                <span className="btn-label">Receipt</span>
              </button>
              <button
                onClick={() => setInventoryView("barcode")}
                className={`toolbar-icon-btn ${inventoryView === "barcode" ? "active" : ""}`}
              >
                <span className="btn-icon">📷</span>
                <span className="btn-label">Barcode</span>
              </button>
            </div>
          )}

          {inventoryView === "receipt" ? (
            <ReceiptScanner onAddItems={handleBulkAdd} />
          ) : inventoryView === "barcode" ? (
            <BarcodeScanner onAddProduct={addProduct} />
          ) : inventoryView === "form" ? (
            <>
              {/* Inventory Sub-tabs */}
              <div className="sub-tabs">
                <button
                  onClick={() => setInventoryTab("food")}
                  className={`sub-tab-btn ${inventoryTab === "food" ? "active food" : ""}`}
                >
                  🥗 Food & Beverage
                </button>
                <button
                  onClick={() => setInventoryTab("cleaning")}
                  className={`sub-tab-btn ${inventoryTab === "cleaning" ? "active cleaning" : ""}`}
                >
                  🧹 Cleaning & Supplies
                </button>
              </div>

              {/* Forms */}
              {inventoryTab === "food" ? (
                <FoodForm
                  name={foodName}
                  quantity={foodQuantity}
                  unit={foodUnit}
                  minStock={foodMinStock}
                  purchased={foodPurchased}
                  useBy={foodUseBy}
                  storage={foodStorage}
                  frequentlyUsed={foodFrequentlyUsed}
                  toBuy={foodToBuy}
                  rooms={rooms}
                  onNameChange={setFoodName}
                  onQuantityChange={setFoodQuantity}
                  onUnitChange={setFoodUnit}
                  onMinStockChange={setFoodMinStock}
                  onPurchasedChange={setFoodPurchased}
                  onUseByChange={setFoodUseBy}
                  onStorageChange={setFoodStorage}
                  onFrequentlyUsedChange={setFoodFrequentlyUsed}
                  onToBuyChange={setFoodToBuy}
                  onAddProduct={addProduct}
                />
              ) : (
                <CleaningForm
                  name={cleaningName}
                  quantity={cleaningQuantity}
                  unit={cleaningUnit}
                  minStock={cleaningMinStock}
                  purchased={cleaningPurchased}
                  storage={cleaningStorage}
                  frequentlyUsed={cleaningFrequentlyUsed}
                  toBuy={cleaningToBuy}
                  rooms={rooms}
                  onNameChange={setCleaningName}
                  onQuantityChange={setCleaningQuantity}
                  onUnitChange={setCleaningUnit}
                  onMinStockChange={setCleaningMinStock}
                  onPurchasedChange={setCleaningPurchased}
                  onStorageChange={setCleaningStorage}
                  onFrequentlyUsedChange={setCleaningFrequentlyUsed}
                  onToBuyChange={setCleaningToBuy}
                  onAddProduct={addProduct}
                />
              )}
            </>
          ) : null}
        </>
      )}
    </>
  );
};
