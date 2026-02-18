import { useState } from "react";
import type { ConsumptionLog } from "./types/Product";
import { AppRoutes } from "./routes";
import { LandingPage } from "./shared/components/LandingPage";
import { HouseholdSetup } from "./shared/components/HouseholdSetup";
import { Sidebar, Layout } from "./shared/components/Layout";
import { useAuth } from "./shared/hooks/useAuth";
import { useHouseholdApi } from "./shared/hooks/useHouseholdApi";
import { useProductsApi } from "./shared/hooks/useProductsApi";
import { useCurrentUser } from "./shared/hooks/useCurrentUser";
import { useChoresApi } from "./shared/hooks/useChoresApi";
import { useConsumptionApi } from "./shared/hooks/useConsumptionApi";
import "./App.css";

function App() {
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
    members: householdMembers,
    loading: householdLoading,
    createHousehold,
    joinHousehold,
  } = useHouseholdApi(currentUserId);

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
  } = useProductsApi(householdId);

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
  } = useChoresApi(householdId);
  const { consumptionLogs, logConsumption } = useConsumptionApi(householdId);

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
  // Household Setup Adapters
  // ====================================

  const handleCreateHousehold = async (
    name: string,
    displayName: string,
    avatar: string,
    color: string,
  ): Promise<string> => {
    if (!currentUserId) {
      throw new Error("User not authenticated");
    }

    const result = await createHousehold({
      name,
      ownerUserId: currentUserId,
      ownerDisplayName: displayName,
      ownerAvatar: avatar,
      ownerColor: color,
    });

    if (!result) {
      throw new Error("Failed to create household");
    }

    return result.household.id;
  };

  const handleJoinHousehold = async (
    householdId: string,
    displayName: string,
    avatar: string,
    color: string,
  ): Promise<void> => {
    if (!currentUserId) {
      throw new Error("User not authenticated");
    }

    const result = await joinHousehold({
      householdId,
      userId: currentUserId,
      displayName,
      avatar,
      color,
    });

    if (!result) {
      throw new Error("Failed to join household");
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
        onCreateHousehold={handleCreateHousehold}
        onJoinHousehold={handleJoinHousehold}
      />
    );
  }

  return (
    <div className="layout-container">
      <Sidebar
        userEmail={currentUserEmail}
        onSignOut={signOut}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <Layout
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <AppRoutes
          products={products}
          activeUser={currentUser}
          rooms={rooms}
          chores={chores}
          choreCategories={choreCategories}
          consumptionLogs={consumptionLogs}
          householdMembers={householdMembers}
          currentUserId={currentUserId}
          household={household}
          onAddProduct={addProduct}
          onUpdateProduct={updateProduct}
          onDeleteProduct={deleteProduct}
          onBulkAddItems={handleBulkAddItems}
          onMarkPurchased={handleMarkItemPurchased}
          onRemoveFromShoppingList={handleRemoveFromShoppingList}
          onLogConsumption={handleLogConsumption}
          onAddChore={addChore}
          onUpdateChore={updateChore}
          onCompleteChore={handleCompleteChore}
          onDeleteChore={deleteChore}
          onAddRoom={addRoom}
          onDeleteRoom={deleteRoom}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
        />
      </Layout>
    </div>
  );
}

export default App;
