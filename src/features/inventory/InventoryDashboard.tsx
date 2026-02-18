import type { Product } from "../../types/Product";
import { useInventoryDashboard } from "./useInventoryDashboard";

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
  const {
    filterCategory,
    filterStorage,
    sortBy,
    sortOrder,
    categories,
    storageLocations,
    sortedProducts,
    setFilterCategory,
    setFilterStorage,
    getStockLevel,
    getStockLevelColor,
    isExpired,
    expiresSoon,
    handleSort,
  } = useInventoryDashboard({ products });
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
      {/* Card View - Mobile */}
      <div className="card-view">
        {sortedProducts.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#999",
              fontSize: "16px",
              backgroundColor: "white",
              borderRadius: "8px",
            }}
          >
            No items found. Add products using the Food or Cleaning forms.
          </div>
        ) : (
          sortedProducts.map((product) => {
            const stockLevel = getStockLevel(product);
            const stockColor = getStockLevelColor(stockLevel);
            const expired = isExpired(product);
            const expiringSoon = expiresSoon(product);

            return (
              <div
                key={product.id}
                className="product-card"
                style={{
                  borderLeft: expired
                    ? "4px solid #f44336"
                    : expiringSoon
                      ? "4px solid #ff9800"
                      : stockLevel === "Low" || stockLevel === "None"
                        ? "4px solid #ff9800"
                        : "4px solid #4caf50",
                  backgroundColor: expired
                    ? "#ffebee"
                    : expiringSoon
                      ? "#fff9c4"
                      : "white",
                }}
              >
                <div className="product-card-header">
                  <div style={{ flex: 1 }}>
                    <h3 className="product-card-title">{product.name}</h3>
                    <span className="product-card-category">
                      {product.category}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      alignItems: "flex-end",
                    }}
                  >
                    {expired && (
                      <span
                        className="badge badge-danger"
                        style={{ fontSize: "10px" }}
                      >
                        ⚠️ EXPIRED
                      </span>
                    )}
                    {expiringSoon && !expired && (
                      <span
                        className="badge badge-warning"
                        style={{ fontSize: "10px" }}
                      >
                        ⏰ SOON
                      </span>
                    )}
                    <span
                      className="badge"
                      style={{
                        backgroundColor: stockColor,
                        color: "white",
                        fontSize: "10px",
                      }}
                    >
                      {stockLevel}
                    </span>
                  </div>
                </div>

                <div className="product-card-body">
                  <div className="product-card-field">
                    <span className="product-card-label">Quantity</span>
                    <span
                      className="product-card-value"
                      style={{
                        color: product.quantity === 0 ? "#f44336" : "#333",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      {product.quantity.toFixed(2)} {product.unit}
                    </span>
                  </div>

                  <div className="product-card-field">
                    <span className="product-card-label">Storage</span>
                    <span className="product-card-value">
                      {product.storage || "—"}
                    </span>
                  </div>

                  <div className="product-card-field">
                    <span className="product-card-label">Purchased</span>
                    <span className="product-card-value">
                      {product.purchased || "—"}
                    </span>
                  </div>

                  <div className="product-card-field">
                    <span className="product-card-label">Use By</span>
                    <span
                      className="product-card-value"
                      style={{
                        color: expired
                          ? "#f44336"
                          : expiringSoon
                            ? "#ff9800"
                            : "#333",
                        fontWeight: expired || expiringSoon ? "bold" : "normal",
                      }}
                    >
                      {product.useBy || "—"}
                    </span>
                  </div>

                  <div className="product-card-field">
                    <span className="product-card-label">To Buy?</span>
                    <button
                      onClick={() => handleToggleToBuy(product)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: product.toBuy ? "#9C27B0" : "#f5f5f5",
                        color: product.toBuy ? "white" : "#666",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: product.toBuy ? "bold" : "normal",
                        width: "fit-content",
                      }}
                    >
                      {product.toBuy ? "✓ Yes" : "No"}
                    </button>
                  </div>

                  <div className="product-card-field">
                    <span className="product-card-label">Frequent?</span>
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
                        fontWeight: product.frequentlyUsed ? "bold" : "normal",
                        width: "fit-content",
                      }}
                    >
                      {product.frequentlyUsed ? "⭐ Yes" : "No"}
                    </button>
                  </div>
                </div>

                <div className="product-card-actions">
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${product.name}?`)) {
                        onDeleteProduct(product.id);
                      }
                    }}
                    style={{
                      backgroundColor: "#f44336",
                      color: "white",
                    }}
                  >
                    🗑️ Delete
                  </button>
                  <button
                    onClick={() => onUpdateProduct({ ...product })}
                    style={{
                      backgroundColor: "#2196f3",
                      color: "white",
                    }}
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Table View - Desktop */}
      <div className="table-view table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort("name")}>
                Item Name{" "}
                {sortBy === "name" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th className="sortable" onClick={() => handleSort("category")}>
                Category{" "}
                {sortBy === "category" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th>Storage</th>
              <th
                className="sortable"
                onClick={() => handleSort("quantity")}
                style={{ textAlign: "right" }}
              >
                Qty #{" "}
                {sortBy === "quantity" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th>Unit</th>
              <th>Stock Level</th>
              <th>Purchased</th>
              <th className="sortable" onClick={() => handleSort("useBy")}>
                Use By {sortBy === "useBy" && (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th style={{ textAlign: "center" }}>To Buy?</th>
              <th style={{ textAlign: "center" }}>Frequent?</th>
              <th style={{ textAlign: "center" }}>Actions</th>
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
                      backgroundColor: expired
                        ? "#FFEBEE"
                        : expiringSoon
                          ? "#FFF9C4"
                          : "white",
                    }}
                  >
                    <td style={{ fontWeight: "600" }}>
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
                    <td style={{ color: "#666" }}>{product.category}</td>
                    <td style={{ color: "#666" }}>{product.storage}</td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: "bold",
                        color: product.quantity === 0 ? "#f44336" : "#333",
                      }}
                    >
                      {product.quantity.toFixed(2)}
                    </td>
                    <td>{product.unit}</td>
                    <td>
                      <span
                        className="badge"
                        style={{ backgroundColor: stockColor, color: "white" }}
                      >
                        {stockLevel}
                      </span>
                    </td>
                    <td>{product.purchased || "-"}</td>
                    <td
                      style={{
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
                    <td style={{ textAlign: "center" }}>
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
                    <td style={{ textAlign: "center" }}>
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
                    <td style={{ textAlign: "center" }}>
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
