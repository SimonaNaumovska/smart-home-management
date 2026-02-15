import { useState } from "react";
import type { Product } from "../types/Product";

interface InventoryDashboardProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export function InventoryDashboard({
  products,
  onUpdateProduct,
  onDeleteProduct,
}: InventoryDashboardProps) {
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterStorage, setFilterStorage] = useState<string>("All");
  const [sortBy, setSortBy] = useState<
    "name" | "category" | "quantity" | "useBy"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Get unique categories and storage locations
  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const storageLocations = ["All", ...new Set(products.map((p) => p.storage))];

  // Calculate stock level
  const getStockLevel = (product: Product): string => {
    if (product.quantity === 0) return "None";
    if (product.quantity <= product.minStock) return "Low";
    if (product.quantity <= product.minStock * 1.5) return "Medium";
    return "High";
  };

  const getStockLevelColor = (level: string): string => {
    switch (level) {
      case "None":
        return "#f44336";
      case "Low":
        return "#FF9800";
      case "Medium":
        return "#FFC107";
      case "High":
        return "#4CAF50";
      default:
        return "#9E9E9E";
    }
  };

  // Check if product is expired
  const isExpired = (product: Product): boolean => {
    if (!product.useBy) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(product.useBy);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate < today;
  };

  // Check if product expires soon (within 7 days)
  const expiresSoon = (product: Product): boolean => {
    if (!product.useBy) return false;
    const today = new Date();
    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiryDate = new Date(product.useBy);
    return expiryDate >= today && expiryDate <= in7Days;
  };

  // Filter products
  let filteredProducts = products;
  if (filterCategory !== "All") {
    filteredProducts = filteredProducts.filter(
      (p) => p.category === filterCategory,
    );
  }
  if (filterStorage !== "All") {
    filteredProducts = filteredProducts.filter(
      (p) => p.storage === filterStorage,
    );
  }

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case "name":
        compareValue = a.name.localeCompare(b.name);
        break;
      case "category":
        compareValue = a.category.localeCompare(b.category);
        break;
      case "quantity":
        compareValue = a.quantity - b.quantity;
        break;
      case "useBy":
        if (!a.useBy && !b.useBy) compareValue = 0;
        else if (!a.useBy) compareValue = 1;
        else if (!b.useBy) compareValue = -1;
        else
          compareValue =
            new Date(a.useBy).getTime() - new Date(b.useBy).getTime();
        break;
    }

    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  const handleToggleToBuy = (product: Product) => {
    onUpdateProduct({ ...product, toBuy: !product.toBuy });
  };

  const handleToggleFrequentlyUsed = (product: Product) => {
    onUpdateProduct({ ...product, frequentlyUsed: !product.frequentlyUsed });
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Statistics
  const totalItems = products.length;
  const outOfStock = products.filter((p) => p.quantity === 0).length;
  const lowStock = products.filter(
    (p) => getStockLevel(p) === "Low" && p.quantity > 0,
  ).length;
  const expiredItems = products.filter((p) => isExpired(p)).length;
  const toBuyItems = products.filter((p) => p.toBuy).length;

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "28px" }}>📦 Inventory Dashboard</h2>
        <div style={{ display: "flex", gap: "12px" }}>
          <div>
            <label style={{ marginRight: "8px", fontWeight: "bold" }}>
              Category:
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: "8px 12px",
                fontSize: "14px",
                border: "2px solid #ddd",
                borderRadius: "6px",
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ marginRight: "8px", fontWeight: "bold" }}>
              Storage:
            </label>
            <select
              value={filterStorage}
              onChange={(e) => setFilterStorage(e.target.value)}
              style={{
                padding: "8px 12px",
                fontSize: "14px",
                border: "2px solid #ddd",
                borderRadius: "6px",
              }}
            >
              {storageLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: "1 1 180px",
            padding: "16px",
            backgroundColor: "#E3F2FD",
            borderRadius: "8px",
            borderLeft: "4px solid #2196F3",
          }}
        >
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#2196F3" }}
          >
            {totalItems}
          </div>
          <div style={{ color: "#666" }}>Total Items</div>
        </div>

        <div
          style={{
            flex: "1 1 180px",
            padding: "16px",
            backgroundColor: "#FFEBEE",
            borderRadius: "8px",
            borderLeft: "4px solid #f44336",
          }}
        >
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#f44336" }}
          >
            {outOfStock}
          </div>
          <div style={{ color: "#666" }}>Out of Stock</div>
        </div>

        <div
          style={{
            flex: "1 1 180px",
            padding: "16px",
            backgroundColor: "#FFF3E0",
            borderRadius: "8px",
            borderLeft: "4px solid #FF9800",
          }}
        >
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#FF9800" }}
          >
            {lowStock}
          </div>
          <div style={{ color: "#666" }}>Low Stock</div>
        </div>

        <div
          style={{
            flex: "1 1 180px",
            padding: "16px",
            backgroundColor: "#FCE4EC",
            borderRadius: "8px",
            borderLeft: "4px solid #E91E63",
          }}
        >
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#E91E63" }}
          >
            {expiredItems}
          </div>
          <div style={{ color: "#666" }}>Expired</div>
        </div>

        <div
          style={{
            flex: "1 1 180px",
            padding: "16px",
            backgroundColor: "#F3E5F5",
            borderRadius: "8px",
            borderLeft: "4px solid #9C27B0",
          }}
        >
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#9C27B0" }}
          >
            {toBuyItems}
          </div>
          <div style={{ color: "#666" }}>Shopping List</div>
        </div>
      </div>

      {/* Inventory Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderRadius: "8px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#4CAF50", color: "white" }}>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "left",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
                onClick={() => handleSort("name")}
              >
                Item Name{" "}
                {sortBy === "name" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "left",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
                onClick={() => handleSort("category")}
              >
                Category{" "}
                {sortBy === "category" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                Storage
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "right",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
                onClick={() => handleSort("quantity")}
              >
                Qty #{" "}
                {sortBy === "quantity" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                Unit
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                Stock Level
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                Purchased
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "left",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
                onClick={() => handleSort("useBy")}
              >
                Use By {sortBy === "useBy" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "center",
                  fontSize: "13px",
                }}
              >
                To Buy?
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "center",
                  fontSize: "13px",
                }}
              >
                Frequently Used?
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "center",
                  fontSize: "13px",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#999",
                    fontSize: "16px",
                  }}
                >
                  No items found. Add products using the Food or Cleaning forms.
                </td>
              </tr>
            ) : (
              sortedProducts.map((product) => {
                const stockLevel = getStockLevel(product);
                const stockColor = getStockLevelColor(stockLevel);
                const expired = isExpired(product);
                const expiringSoon = expiresSoon(product);

                return (
                  <tr
                    key={product.id}
                    style={{
                      borderBottom: "1px solid #eee",
                      backgroundColor: expired
                        ? "#FFEBEE"
                        : expiringSoon
                          ? "#FFF9C4"
                          : "white",
                    }}
                  >
                    <td style={{ padding: "12px 8px", fontWeight: "bold" }}>
                      {product.name}
                      {expired && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "11px",
                            color: "#f44336",
                            fontWeight: "bold",
                          }}
                        >
                          ⚠️ EXPIRED
                        </span>
                      )}
                      {expiringSoon && !expired && (
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "11px",
                            color: "#FF9800",
                            fontWeight: "bold",
                          }}
                        >
                          ⏰ Soon
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 8px", color: "#666" }}>
                      {product.category}
                    </td>
                    <td style={{ padding: "12px 8px", color: "#666" }}>
                      {product.storage}
                    </td>
                    <td
                      style={{
                        padding: "12px 8px",
                        textAlign: "right",
                        fontWeight: "bold",
                        color: product.quantity === 0 ? "#f44336" : "#333",
                      }}
                    >
                      {product.quantity.toFixed(2)}
                    </td>
                    <td style={{ padding: "12px 8px" }}>{product.unit}</td>
                    <td style={{ padding: "12px 8px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          backgroundColor: stockColor,
                          color: "white",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {stockLevel}
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px", fontSize: "13px" }}>
                      {product.purchased || "-"}
                    </td>
                    <td
                      style={{
                        padding: "12px 8px",
                        fontSize: "13px",
                        color: expired
                          ? "#f44336"
                          : expiringSoon
                            ? "#FF9800"
                            : "#333",
                        fontWeight: expired || expiringSoon ? "bold" : "normal",
                      }}
                    >
                      {product.useBy || "-"}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      <button
                        onClick={() => handleToggleToBuy(product)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: product.toBuy
                            ? "#9C27B0"
                            : "#f5f5f5",
                          color: product.toBuy ? "white" : "#666",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: product.toBuy ? "bold" : "normal",
                        }}
                      >
                        {product.toBuy ? "✓ Yes" : "No"}
                      </button>
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      <button
                        onClick={() => handleToggleFrequentlyUsed(product)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: product.frequentlyUsed
                            ? "#FF9800"
                            : "#f5f5f5",
                          color: product.frequentlyUsed ? "white" : "#666",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: product.frequentlyUsed
                            ? "bold"
                            : "normal",
                        }}
                      >
                        {product.frequentlyUsed ? "⭐ Yes" : "No"}
                      </button>
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${product.name}?`)) {
                            onDeleteProduct(product.id);
                          }
                        }}
                        style={{
                          padding: "6px 10px",
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Export/Print Info */}
      <div
        style={{
          marginTop: "20px",
          padding: "12px",
          backgroundColor: "#E3F2FD",
          borderRadius: "6px",
          fontSize: "13px",
          color: "#1565C0",
        }}
      >
        💡 <strong>Tip:</strong> Click column headers to sort. Use filters to
        view specific categories or storage locations. Toggle "To Buy" to build
        your shopping list.
      </div>
    </div>
  );
}
