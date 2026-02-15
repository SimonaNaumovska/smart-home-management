import { useState, useEffect } from "react";
import type { Product, User, ChoreDefinition, ConsumptionLog, Room, ChoreCategory } from "./types/Product";
import { FoodForm } from "./components/FoodForm";
import { CleaningForm } from "./components/CleaningForm";
import { ProductList } from "./components/ProductList";
import { InventoryDashboard } from "./components/InventoryDashboard";
import { UserManagement } from "./components/UserManagement";
import { ChoresDashboard } from "./components/ChoresDashboard";
import { ConsumptionLogger } from "./components/ConsumptionLogger";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { AISuggestions } from "./components/AISuggestions";
import { ReceiptScanner } from "./components/ReceiptScanner";
import BarcodeScanner from "./components/BarcodeScanner";
import DataBackup from "./components/DataBackup";
import RoomCategoryManagement from "./components/RoomCategoryManagement";
import {
  syncProducts,
  syncUsers,
  syncChores,
  syncConsumptionLogs,
  addProduct as addProductDB,
  updateProduct as updateProductDB,
  deleteProduct as deleteProductDB,
  addUser as addUserDB,
  addChore as addChoreDB,
  updateChore as updateChoreDB,
  deleteChore as deleteChoreDB,
  addConsumptionLog as addConsumptionLogDB
} from "./firebase/database";

interface AppProps {
  householdId?: string;
  useFirebase?: boolean;
}

function App({ householdId, useFirebase = false }: AppProps = {}) {
  // Core state
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [chores, setChores] = useState<ChoreDefinition[]>([]);
  const [consumptionLogs, setConsumptionLogs] = useState<ConsumptionLog[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [choreCategories, setChoreCategories] = useState<ChoreCategory[]>([]);
  const [activeTab, setActiveTab] = useState<"inventory" | "consumption" | "chores" | "analytics" | "ai" | "members" | "settings">("inventory");
  const [inventoryTab, setInventoryTab] = useState<"food" | "cleaning">("food");
  const [inventoryView, setInventoryView] = useState<"form" | "dashboard" | "receipt" | "barcode">("form");
  
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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem("products");
      const savedUsers = localStorage.getItem("users");
      const savedChores = localStorage.getItem("chores");
      const savedLogs = localStorage.getItem("consumptionLogs");
      const savedActiveUser = localStorage.getItem("activeUser");
      const savedRooms = localStorage.getItem("rooms");
      const savedCategories = localStorage.getItem("choreCategories");
      
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        setUsers(parsedUsers);
        if (savedActiveUser) {
          const active = parsedUsers.find((u: User) => u.id === savedActiveUser);
          if (active) setActiveUser(active);
        }
      }
      if (savedChores) setChores(JSON.parse(savedChores));
      if (savedLogs) setConsumptionLogs(JSON.parse(savedLogs));
      if (savedRooms) setRooms(JSON.parse(savedRooms));
      if (savedCategories) setChoreCategories(JSON.parse(savedCategories));
      
      console.log("✅ Data loaded from localStorage successfully");
    } catch (error) {
      console.error("❌ Error loading data from localStorage:", error);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("products", JSON.stringify(products));
    } catch (error) {
      console.error("Error saving products:", error);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem("users", JSON.stringify(users));
    } catch (error) {
      console.error("Error saving users:", error);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem("chores", JSON.stringify(chores));
    } catch (error) {
      console.error("Error saving chores:", error);
    }
  }, [chores]);

  useEffect(() => {
    try {
      localStorage.setItem("consumptionLogs", JSON.stringify(consumptionLogs));
    } catch (error) {
      console.error("Error saving consumption logs:", error);
    }
  }, [consumptionLogs]);

  useEffect(() => {
    try {
      if (activeUser) {
        localStorage.setItem("activeUser", activeUser.id);
      } else {
        localStorage.removeItem("activeUser");
      }
    } catch (error) {
      console.error("Error saving active user:", error);
    }
  }, [activeUser]);

  useEffect(() => {
    try {
      localStorage.setItem("rooms", JSON.stringify(rooms));
    } catch (error) {
      console.error("Error saving rooms:", error);
    }
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem("choreCategories", JSON.stringify(choreCategories));
    } catch (error) {
      console.error("Error saving chore categories:", error);
    }
  }, [choreCategories]);

  // Firebase real-time sync
  useEffect(() => {
    if (!useFirebase || !householdId) return;

    const unsubscribers: (() => void)[] = [];

    // Sync products
    const unsubProducts = syncProducts(householdId, (syncedProducts) => {
      setProducts(syncedProducts);
    });
    unsubscribers.push(unsubProducts);

    // Sync users
    const unsubUsers = syncUsers(householdId, (syncedUsers) => {
      setUsers(syncedUsers);
    });
    unsubscribers.push(unsubUsers);

    // Sync chores
    const unsubChores = syncChores(householdId, (syncedChores) => {
      setChores(syncedChores);
    });
    unsubscribers.push(unsubChores);

    // Sync consumption logs
    const unsubLogs = syncConsumptionLogs(householdId, (syncedLogs) => {
      setConsumptionLogs(syncedLogs);
    });
    unsubscribers.push(unsubLogs);

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [useFirebase, householdId]);

  const addFoodProduct = () => {
    if (!foodName || foodQuantity === "" || foodMinStock === "") return;

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

    setProducts([...products, newProduct]);

    // Sync to Firebase
    if (useFirebase && householdId) {
      addProductDB(householdId, newProduct);
    }

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
  };

  const addCleaningProduct = () => {
    if (!cleaningName || cleaningQuantity === "" || cleaningMinStock === "") return;

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

    setProducts([...products, newProduct]);

    // Sync to Firebase
    if (useFirebase && householdId) {
      addProductDB(householdId, newProduct);
    }

    // reset form
    setCleaningName("");
    setCleaningQuantity("");
    setCleaningUnit("L");
    setCleaningMinStock("");
    setCleaningPurchased("");
    setCleaningStorage("");
    setCleaningFrequentlyUsed(false);
    setCleaningToBuy(false);
  };

  const addProduct = () => {
    if (inventoryTab === "food") {
      addFoodProduct();
    } else {
      addCleaningProduct();
    }
  };

  const handleBulkAddItems = (items: Partial<Product>[]) => {
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

    setProducts([...products, ...newProducts]);

    // Sync to Firebase
    if (useFirebase && householdId) {
      newProducts.forEach((product) => {
        addProductDB(householdId, product);
      });
    }

    alert(`✅ Added ${newProducts.length} items to inventory!`);
  };

  // User management
  const handleAddUser = (name: string, avatar: string, color: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      avatar,
      color,
    };
    setUsers([...users, newUser]);
    if (!activeUser) {
      setActiveUser(newUser);
    }

    // Sync to Firebase
    if (useFirebase && householdId) {
      addUserDB(householdId, newUser);
    }
  };

  const handleSelectUser = (user: User) => {
    setActiveUser(user);
  };

  // Room and Category management
  const handleAddRoom = (room: Omit<Room, "id">) => {
    const newRoom: Room = {
      ...room,
      id: crypto.randomUUID(),
    };
    setRooms([...rooms, newRoom]);
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms(rooms.filter((r) => r.id !== roomId));
  };

  const handleAddCategory = (category: Omit<ChoreCategory, "id">) => {
    const newCategory: ChoreCategory = {
      ...category,
      id: crypto.randomUUID(),
    };
    setChoreCategories([...choreCategories, newCategory]);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setChoreCategories(choreCategories.filter((c) => c.id !== categoryId));
  };

  // Consumption logging
  const handleLogConsumption = (productId: string, amount: number) => {
    if (!activeUser) return;

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Deduct from inventory
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === productId
          ? { ...p, quantity: Math.max(0, p.quantity - amount) }
          : p
      )
    );

    // Log consumption
    const newLog: ConsumptionLog = {
      id: crypto.randomUUID(),
      userId: activeUser.id,
      userName: activeUser.name,
      productId: product.id,
      productName: product.name,
      amount,
      unit: product.unit,
      type: "food",
      timestamp: Date.now(),
    };
    setConsumptionLogs([...consumptionLogs, newLog]);

    // Sync to Firebase
    if (useFirebase && householdId) {
      addConsumptionLogDB(householdId, newLog);
      updateProductDB(householdId, {
        ...product,
        quantity: Math.max(0, product.quantity - amount)
      });
    }
  };

  // Chore management
  const handleAddChore = (chore: ChoreDefinition) => {
    setChores([...chores, chore]);

    // Sync to Firebase
    if (useFirebase && householdId) {
      addChoreDB(householdId, chore);
    }
  };

  const handleUpdateChore = (updatedChore: ChoreDefinition) => {
    setChores((prevChores) =>
      prevChores.map((c) => (c.id === updatedChore.id ? updatedChore : c))
    );

    // Sync to Firebase
    if (useFirebase && householdId) {
      updateChoreDB(householdId, updatedChore);
    }
  };

  const handleDeleteChore = (choreId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      setChores((prevChores) => prevChores.filter((c) => c.id !== choreId));

      // Sync to Firebase
      if (useFirebase && householdId) {
        deleteChoreDB(householdId, choreId);
      }
    }
  };

  const handleCompleteChore = (choreId: string) => {
    if (!activeUser) return;

    const chore = chores.find((c) => c.id === choreId);
    if (!chore) return;

    // Deduct products consumed by this chore
    chore.consumedProducts.forEach((consumedProduct) => {
      const product = products.find((p) => p.name.toLowerCase() === consumedProduct.productName.toLowerCase());
      
      if (product) {
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === product.id
              ? { ...p, quantity: Math.max(0, p.quantity - consumedProduct.defaultAmount) }
              : p
          )
        );

        // Log consumption
        const newLog: ConsumptionLog = {
          id: crypto.randomUUID(),
          userId: activeUser.id,
          userName: activeUser.name,
          productId: product.id,
          productName: product.name,
          amount: consumedProduct.defaultAmount,
          unit: consumedProduct.unit,
          type: "chore",
          choreId: chore.id,
          choreName: chore.name,
          timestamp: Date.now(),
        };
        setConsumptionLogs((prev) => [...prev, newLog]);

        // Sync to Firebase
        if (useFirebase && householdId) {
          addConsumptionLogDB(householdId, newLog);
        }
      }
    });

    // Also update product in Firebase
    if (useFirebase && householdId) {
      products.forEach((p) => {
        updateProductDB(householdId, p);
      });
    }
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));

    // Sync to Firebase
    if (useFirebase && householdId) {
      deleteProductDB(householdId, id);
    }
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );

    // Sync to Firebase
    if (useFirebase && householdId) {
      updateProductDB(householdId, updatedProduct);
    }
  };

  return (
    <div className="app-container">
      <h1 style={{ fontSize: "36px", marginBottom: "8px" }}>🏠 Smart Household OS</h1>
      <p style={{ color: "#666", fontSize: "16px", marginBottom: "24px" }}>
        Inventory • Consumption • Chores • Analytics • AI • Members
      </p>

      {/* Main Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          borderBottom: "3px solid #ddd",
          flexWrap: "wrap",
        }}
      >
        {[
          { key: "inventory", label: "📦 Inventory", color: "#4CAF50" },
          { key: "consumption", label: "🍽️ Consumption", color: "#9C27B0" },
          { key: "chores", label: "🧹 Chores", color: "#FF9800" },
          { key: "analytics", label: "📊 Analytics", color: "#00BCD4" },
          { key: "ai", label: "🤖 AI Smart", color: "#E91E63" },
          { key: "members", label: "👥 Members", color: "#673AB7" },
          { key: "settings", label: "⚙️ Settings", color: "#607D8B" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: "14px 24px",
              backgroundColor: activeTab === tab.key ? tab.color : "#f5f5f5",
              color: activeTab === tab.key ? "white" : "#333",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: activeTab === tab.key ? "bold" : "normal",
              borderRadius: "8px 8px 0 0",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scanner Buttons (always visible) */}
      {activeTab === "inventory" && (
        <div style={{ marginBottom: "20px", textAlign: "right", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={() => setInventoryView("receipt")}
            style={{
              padding: "12px 24px",
              backgroundColor: inventoryView === "receipt" ? "#2196F3" : "#f5f5f5",
              color: inventoryView === "receipt" ? "white" : "#333",
              border: "1px solid #ddd",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: inventoryView === "receipt" ? "bold" : "normal",
              borderRadius: "6px",
            }}
          >
            📸 Scan Receipt
          </button>
          <button
            onClick={() => setInventoryView("barcode")}
            style={{
              padding: "12px 24px",
              backgroundColor: inventoryView === "barcode" ? "#4CAF50" : "#f5f5f5",
              color: inventoryView === "barcode" ? "white" : "#333",
              border: "1px solid #ddd",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: inventoryView === "barcode" ? "bold" : "normal",
              borderRadius: "6px",
            }}
          >
            📷 Scan Barcode
          </button>
        </div>
      )}

      {/* Active user indicator - Always visible */}
      {activeUser && (
        <div
          style={{
            padding: "12px 20px",
            backgroundColor: activeUser.color,
            color: "white",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          <span style={{ fontSize: "24px" }}>{activeUser.avatar}</span>
          Active User: {activeUser.name}
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === "inventory" && (
        <>
          {/* View Toggle */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={() => setInventoryView("form")}
              style={{
                padding: "10px 20px",
                backgroundColor: inventoryView === "form" ? "#4CAF50" : "#f5f5f5",
                color: inventoryView === "form" ? "white" : "#333",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: inventoryView === "form" ? "bold" : "normal",
                borderRadius: "6px",
              }}
            >
              ➕ Add Items
            </button>
            <button
              onClick={() => setInventoryView("dashboard")}
              style={{
                padding: "10px 20px",
                backgroundColor: inventoryView === "dashboard" ? "#4CAF50" : "#f5f5f5",
                color: inventoryView === "dashboard" ? "white" : "#333",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: inventoryView === "dashboard" ? "bold" : "normal",
                borderRadius: "6px",
              }}
            >
              📊 View Dashboard
            </button>
          </div>

          {inventoryView === "dashboard" ? (
            <InventoryDashboard
              products={products}
              onUpdateProduct={updateProduct}
              onDeleteProduct={deleteProduct}
            />
          ) : inventoryView === "receipt" ? (
            <ReceiptScanner onAddItems={handleBulkAddItems} />
          ) : inventoryView === "barcode" ? (
            <BarcodeScanner onAddProduct={addProduct} />
          ) : (
            <>
              {/* Inventory Sub-tabs */}
              <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              borderBottom: "2px solid #ddd",
            }}
          >
            <button
              onClick={() => setInventoryTab("food")}
              style={{
                padding: "12px 24px",
                backgroundColor: inventoryTab === "food" ? "#4CAF50" : "#f5f5f5",
                color: inventoryTab === "food" ? "white" : "#333",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: inventoryTab === "food" ? "bold" : "normal",
                borderRadius: "4px 4px 0 0",
              }}
            >
              🥗 Food & Beverage
            </button>
            <button
              onClick={() => setInventoryTab("cleaning")}
              style={{
                padding: "12px 24px",
                backgroundColor: inventoryTab === "cleaning" ? "#2196F3" : "#f5f5f5",
                color: inventoryTab === "cleaning" ? "white" : "#333",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: inventoryTab === "cleaning" ? "bold" : "normal",
                borderRadius: "4px 4px 0 0",
              }}
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

          <ProductList products={products} onUse={() => {}} onDelete={deleteProduct} />
            </>
          )}
        </>
      )}

      {activeTab === "consumption" && (
        <ConsumptionLogger
          products={products}
          activeUser={activeUser}
          onLogConsumption={handleLogConsumption}
        />
      )}

      {activeTab === "chores" && (
        <ChoresDashboard
          chores={chores}
          products={products}
          activeUser={activeUser}
          onAddChore={handleAddChore}
          onUpdateChore={handleUpdateChore}
          onCompleteChore={handleCompleteChore}
          onDeleteChore={handleDeleteChore}
        />
      )}

      {activeTab === "analytics" && (
        <AnalyticsDashboard
          consumptionLogs={consumptionLogs}
          users={users}
          products={products}
        />
      )}

      {activeTab === "ai" && (
        <AISuggestions
          consumptionLogs={consumptionLogs}
          users={users}
          products={products}
        />
      )}

      {activeTab === "members" && (
        <UserManagement
          users={users}
          activeUser={activeUser}
          onSelectUser={handleSelectUser}
          onAddUser={handleAddUser}
        />
      )}

      {activeTab === "settings" && useFirebase && householdId && (
        <div>
          <h2 style={{ marginBottom: "20px", color: "#333" }}>⚙️ Settings & Backup</h2>
          
          <div
            style={{
              padding: "20px",
              backgroundColor: "#e3f2fd",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ marginBottom: "10px", color: "#1976d2" }}>☁️ Cloud Sync Status</h3>
            <p style={{ color: "#666" }}>
              Your household data is automatically syncing to the cloud in real-time.
              All changes are backed up instantly and synced across all devices.
            </p>
          </div>

          <RoomCategoryManagement
            rooms={rooms}
            categories={choreCategories}
            onAddRoom={handleAddRoom}
            onAddCategory={handleAddCategory}
            onDeleteRoom={handleDeleteRoom}
            onDeleteCategory={handleDeleteCategory}
          />

          <div style={{ marginTop: "40px" }}>
            <DataBackup householdId={householdId} />
          </div>
        </div>
      )}

      {activeTab === "settings" && !useFirebase && (
        <div>
          <h2 style={{ marginBottom: "20px", color: "#333" }}>⚙️ Settings</h2>
          
          <div
            style={{
              padding: "20px",
              backgroundColor: "#fff3cd",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ marginBottom: "10px", color: "#856404" }}>📝 Local Mode</h3>
            <p style={{ color: "#666", marginBottom: "10px" }}>
              Currently using localStorage. Data is saved in your browser only.
            </p>
            <p style={{ color: "#666", fontWeight: "bold" }}>
              To enable multi-device sync and cloud backup:
            </p>
            <ol style={{ color: "#666", paddingLeft: "20px" }}>
              <li>Check FIREBASE_SETUP.md file in your project</li>
              <li>Create a Firebase project (5 minutes, free)</li>
              <li>Update src/firebase/config.ts with your credentials</li>
              <li>Restart the app</li>
            </ol>
          </div>

          <RoomCategoryManagement
            rooms={rooms}
            categories={choreCategories}
            onAddRoom={handleAddRoom}
            onAddCategory={handleAddCategory}
            onDeleteRoom={handleDeleteRoom}
            onDeleteCategory={handleDeleteCategory}
          />
        </div>
      )}
    </div>
  );
}

export default App;
