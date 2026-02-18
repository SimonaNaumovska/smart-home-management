import type { Product, User, Room } from "../../types/Product";
import { useInventoryView } from "./useInventoryView";
import { FoodForm } from "./FoodForm";
import { CleaningForm } from "./CleaningForm";
import { ProductList } from "./ProductList";
import { ReceiptScanner } from "./ReceiptScanner";
import BarcodeScanner from "./BarcodeScanner";
import { MobileInventoryView } from "./MobileInventoryView";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";
import ReceiptIcon from "@mui/icons-material/Receipt";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface InventoryViewProps {
  products: Product[];
  activeUser: User | null;
  rooms: Room[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onBulkAddItems: (items: Partial<Product>[]) => Promise<number>;
}

export const InventoryView = ({
  products,
  activeUser,
  rooms,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBulkAddItems,
}: InventoryViewProps) => {
  const {
    inventoryTab,
    inventoryView,
    isMobileView,
    setInventoryTab,
    setInventoryView,
    foodForm,
    cleaningForm,
    addProduct,
    handleBulkAdd,
  } = useInventoryView({ onAddProduct, onBulkAddItems });

  return (
    <>
      {/* Header */}
      <Box className="inventory-header-section">
        <Typography variant="h4" component="h2">
          📦 Inventory Management
        </Typography>
      </Box>

      {/* Active user indicator */}
      {activeUser && (
        <Chip
          avatar={
            <span style={{ fontSize: "1.25rem", marginLeft: "8px" }}>
              {activeUser.avatar}
            </span>
          }
          label={`Active User: ${activeUser.name}`}
          className="active-user-badge"
          sx={{
            bgcolor: activeUser.color,
            color: "white",
            fontWeight: "bold",
            fontSize: "1rem",
            py: 2.5,
          }}
        />
      )}

      {/* Mobile Back Button */}
      {isMobileView && inventoryView !== "dashboard" && (
        <Button
          onClick={() => setInventoryView("dashboard")}
          className="mobile-back-btn"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Back to Inventory
        </Button>
      )}

      {inventoryView === "dashboard" ? (
        isMobileView ? (
          <MobileInventoryView
            products={products}
            onUpdateProduct={onUpdateProduct}
            onDeleteProduct={onDeleteProduct}
            onNavigateToForm={() => setInventoryView("form")}
            onNavigateToReceipt={() => setInventoryView("receipt")}
            onNavigateToBarcode={() => setInventoryView("barcode")}
          />
        ) : (
          <>
            {/* Statistics Cards */}
            <Grid container spacing={2} className="inventory-stats-grid">
              <Grid item xs={12} sm={6} md={2.4}>
                <Card className="stat-card stat-blue">
                  <CardContent>
                    <Typography
                      variant="h3"
                      component="div"
                      className="stat-value"
                    >
                      {products.length}
                    </Typography>
                    <Typography variant="body2" className="stat-label">
                      Total Items
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <Card className="stat-card stat-red">
                  <CardContent>
                    <Typography
                      variant="h3"
                      component="div"
                      className="stat-value"
                    >
                      {products.filter((p) => p.quantity === 0).length}
                    </Typography>
                    <Typography variant="body2" className="stat-label">
                      Out of Stock
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <Card className="stat-card stat-orange">
                  <CardContent>
                    <Typography
                      variant="h3"
                      component="div"
                      className="stat-value"
                    >
                      {
                        products.filter(
                          (p) => p.quantity > 0 && p.quantity <= p.minStock,
                        ).length
                      }
                    </Typography>
                    <Typography variant="body2" className="stat-label">
                      Low Stock
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <Card className="stat-card stat-pink">
                  <CardContent>
                    <Typography
                      variant="h3"
                      component="div"
                      className="stat-value"
                    >
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
                    </Typography>
                    <Typography variant="body2" className="stat-label">
                      Expired
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <Card className="stat-card stat-purple">
                  <CardContent>
                    <Typography
                      variant="h3"
                      component="div"
                      className="stat-value"
                    >
                      {products.filter((p) => p.toBuy).length}
                    </Typography>
                    <Typography variant="body2" className="stat-label">
                      Shopping List
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Compact Icon Toolbar - BELOW Stats */}
            <Box
              className="inventory-toolbar"
              sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
            >
              <Button
                onClick={() => setInventoryView("dashboard")}
                className="toolbar-icon-btn active"
                variant="contained"
                startIcon={<DashboardIcon />}
              >
                Dashboard
              </Button>
              <Button
                onClick={() => setInventoryView("form")}
                className="toolbar-icon-btn"
                variant="outlined"
                startIcon={<AddIcon />}
              >
                Add Items
              </Button>
              <Button
                onClick={() => setInventoryView("receipt")}
                className="toolbar-icon-btn"
                variant="outlined"
                startIcon={<ReceiptIcon />}
              >
                Receipt
              </Button>
              <Button
                onClick={() => setInventoryView("barcode")}
                className="toolbar-icon-btn"
                variant="outlined"
                startIcon={<QrCodeScannerIcon />}
              >
                Barcode
              </Button>
            </Box>

            {/* Product List */}
            <ProductList
              products={products}
              onUse={() => {}}
              onDelete={onDeleteProduct}
              onEdit={onUpdateProduct}
            />
          </>
        )
      ) : (
        <>
          {/* Compact Icon Toolbar - For non-dashboard views (Desktop only) */}
          {!isMobileView && (
            <Box
              className="inventory-toolbar"
              sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}
            >
              <Button
                onClick={() => setInventoryView("dashboard")}
                className="toolbar-icon-btn"
                variant="outlined"
                startIcon={<DashboardIcon />}
              >
                Dashboard
              </Button>
              <Button
                onClick={() => setInventoryView("form")}
                className={`toolbar-icon-btn ${inventoryView === "form" ? "active" : ""}`}
                variant={inventoryView === "form" ? "contained" : "outlined"}
                startIcon={<AddIcon />}
              >
                Add Items
              </Button>
              <Button
                onClick={() => setInventoryView("receipt")}
                className={`toolbar-icon-btn ${inventoryView === "receipt" ? "active" : ""}`}
                variant={inventoryView === "receipt" ? "contained" : "outlined"}
                startIcon={<ReceiptIcon />}
              >
                Receipt
              </Button>
              <Button
                onClick={() => setInventoryView("barcode")}
                className={`toolbar-icon-btn ${inventoryView === "barcode" ? "active" : ""}`}
                variant={inventoryView === "barcode" ? "contained" : "outlined"}
                startIcon={<QrCodeScannerIcon />}
              >
                Barcode
              </Button>
            </Box>
          )}

          {inventoryView === "receipt" ? (
            <ReceiptScanner onAddItems={handleBulkAdd} />
          ) : inventoryView === "barcode" ? (
            <BarcodeScanner onAddProduct={addProduct} />
          ) : inventoryView === "form" ? (
            <>
              {/* Inventory Sub-tabs */}
              <Box className="sub-tabs" sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Button
                  onClick={() => setInventoryTab("food")}
                  className={`sub-tab-btn ${inventoryTab === "food" ? "active food" : ""}`}
                  variant={inventoryTab === "food" ? "contained" : "outlined"}
                  color={inventoryTab === "food" ? "success" : "inherit"}
                  fullWidth
                >
                  🥗 Food & Beverage
                </Button>
                <Button
                  onClick={() => setInventoryTab("cleaning")}
                  className={`sub-tab-btn ${inventoryTab === "cleaning" ? "active cleaning" : ""}`}
                  variant={
                    inventoryTab === "cleaning" ? "contained" : "outlined"
                  }
                  color={inventoryTab === "cleaning" ? "info" : "inherit"}
                  fullWidth
                >
                  🧹 Cleaning & Supplies
                </Button>
              </Box>

              {/* Forms */}
              {inventoryTab === "food" ? (
                <FoodForm
                  name={foodForm.name}
                  quantity={foodForm.quantity}
                  unit={foodForm.unit}
                  minStock={foodForm.minStock}
                  purchased={foodForm.purchased}
                  useBy={foodForm.useBy}
                  storage={foodForm.storage}
                  frequentlyUsed={foodForm.frequentlyUsed}
                  toBuy={foodForm.toBuy}
                  rooms={rooms}
                  onNameChange={foodForm.setName}
                  onQuantityChange={foodForm.setQuantity}
                  onUnitChange={foodForm.setUnit}
                  onMinStockChange={foodForm.setMinStock}
                  onPurchasedChange={foodForm.setPurchased}
                  onUseByChange={foodForm.setUseBy}
                  onStorageChange={foodForm.setStorage}
                  onFrequentlyUsedChange={foodForm.setFrequentlyUsed}
                  onToBuyChange={foodForm.setToBuy}
                  onAddProduct={addProduct}
                />
              ) : (
                <CleaningForm
                  name={cleaningForm.name}
                  quantity={cleaningForm.quantity}
                  unit={cleaningForm.unit}
                  minStock={cleaningForm.minStock}
                  purchased={cleaningForm.purchased}
                  storage={cleaningForm.storage}
                  frequentlyUsed={cleaningForm.frequentlyUsed}
                  toBuy={cleaningForm.toBuy}
                  rooms={rooms}
                  onNameChange={cleaningForm.setName}
                  onQuantityChange={cleaningForm.setQuantity}
                  onUnitChange={cleaningForm.setUnit}
                  onMinStockChange={cleaningForm.setMinStock}
                  onPurchasedChange={cleaningForm.setPurchased}
                  onStorageChange={cleaningForm.setStorage}
                  onFrequentlyUsedChange={cleaningForm.setFrequentlyUsed}
                  onToBuyChange={cleaningForm.setToBuy}
                  onAddProduct={addProduct}
                />
              )}
            </>
          ) : null}
        </>
      )}
    </>
  );
};
