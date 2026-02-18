import type { Product } from "../../types/Product";
import { useProductList } from "./useProductList";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
  Box,
} from "@mui/material";

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
  const { editingProduct, setEditingProduct } = useProductList();

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
      <Dialog
        open={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        maxWidth="sm"
        fullWidth
      >
        {editingProduct && (
          <EditProductModal
            product={editingProduct}
            onSave={(updatedProduct) => {
              onEdit(updatedProduct);
              setEditingProduct(null);
            }}
            onCancel={() => setEditingProduct(null)}
          />
        )}
      </Dialog>
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
    <>
      <DialogTitle>✏️ Edit Product</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* Product Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Product Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              variant="outlined"
            />
          </Grid>

          {/* Category */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                label="Category"
              >
                <MenuItem value="food">🍎 Food</MenuItem>
                <MenuItem value="cleaning">🧹 Cleaning</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Quantity & Unit */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Quantity"
              value={formData.quantity}
              onChange={(e) =>
                handleChange("quantity", parseFloat(e.target.value))
              }
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Unit"
              value={formData.unit}
              onChange={(e) => handleChange("unit", e.target.value)}
              variant="outlined"
            />
          </Grid>

          {/* Minimum Stock */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Minimum Stock"
              value={formData.minStock}
              onChange={(e) =>
                handleChange("minStock", parseFloat(e.target.value))
              }
              variant="outlined"
            />
          </Grid>

          {/* Storage Location */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Storage Location"
              value={formData.storage}
              onChange={(e) => handleChange("storage", e.target.value)}
              placeholder="e.g., Fridge, Pantry, Under sink"
              variant="outlined"
            />
          </Grid>

          {/* Purchased Date */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="date"
              label="Purchased Date"
              value={formData.purchased}
              onChange={(e) => handleChange("purchased", e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Use By / Expiration Date */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="date"
              label="Use By / Expiration Date"
              value={formData.useBy}
              onChange={(e) => handleChange("useBy", e.target.value)}
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Checkboxes */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.frequentlyUsed}
                    onChange={() => handleToggle("frequentlyUsed")}
                  />
                }
                label="★ Frequently Used"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.toBuy}
                    onChange={() => handleToggle("toBuy")}
                  />
                }
                label="🛒 To Buy"
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button
          onClick={() => onSave(formData)}
          variant="contained"
          color="success"
        >
          💾 Save Changes
        </Button>
      </DialogActions>
    </>
  );
}
