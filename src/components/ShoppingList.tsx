import { useState } from "react";
import type { Product } from "../types/Product";

interface ShoppingListProps {
  products: Product[];
  onMarkPurchased: (productId: string) => void;
  onRemoveFromList: (productId: string) => void;
}

export const ShoppingList = ({
  products,
  onMarkPurchased,
  onRemoveFromList,
}: ShoppingListProps) => {
  const [filter, setFilter] = useState<"all" | "food" | "cleaning">("all");
  const [sortBy, setSortBy] = useState<"name" | "category">("category");

  // Get items to buy
  const shoppingItems = products.filter((p) => p.toBuy);

  // Filter by category
  const filteredItems =
    filter === "all"
      ? shoppingItems
      : shoppingItems.filter((p) => p.category === filter);

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else {
      return a.category.localeCompare(b.category);
    }
  });

  // Group by category for better visualization
  const groupedByCategory = sortedItems.reduce(
    (acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, Product[]>,
  );

  const getCategoryColor = (category: string) => {
    if (category === "food") return "#FFE0B2";
    if (category === "cleaning") return "#C8E6C9";
    return "#E0E0E0";
  };

  const getCategoryEmoji = (category: string) => {
    if (category === "food") return "🛒";
    if (category === "cleaning") return "🧹";
    return "📦";
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ marginBottom: "15px", color: "#333" }}>
          🛒 Shopping List
        </h2>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              padding: "10px 15px",
              backgroundColor: "#E3F2FD",
              borderRadius: "6px",
              fontSize: "14px",
              color: "#1976d2",
              fontWeight: "bold",
            }}
          >
            📊 Total: {shoppingItems.length} items
          </div>
          <div
            style={{
              padding: "10px 15px",
              backgroundColor: "#FFF3E0",
              borderRadius: "6px",
              fontSize: "14px",
              color: "#F57C00",
              fontWeight: "bold",
            }}
          >
            🍎 Food: {shoppingItems.filter((p) => p.category === "food").length}
          </div>
          <div
            style={{
              padding: "10px 15px",
              backgroundColor: "#F3E5F5",
              borderRadius: "6px",
              fontSize: "14px",
              color: "#7B1FA2",
              fontWeight: "bold",
            }}
          >
            🧹 Cleaning:{" "}
            {shoppingItems.filter((p) => p.category === "cleaning").length}
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "8px 16px",
              backgroundColor: filter === "all" ? "#1976d2" : "#E0E0E0",
              color: filter === "all" ? "white" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            All Items
          </button>
          <button
            onClick={() => setFilter("food")}
            style={{
              padding: "8px 16px",
              backgroundColor: filter === "food" ? "#F57C00" : "#E0E0E0",
              color: filter === "food" ? "white" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🍎 Food
          </button>
          <button
            onClick={() => setFilter("cleaning")}
            style={{
              padding: "8px 16px",
              backgroundColor: filter === "cleaning" ? "#7B1FA2" : "#E0E0E0",
              color: filter === "cleaning" ? "white" : "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🧹 Cleaning
          </button>
        </div>

        {/* Sort */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ marginRight: "10px", fontWeight: "bold" }}>
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "category")}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              cursor: "pointer",
            }}
          >
            <option value="category">Category</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Shopping Items */}
      {sortedItems.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            backgroundColor: "#F5F5F5",
            borderRadius: "8px",
            color: "#999",
          }}
        >
          <p style={{ fontSize: "24px", marginBottom: "10px" }}>✨</p>
          <p>No items to shop for!</p>
          <p style={{ fontSize: "12px", marginTop: "10px" }}>
            Mark items as "to buy" in your inventory to see them here
          </p>
        </div>
      ) : (
        <div>
          {Object.entries(groupedByCategory).map(([category, items]) => (
            <div key={category} style={{ marginBottom: "20px" }}>
              <div
                style={{
                  padding: "10px 15px",
                  backgroundColor: getCategoryColor(category),
                  borderRadius: "6px 6px 0 0",
                  fontWeight: "bold",
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>{getCategoryEmoji(category)}</span>
                <span>
                  {category.charAt(0).toUpperCase() + category.slice(1)} (
                  {items.length})
                </span>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "white",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        color: "#333",
                        marginBottom: "5px",
                      }}
                    >
                      {item.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      Current Stock: {item.quantity} {item.unit} •{" "}
                      {item.minStock
                        ? `Min: ${item.minStock} ${item.unit}`
                        : "No min set"}
                    </div>
                    {item.storage && (
                      <div style={{ fontSize: "12px", color: "#999" }}>
                        📍 {item.storage}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginLeft: "10px",
                    }}
                  >
                    <button
                      onClick={() => onMarkPurchased(item.id)}
                      title="Mark as purchased"
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                    >
                      ✓ Bought
                    </button>
                    <button
                      onClick={() => onRemoveFromList(item.id)}
                      title="Remove from shopping list"
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Quick Tips */}
      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#E3F2FD",
          borderRadius: "8px",
          fontSize: "12px",
          color: "#1976d2",
          borderLeft: "4px solid #1976d2",
        }}
      >
        <strong>💡 Tip:</strong> Click "Bought" when you've purchased an item to
        return it to your inventory with updated stock levels.
      </div>
    </div>
  );
};
