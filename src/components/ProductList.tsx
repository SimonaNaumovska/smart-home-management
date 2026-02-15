import type { Product } from "../types/Product";

interface ProductListProps {
  products: Product[];
  onUse: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
}

export function ProductList({ products, onUse, onDelete }: ProductListProps) {
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
    </>
  );
}
