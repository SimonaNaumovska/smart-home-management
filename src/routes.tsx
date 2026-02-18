import { Routes, Route, Navigate } from "react-router-dom";
import { AnalyticsDashboard } from "./features/dashboard/AnalyticsDashboard";
import { InventoryView } from "./features/inventory/InventoryView";
import { ChoresDashboard } from "./features/chores/ChoresDashboard";
import { ShoppingList } from "./features/shopping/ShoppingList";
import { ConsumptionLogger } from "./features/inventory/ConsumptionLogger";
import { SuggestionsPanel } from "./features/dashboard/SuggestionsPanel";
import { UserManagement } from "./features/users/UserManagement";
import RoomCategoryManagement from "./features/chores/RoomCategoryManagement";
import { HouseholdInfo } from "./shared/components/HouseholdInfo";
import type {
  Product,
  ConsumptionLog,
  User,
  Room,
  ChoreCategory,
  ChoreDefinition,
} from "./types/Product";
import type { HouseholdMember } from "./api/householdApi";

interface AppRoutesProps {
  products: Product[];
  activeUser: User | null;
  rooms: Room[];
  chores: ChoreDefinition[];
  choreCategories: ChoreCategory[];
  consumptionLogs: ConsumptionLog[];
  householdMembers: HouseholdMember[];
  currentUserId: string | null;
  household: any;
  onAddProduct: (product: Product) => Promise<void>;
  onUpdateProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onBulkAddItems: (items: Partial<Product>[]) => Promise<number>;
  onMarkPurchased: (productId: string) => void;
  onRemoveFromShoppingList: (productId: string) => Promise<void>;
  onLogConsumption: (productId: string, amount: number) => Promise<void>;
  onAddChore: (chore: ChoreDefinition) => Promise<void>;
  onUpdateChore: (chore: ChoreDefinition) => Promise<void>;
  onCompleteChore: (choreId: string) => Promise<void>;
  onDeleteChore: (id: string) => Promise<void>;
  onAddRoom: (room: Omit<Room, "id">) => Promise<void>;
  onDeleteRoom: (id: string) => Promise<void>;
  onAddCategory: (category: Omit<ChoreCategory, "id">) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export function AppRoutes({
  products,
  activeUser,
  rooms,
  chores,
  choreCategories,
  consumptionLogs,
  householdMembers,
  currentUserId,
  household,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBulkAddItems,
  onMarkPurchased,
  onRemoveFromShoppingList,
  onLogConsumption,
  onAddChore,
  onUpdateChore,
  onCompleteChore,
  onDeleteChore,
  onAddRoom,
  onDeleteRoom,
  onAddCategory,
  onDeleteCategory,
}: AppRoutesProps) {
  return (
    <Routes>
      <Route
        path="/"
        element={
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
        }
      />
      <Route
        path="/inventory"
        element={
          <InventoryView
            products={products}
            activeUser={activeUser}
            rooms={rooms}
            onAddProduct={onAddProduct}
            onUpdateProduct={onUpdateProduct}
            onDeleteProduct={onDeleteProduct}
            onBulkAddItems={onBulkAddItems}
          />
        }
      />
      <Route
        path="/chores"
        element={
          <ChoresDashboard
            chores={chores}
            products={products}
            activeUser={activeUser}
            rooms={rooms}
            choreCategories={choreCategories}
            onAddChore={onAddChore}
            onUpdateChore={onUpdateChore}
            onCompleteChore={onCompleteChore}
            onDeleteChore={onDeleteChore}
          />
        }
      />
      <Route
        path="/shopping"
        element={
          <ShoppingList
            products={products}
            onMarkPurchased={onMarkPurchased}
            onRemoveFromList={onRemoveFromShoppingList}
          />
        }
      />
      <Route
        path="/consumption"
        element={
          <ConsumptionLogger
            products={products}
            activeUser={activeUser}
            onLogConsumption={onLogConsumption}
          />
        }
      />
      <Route
        path="/ai"
        element={
          <SuggestionsPanel
            products={products}
            chores={chores}
            consumptionLogs={consumptionLogs}
            onProductUpdate={onUpdateProduct}
          />
        }
      />
      <Route
        path="/members"
        element={
          <UserManagement
            currentUser={activeUser}
            householdMembers={householdMembers}
            currentUserId={currentUserId}
          />
        }
      />
      <Route
        path="/settings"
        element={
          <div>
            <h2 className="settings-title">⚙️ Settings</h2>

            {household && currentUserId && (
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
                  onAddRoom={onAddRoom}
                  onDeleteRoom={onDeleteRoom}
                  onAddCategory={onAddCategory}
                  onDeleteCategory={onDeleteCategory}
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
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
