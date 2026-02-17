import { useState } from "react";
import type { ConsumptionLog } from "../types/Product";
import { InventoryView } from "../features/inventory/InventoryView";
import { UserManagement } from "../features/users/UserManagement";
import { ChoresDashboard } from "../features/chores/ChoresDashboard";
import { ConsumptionLogger } from "../features/inventory/ConsumptionLogger";
import { AnalyticsDashboard } from "../features/dashboard/AnalyticsDashboard";
import { SuggestionsPanel } from "../features/dashboard/SuggestionsPanel";
import RoomCategoryManagement from "../features/chores/RoomCategoryManagement";
import { ShoppingList } from "../features/shopping/ShoppingList";
import { LandingPage } from "../shared/components/LandingPage";
import { HouseholdSetup } from "../shared/components/HouseholdSetup";
import { HouseholdInfo } from "../shared/components/HouseholdInfo";
import { Sidebar, Layout } from "../shared/components/Layout";
import { useAuth } from "../shared/hooks/useAuth";
import { useHousehold } from "../shared/hooks/useHousehold";
import { useProducts } from "../shared/hooks/useProducts";
import { useCurrentUser } from "../shared/hooks/useCurrentUser";
import { useChores } from "../shared/hooks/useChores";
import { useConsumption } from "../shared/hooks/useConsumption";
import "../App.css";

function App() {
  const [activeTab, setActiveTab] = useState<string>("inventory");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Authentication
  const {
    isAuthenticated,
    currentUserEmail,
    currentUserId,
    authChecking,
    signOut,
  } = useAuth();

  // Household management
  const {
    household,
    householdMembers,
    loading: householdLoading,
    createHousehold,
    joinHousehold,
  } = useHousehold(currentUserId);

  // Get household ID or fallback
  const householdId = household?.id || "default-household";

  // Use custom hooks with actual household ID
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleToBuy,
    markPurchased,
    handleBulkAddItems,
  } = useProducts(householdId);

  // Get current user from household members
  const currentUser = useCurrentUser(currentUserId, householdMembers);

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
  const { consumptionLogs, logConsumption } = useConsumption(householdId);

  // ====================================
  // Event Handlers
  // ====================================

  const handleLogConsumption = async (productId: string, amount: number) => {
    if (!currentUser) return;

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
      userId: currentUser.id,
      userName: currentUser.name,
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
    if (!currentUser) return;

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
          userId: currentUser.id,
          userName: currentUser.name,
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

  if (authChecking || householdLoading) {
    return <div className="login-container">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LandingPage onLoginSuccess={() => {}} />;
  }

  // Show household setup if user doesn't have a household
  if (!household) {
    return (
      <HouseholdSetup
        userEmail={currentUserEmail}
        onHouseholdCreated={(id) => {
          console.log("Household created/joined:", id);
          // Household hook will auto-refresh
        }}
        onCreateHousehold={createHousehold}
        onJoinHousehold={joinHousehold}
      />
    );
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
            activeUser={currentUser}
            rooms={rooms}
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
            activeUser={currentUser}
            onLogConsumption={handleLogConsumption}
          />
        )}

        {activeTab === "chores" && (
          <ChoresDashboard
            chores={chores}
            products={products}
            activeUser={currentUser}
            rooms={rooms}
            choreCategories={choreCategories}
            onAddChore={addChore}
            onUpdateChore={updateChore}
            onCompleteChore={handleCompleteChore}
            onDeleteChore={deleteChore}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsDashboard
            consumptionLogs={consumptionLogs}
            users={householdMembers.map((m) => ({
              id: m.userId,
              name: m.displayName || "Unknown",
              avatar: m.avatar,
              color: m.color,
            }))}
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
            currentUser={currentUser}
            householdMembers={householdMembers}
            currentUserId={currentUserId}
          />
        )}

        {activeTab === "settings" && (
          <div>
            <h2 className="settings-title">⚙️ Settings</h2>

            {household && (
              <HouseholdInfo
                household={household}
                members={householdMembers}
                currentUserId={currentUserId}
              />
            )}

            {/* Only show room/category management to household owners */}
            {currentUserId &&
              householdMembers.find(
                (m) => m.userId === currentUserId && m.role === "owner",
              ) && (
                <RoomCategoryManagement
                  rooms={rooms}
                  categories={choreCategories}
                  onAddRoom={addRoom}
                  onDeleteRoom={deleteRoom}
                  onAddCategory={addCategory}
                  onDeleteCategory={deleteCategory}
                />
              )}

            {/* Show message if not owner */}
            {currentUserId &&
              !householdMembers.find(
                (m) => m.userId === currentUserId && m.role === "owner",
              ) && (
                <div
                  style={{
                    padding: "20px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    backgroundColor: "#f9f9f9",
                    marginTop: "20px",
                  }}
                >
                  <p style={{ color: "#666", margin: 0 }}>
                    💡 <strong>Note:</strong> Only household owners can manage
                    rooms and categories. Contact your household owner if you
                    need changes.
                  </p>
                </div>
              )}
          </div>
        )}
      </Layout>
    </div>
  );
}

export default App;
