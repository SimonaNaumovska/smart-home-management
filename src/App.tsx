import { useState } from "react";
import type { ConsumptionLog } from "./types/Product";
import { InventoryView } from "./components/InventoryView";
import { UserManagement } from "./components/UserManagement";
import { ChoresDashboard } from "./components/ChoresDashboard";
import { ConsumptionLogger } from "./components/ConsumptionLogger";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { SuggestionsPanel } from "./components/SuggestionsPanel";
import { MaintenancePage } from "./components/MaintenancePage";
import DataBackup from "./components/DataBackup";
import RoomCategoryManagement from "./components/RoomCategoryManagement";
import { ShoppingList } from "./components/ShoppingList";
import { Login } from "./components/Login";
import { Sidebar, Layout } from "./components/Layout";
import { useAuth } from "./hooks/useAuth";
import { useProducts } from "./hooks/useProducts";
import { useUsers } from "./hooks/useUsers";
import { useChores } from "./hooks/useChores";
import { useConsumption } from "./hooks/useConsumption";
import "./App.css";

interface AppProps {
  householdId?: string;
}

function App({ householdId = "default-household" }: AppProps = {}) {
  const [activeTab, setActiveTab] = useState<string>("inventory");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Use custom hooks
  const { isAuthenticated, currentUserEmail, authChecking, signOut } =
    useAuth();
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleToBuy,
    markPurchased,
    handleBulkAddItems,
  } = useProducts(householdId);
  const { users, activeUser, addUser, selectUser } = useUsers(householdId);
  const {
    chores,
    rooms,
    choreCategories,
    addChore,
    updateChore,
    deleteChore,
    addRoom,
    deleteRoom,
    addCategory,
    deleteCategory,
  } = useChores(householdId);
  const { consumptionLogs, logConsumption, deleteOldLogs, deleteAllLogs } =
    useConsumption(householdId);

  // ====================================
  // Event Handlers
  // ====================================

  const handleLogConsumption = async (productId: string, amount: number) => {
    if (!activeUser) return;

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Deduct from inventory
    await updateProduct({
      ...product,
      quantity: Math.max(0, product.quantity - amount),
    });

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

    await logConsumption(newLog);
  };

  const handleMarkItemPurchased = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const quantityStr = prompt(
      `How much ${product.name} did you buy?\n(Current stock: ${product.quantity} ${product.unit})`,
      String(product.minStock || product.quantity),
    );

    if (!quantityStr) return;
    const quantity = Number.parseFloat(quantityStr);
    if (Number.isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    await markPurchased(productId, quantity, product.unit);
  };

  const handleRemoveFromShoppingList = async (productId: string) => {
    await toggleToBuy(productId, false);
  };

  const handleCompleteChore = async (choreId: string) => {
    if (!activeUser) return;

    const chore = chores.find((c) => c.id === choreId);
    if (!chore) return;

    // Deduct products consumed by this chore
    for (const consumedProduct of chore.consumedProducts) {
      const product = products.find(
        (p) =>
          p.name.toLowerCase() === consumedProduct.productName.toLowerCase(),
      );

      if (product) {
        await updateProduct({
          ...product,
          quantity: Math.max(
            0,
            product.quantity - consumedProduct.defaultAmount,
          ),
        });

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

        await logConsumption(newLog);
      }
    }
  };

  // ====================================
  // Render
  // ====================================

  if (authChecking) {
    return <div className="login-container">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return (
    <div className="layout-container">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userEmail={currentUserEmail}
        onSignOut={signOut}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <Layout
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {activeTab === "inventory" && (
          <InventoryView
            products={products}
            activeUser={activeUser}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
            onBulkAddItems={handleBulkAddItems}
          />
        )}

        {activeTab === "shopping" && (
          <ShoppingList
            products={products}
            onMarkPurchased={handleMarkItemPurchased}
            onRemoveFromList={handleRemoveFromShoppingList}
          />
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
            onAddChore={addChore}
            onUpdateChore={updateChore}
            onCompleteChore={handleCompleteChore}
            onDeleteChore={deleteChore}
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
          <SuggestionsPanel
            products={products}
            chores={chores}
            consumptionLogs={consumptionLogs}
            onProductUpdate={updateProduct}
          />
        )}

        {activeTab === "members" && (
          <UserManagement
            users={users}
            activeUser={activeUser}
            onSelectUser={selectUser}
            onAddUser={addUser}
          />
        )}

        {activeTab === "maintenance" && (
          <MaintenancePage
            products={products}
            consumptionLogs={consumptionLogs}
            chores={chores}
            onClearOldLogs={deleteOldLogs}
            onClearAllLogs={deleteAllLogs}
          />
        )}

        {activeTab === "settings" && (
          <div>
            <h2 className="settings-title">⚙️ Settings & Backup</h2>

            <div className="settings-card cloud-sync">
              <h3 className="settings-card-title cloud-sync">
                ☁️ Cloud Sync Status
              </h3>
              <p className="settings-card-description">
                Your household data is automatically syncing to the cloud in
                real-time. All changes are backed up instantly and synced across
                all devices.
              </p>
            </div>

            <RoomCategoryManagement
              rooms={rooms}
              categories={choreCategories}
              onAddRoom={addRoom}
              onAddCategory={addCategory}
              onDeleteRoom={deleteRoom}
              onDeleteCategory={deleteCategory}
            />

            {householdId && (
              <div className="mt-40">
                <DataBackup householdId={householdId} />
              </div>
            )}
          </div>
        )}
      </Layout>
    </div>
  );
}

export default App;
