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
  return (
    <>
      <h2>Products</h2>

      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f5f5f5",
                  borderBottom: "2px solid #ddd",
                }}
              >
                <th
                  style={{
                    padding: "8px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Item Name
                </th>
                <th
                  style={{
                    padding: "8px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Category
                </th>
                <th
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    border: "1px solid #ddd",
                  }}
                >
                  Qty
                </th>
                <th
                  style={{
                    padding: "8px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Unit
                </th>
                <th
                  style={{
                    padding: "8px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Stock Level
                </th>
                <th
                  style={{
                    padding: "8px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Storage
                </th>
                <th
                  style={{
                    padding: "8px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Purchased
                </th>
                <th
                  style={{
                    padding: "8px",
                    textAlign: "left",
                    border: "1px solid #ddd",
                  }}
                >
                  Use By
                </th>
                <th
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    border: "1px solid #ddd",
                  }}
                >
                  To Buy?
                </th>
                <th
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    border: "1px solid #ddd",
                  }}
                >
                  Frequently Used?
                </th>
                <th
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    border: "1px solid #ddd",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {product.name}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {product.category}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    {product.quantity}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {product.unit}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {product.quantity <= product.minStock ? (
                      <span style={{ color: "#dc3545", fontWeight: "bold" }}>
                        Low ({product.quantity}/{product.minStock})
                      </span>
                    ) : (
                      <span style={{ color: "#28a745" }}>
                        OK ({product.quantity}/{product.minStock})
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {product.storage}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {product.purchased || "—"}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {product.useBy ? (
                      new Date(product.useBy) < new Date() ? (
                        <span style={{ color: "#dc3545", fontWeight: "bold" }}>
                          Expired
                        </span>
                      ) : (
                        product.useBy
                      )
                    ) : (
                      "—"
                    )}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    {product.toBuy ? "✓" : ""}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    {product.frequentlyUsed ? "★" : ""}
                  </td>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #ddd",
                      textAlign: "center",
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
                        marginRight: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                    >
                      Use
                    </button>
                    <button
                      onClick={() => setEditingProduct(product)}
                      style={{
                        marginRight: "4px",
                        padding: "4px 8px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: "3px",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(product.id)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: "3px",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        padding: "30px",
        maxWidth: "500px",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
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
