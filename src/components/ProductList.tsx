import { useState } from "react";
import type { Product } from "../types/Product";

interface ProductListProps {
  products: Product[];
  onUse: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
}

export function ProductList({
  products,
  onUse,
  onDelete,
  onEdit,
}: ProductListProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const renderCardView = () => (
    <div className="card-view">
      {products.map((product) => {
        const isLowStock = product.quantity <= product.minStock;
        const isExpired = product.useBy && new Date(product.useBy) < new Date();

        return (
          <div
            key={product.id}
            className="product-card"
            style={{
              borderLeft: isLowStock
                ? "4px solid #f44336"
                : isExpired
                  ? "4px solid #ff9800"
                  : "4px solid #4caf50",
            }}
          >
            <div className="product-card-header">
              <div style={{ flex: 1 }}>
                <h3 className="product-card-title">{product.name}</h3>
                <span className="product-card-category">
                  {product.category}
                </span>
              </div>
              {isLowStock && (
                <span
                  className="badge badge-danger"
                  style={{ fontSize: "11px" }}
                >
                  LOW STOCK
                </span>
              )}
              {isExpired && (
                <span
                  className="badge badge-warning"
                  style={{ fontSize: "11px" }}
                >
                  EXPIRED
                </span>
              )}
            </div>

            <div className="product-card-body">
              <div className="product-card-field">
                <span className="product-card-label">Quantity</span>
                <span
                  className="product-card-value"
                  style={{
                    color: isLowStock ? "#f44336" : "#333",
                    fontWeight: isLowStock ? "bold" : "normal",
                  }}
                >
                  {product.quantity} {product.unit}
                </span>
              </div>

              <div className="product-card-field">
                <span className="product-card-label">Min Stock</span>
                <span className="product-card-value">
                  {product.minStock} {product.unit}
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

              {product.useBy && (
                <div className="product-card-field">
                  <span className="product-card-label">Use By</span>
                  <span
                    className="product-card-value"
                    style={{
                      color: isExpired ? "#f44336" : "#333",
                      fontWeight: isExpired ? "bold" : "normal",
                    }}
                  >
                    {product.useBy}
                  </span>
                </div>
              )}

              <div className="product-card-field">
                <span className="product-card-label">Status</span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {product.toBuy && (
                    <span className="badge badge-info">To Buy</span>
                  )}
                  {product.frequentlyUsed && (
                    <span className="badge badge-secondary">⭐ Frequent</span>
                  )}
                </div>
              </div>
            </div>

            <div className="product-card-actions">
              <button
                onClick={() => {
                  const amount = Number(prompt("How much used?"));
                  if (!isNaN(amount) && amount > 0) {
                    onUse(product.id, amount);
                  }
                }}
                style={{
                  backgroundColor: "#4caf50",
                  color: "white",
                }}
              >
                📝 Use
              </button>
              <button
                onClick={() => setEditingProduct(product)}
                style={{
                  backgroundColor: "#2196f3",
                  color: "white",
                }}
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => onDelete(product.id)}
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                }}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTableView = () => (
    <div className="table-view table-container">
      <table className="responsive-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th style={{ textAlign: "center" }}>Qty</th>
            <th>Unit</th>
            <th>Stock Level</th>
            <th>Storage</th>
            <th>Purchased</th>
            <th>Use By</th>
            <th style={{ textAlign: "center" }}>To Buy?</th>
            <th style={{ textAlign: "center" }}>Frequent?</th>
            <th style={{ textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const isLowStock = product.quantity <= product.minStock;
            const isExpired =
              product.useBy && new Date(product.useBy) < new Date();

            return (
              <tr
                key={product.id}
                style={{
                  backgroundColor: isExpired
                    ? "#ffebee"
                    : isLowStock
                      ? "#fff3e0"
                      : "white",
                }}
              >
                <td style={{ fontWeight: "600" }}>{product.name}</td>
                <td>{product.category}</td>
                <td style={{ textAlign: "center", fontWeight: "600" }}>
                  {product.quantity}
                </td>
                <td>{product.unit}</td>
                <td>
                  {isLowStock ? (
                    <span className="badge badge-danger">
                      Low ({product.quantity}/{product.minStock})
                    </span>
                  ) : (
                    <span className="badge badge-success">
                      OK ({product.quantity}/{product.minStock})
                    </span>
                  )}
                </td>
                <td>{product.storage || "—"}</td>
                <td>{product.purchased || "—"}</td>
                <td
                  style={{
                    color: isExpired ? "#f44336" : "#333",
                    fontWeight: isExpired ? "bold" : "normal",
                  }}
                >
                  {product.useBy ? (
                    isExpired ? (
                      <span>⚠️ {product.useBy}</span>
                    ) : (
                      product.useBy
                    )
                  ) : (
                    "—"
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  {product.toBuy ? "✅" : ""}
                </td>
                <td style={{ textAlign: "center" }}>
                  {product.frequentlyUsed ? "⭐" : ""}
                </td>
                <td style={{ textAlign: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => {
                        const amount = Number(prompt("How much used?"));
                        if (!isNaN(amount) && amount > 0) {
                          onUse(product.id, amount);
                        }
                      }}
                      style={{
                        padding: "6px 10px",
                        backgroundColor: "#4caf50",
                        color: "white",
                        fontSize: "12px",
                      }}
                    >
                      Use
                    </button>
                    <button
                      onClick={() => setEditingProduct(product)}
                      style={{
                        padding: "6px 10px",
                        backgroundColor: "#2196f3",
                        color: "white",
                        fontSize: "12px",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      style={{
                        padding: "6px 10px",
                        backgroundColor: "#f44336",
                        color: "white",
                        fontSize: "12px",
                      }}
                    >
                      Del
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <h2>Products</h2>

      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <>
          {renderCardView()}
          {renderTableView()}
        </>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setEditingProduct(null)}
        >
          <EditProductModal
            product={editingProduct}
            onSave={(updatedProduct) => {
              onEdit(updatedProduct);
              setEditingProduct(null);
            }}
            onCancel={() => setEditingProduct(null)}
          />
        </div>
      )}
    </>
  );
}

// Edit Product Modal Component
interface EditProductModalProps {
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

function EditProductModal({
  product,
  onSave,
  onCancel,
}: EditProductModalProps) {
  const [formData, setFormData] = useState<Product>(product);

  const handleChange = (field: keyof Product, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggle = (field: keyof Product) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: window.innerWidth < 768 ? "20px" : "30px",
        width: window.innerWidth < 768 ? "calc(100% - 40px)" : "auto",
        maxWidth: window.innerWidth < 768 ? "none" : "500px",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        margin: window.innerWidth < 768 ? "20px" : "0",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h2 style={{ marginBottom: "20px", color: "#333" }}>✏️ Edit Product</h2>

      <div style={{ marginBottom: "15px" }}>
        <label
          style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}
        >
          Product Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label
          style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}
        >
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) => handleChange("category", e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            boxSizing: "border-box",
          }}
        >
          <option value="food">🍎 Food</option>
          <option value="cleaning">🧹 Cleaning</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            Quantity
          </label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              handleChange("quantity", parseFloat(e.target.value))
            }
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            Unit
          </label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => handleChange("unit", e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label
          style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}
        >
          Minimum Stock
        </label>
        <input
          type="number"
          value={formData.minStock}
          onChange={(e) => handleChange("minStock", parseFloat(e.target.value))}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label
          style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}
        >
          Storage Location
        </label>
        <input
          type="text"
          value={formData.storage}
          onChange={(e) => handleChange("storage", e.target.value)}
          placeholder="e.g., Fridge, Pantry, Under sink"
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label
          style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}
        >
          Purchased Date
        </label>
        <input
          type="date"
          value={formData.purchased}
          onChange={(e) => handleChange("purchased", e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label
          style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}
        >
          Use By / Expiration Date
        </label>
        <input
          type="date"
          value={formData.useBy}
          onChange={(e) => handleChange("useBy", e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: "20px", display: "flex", gap: "15px" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={formData.frequentlyUsed}
            onChange={() => handleToggle("frequentlyUsed")}
          />
          <span>★ Frequently Used</span>
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={formData.toBuy}
            onChange={() => handleToggle("toBuy")}
          />
          <span>🛒 To Buy</span>
        </label>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => onSave(formData)}
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          💾 Save Changes
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
