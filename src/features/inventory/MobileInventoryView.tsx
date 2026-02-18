import type { Product } from "../../types/Product";
import { useMobileInventoryView } from "./useMobileInventoryView";
import "./MobileInventory.css";

interface MobileInventoryViewProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onNavigateToForm?: () => void;
  onNavigateToReceipt?: () => void;
  onNavigateToBarcode?: () => void;
}

export function MobileInventoryView({
  products,
  onUpdateProduct,
  onDeleteProduct,
  onNavigateToForm,
  onNavigateToReceipt,
  onNavigateToBarcode,
}: MobileInventoryViewProps) {
  const {
    searchQuery,
    expandedCategory,
    selectedProduct,
    isBottomSheetOpen,
    editingProduct,
    showFloatingButton,
    fabMenuOpen,
    filteredProducts,
    categorizedProducts,
    lowStockProducts,
    frequentProducts,
    setSearchQuery,
    setExpandedCategory,
    setEditingProduct,
    setFabMenuOpen,
    getStockStatus,
    getStockIcon,
    handleProductTap,
    closeBottomSheet,
  } = useMobileInventoryView({ products });

  const handleSave = () => {
    if (editingProduct) {
      onUpdateProduct(editingProduct);
      closeBottomSheet();
    }
  };

  const handleDelete = () => {
    if (selectedProduct) {
      if (confirm(`Delete ${selectedProduct.name}?`)) {
        onDeleteProduct(selectedProduct.id);
        closeBottomSheet();
      }
    }
  };

  return (
    <div className="mobile-inventory">
      {/* Statistics Cards */}
      <div className="inventory-stats-grid mobile-stats">
        <div className="stat-card stat-blue">
          <div className="stat-value">{products.length}</div>
          <div className="stat-label">Items</div>
        </div>

        <div className="stat-card stat-red">
          <div className="stat-value">
            {products.filter((p) => p.quantity === 0).length}
          </div>
          <div className="stat-label">Out</div>
        </div>

        <div className="stat-card stat-orange">
          <div className="stat-value">
            {
              products.filter((p) => p.quantity > 0 && p.quantity <= p.minStock)
                .length
            }
          </div>
          <div className="stat-label">Low</div>
        </div>

        <div className="stat-card stat-pink">
          <div className="stat-value">
            {
              products.filter((p) => {
                if (!p.useBy) return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const expiryDate = new Date(p.useBy);
                expiryDate.setHours(0, 0, 0, 0);
                return expiryDate < today;
              }).length
            }
          </div>
          <div className="stat-label">Expired</div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-value">
            {products.filter((p) => p.toBuy).length}
          </div>
          <div className="stat-label">To Buy</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mobile-search-container">
        <div className="mobile-search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mobile-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="search-clear-btn"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Mobile Action Bar */}
      <div className="mobile-action-bar">
        {onNavigateToForm && (
          <button onClick={onNavigateToForm} className="mobile-action-btn">
            <span className="action-icon">➕</span>
            <span className="action-label">Add</span>
          </button>
        )}
        {onNavigateToReceipt && (
          <button onClick={onNavigateToReceipt} className="mobile-action-btn">
            <span className="action-icon">📸</span>
            <span className="action-label">Receipt</span>
          </button>
        )}
        {onNavigateToBarcode && (
          <button onClick={onNavigateToBarcode} className="mobile-action-btn">
            <span className="action-icon">📷</span>
            <span className="action-label">Barcode</span>
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="mobile-quick-filters">
        <button className="quick-filter-chip">
          <span>All ({filteredProducts.length})</span>
        </button>
        <button className="quick-filter-chip accent">
          <span>Low Stock ({lowStockProducts.length})</span>
        </button>
        <button className="quick-filter-chip">
          <span>Frequent ({frequentProducts.length})</span>
        </button>
      </div>

      {/* Smart Groups */}
      {lowStockProducts.length > 0 && (
        <div className="mobile-product-group">
          <h3 className="mobile-group-title">
            ⚠️ Low Stock ({lowStockProducts.length})
          </h3>
          <div className="mobile-product-list">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="mobile-product-row"
                onClick={() => handleProductTap(product)}
              >
                <div className="mobile-product-info">
                  <span className="mobile-product-name">{product.name}</span>
                  <span className="mobile-product-category">
                    {product.category}
                  </span>
                </div>
                <div className="mobile-product-status">
                  <span className="mobile-product-quantity">
                    {product.quantity} {product.unit}
                  </span>
                  <span className="mobile-stock-icon">
                    {getStockIcon(getStockStatus(product))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {frequentProducts.length > 0 && (
        <div className="mobile-product-group">
          <h3 className="mobile-group-title">⭐ Frequently Used</h3>
          <div className="mobile-product-list">
            {frequentProducts.map((product) => (
              <div
                key={product.id}
                className="mobile-product-row"
                onClick={() => handleProductTap(product)}
              >
                <div className="mobile-product-info">
                  <span className="mobile-product-name">{product.name}</span>
                  <span className="mobile-product-category">
                    {product.category}
                  </span>
                </div>
                <div className="mobile-product-status">
                  <span className="mobile-product-quantity">
                    {product.quantity} {product.unit}
                  </span>
                  <span className="mobile-stock-icon">
                    {getStockIcon(getStockStatus(product))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Items by Category (Accordion) */}
      <div className="mobile-product-group">
        <h3 className="mobile-group-title">📦 All Items</h3>

        {Object.entries(categorizedProducts).map(
          ([category, items]: [string, Product[]]) => {
            const isExpanded = expandedCategory === category;

            return (
              <div key={category} className="mobile-accordion">
                <button
                  className="mobile-accordion-header"
                  onClick={() =>
                    setExpandedCategory(isExpanded ? null : category)
                  }
                >
                  <span className="accordion-title">
                    {isExpanded ? "▼" : "▶"} {category} ({items.length})
                  </span>
                </button>

                {isExpanded && (
                  <div className="mobile-accordion-content">
                    {items.map((product) => (
                      <div
                        key={product.id}
                        className="mobile-product-row"
                        onClick={() => handleProductTap(product)}
                      >
                        <div className="mobile-product-info">
                          <span className="mobile-product-name">
                            {product.name}
                          </span>
                        </div>
                        <div className="mobile-product-status">
                          <span className="mobile-product-quantity">
                            {product.quantity} {product.unit}
                          </span>
                          <span className="mobile-stock-icon">
                            {getStockIcon(getStockStatus(product))}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>

      {/* Bottom Sheet Modal */}
      {isBottomSheetOpen && editingProduct && (
        <>
          <div className="bottom-sheet-overlay" onClick={closeBottomSheet} />
          <div className="bottom-sheet">
            <div className="bottom-sheet-handle" />

            <div className="bottom-sheet-header">
              <h2 className="bottom-sheet-title">{editingProduct.name}</h2>
              <button onClick={closeBottomSheet} className="bottom-sheet-close">
                ✕
              </button>
            </div>

            <div className="bottom-sheet-content">
              <div className="bottom-sheet-field">
                <label>Quantity</label>
                <div className="quantity-controls">
                  <button
                    onClick={() =>
                      setEditingProduct({
                        ...editingProduct,
                        quantity: Math.max(0, editingProduct.quantity - 0.5),
                      })
                    }
                    className="quantity-btn"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={editingProduct.quantity}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        quantity: Number(e.target.value),
                      })
                    }
                    className="quantity-input"
                  />
                  <span className="quantity-unit">{editingProduct.unit}</span>
                  <button
                    onClick={() =>
                      setEditingProduct({
                        ...editingProduct,
                        quantity: editingProduct.quantity + 0.5,
                      })
                    }
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bottom-sheet-field">
                <label>Min Stock</label>
                <input
                  type="number"
                  value={editingProduct.minStock}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      minStock: Number(e.target.value),
                    })
                  }
                  className="bottom-sheet-input"
                />
              </div>

              <div className="bottom-sheet-field">
                <label>Storage</label>
                <input
                  type="text"
                  value={editingProduct.storage || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      storage: e.target.value,
                    })
                  }
                  className="bottom-sheet-input"
                  placeholder="e.g., Fridge, Pantry"
                />
              </div>

              {editingProduct.useBy && (
                <div className="bottom-sheet-field">
                  <label>Use By</label>
                  <input
                    type="date"
                    value={editingProduct.useBy}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        useBy: e.target.value,
                      })
                    }
                    className="bottom-sheet-input"
                  />
                </div>
              )}

              <div className="bottom-sheet-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingProduct.frequentlyUsed}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        frequentlyUsed: e.target.checked,
                      })
                    }
                  />
                  <span>Frequently Used</span>
                </label>
              </div>

              <div className="bottom-sheet-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingProduct.toBuy}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        toBuy: e.target.checked,
                      })
                    }
                  />
                  <span>Add to Shopping List</span>
                </label>
              </div>
            </div>

            <div className="bottom-sheet-actions">
              <button onClick={handleDelete} className="btn-delete">
                Delete
              </button>
              <button onClick={handleSave} className="btn-save">
                Save Changes
              </button>
            </div>
          </div>
        </>
      )}

      {/* Floating Action Button - appears when scrolled down */}
      {showFloatingButton && (
        <>
          {/* FAB Menu Items */}
          {fabMenuOpen && (
            <div className="fab-menu">
              {onNavigateToForm && (
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    onNavigateToForm();
                    setFabMenuOpen(false);
                  }}
                  className="fab-menu-item"
                >
                  <span className="fab-icon">➕</span>
                  <span className="fab-label">Add Items</span>
                </button>
              )}
              {onNavigateToReceipt && (
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    onNavigateToReceipt();
                    setFabMenuOpen(false);
                  }}
                  className="fab-menu-item"
                >
                  <span className="fab-icon">📸</span>
                  <span className="fab-label">Receipt</span>
                </button>
              )}
              {onNavigateToBarcode && (
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    onNavigateToBarcode();
                    setFabMenuOpen(false);
                  }}
                  className="fab-menu-item"
                >
                  <span className="fab-icon">📷</span>
                  <span className="fab-label">Barcode</span>
                </button>
              )}
            </div>
          )}

          {/* Main FAB Button */}
          <button
            onClick={() => setFabMenuOpen(!fabMenuOpen)}
            className={`floating-action-btn ${fabMenuOpen ? "open" : ""}`}
          >
            {fabMenuOpen ? "✕" : "➕"}
          </button>
        </>
      )}
    </div>
  );
}
