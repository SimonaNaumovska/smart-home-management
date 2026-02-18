import React from "react";
import type { Product } from "../../types/Product";
import { useBarcodeScanner } from "./useBarcodeScanner";

interface BarcodeScannerProps {
  onAddProduct: (product: Omit<Product, "id">) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onAddProduct }) => {
  const {
    isScanning,
    scannedBarcode,
    productData,
    setProductData,
    error,
    loading,
    cameraPermission,
    customQuantity,
    setCustomQuantity,
    customUnit,
    setCustomUnit,
    startScanning,
    stopScanning,
    handleAddProduct,
    handleScanAnother,
  } = useBarcodeScanner({ onAddProduct });

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>
        📷 Barcode Scanner
      </h2>

      {!isScanning && !productData && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p style={{ marginBottom: "15px", color: "#666" }}>
            Scan product barcodes to quickly add items to your inventory.
          </p>
          <button
            onClick={startScanning}
            style={{
              padding: "15px 30px",
              fontSize: "16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🎥 Start Camera
          </button>
        </div>
      )}

      {/* Camera viewer */}
      {isScanning && (
        <div style={{ marginBottom: "20px" }}>
          <div
            id="qr-reader"
            style={{
              width: "100%",
              maxWidth: "500px",
              margin: "0 auto",
              border: "2px solid #4CAF50",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          />
          <button
            onClick={stopScanning}
            style={{
              marginTop: "15px",
              padding: "12px 24px",
              fontSize: "14px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              width: "100%",
              maxWidth: "500px",
            }}
          >
            ⏹️ Stop Scanning
          </button>
          <p style={{ marginTop: "10px", color: "#666", textAlign: "center" }}>
            Point your camera at a barcode
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#ffebee",
            border: "1px solid #f44336",
            borderRadius: "8px",
            marginBottom: "20px",
            color: "#c62828",
          }}
        >
          ⚠️ {error}
          {cameraPermission === "denied" && (
            <div style={{ marginTop: "10px", fontSize: "14px" }}>
              <strong>How to enable camera:</strong>
              <ul style={{ marginTop: "5px", marginLeft: "20px" }}>
                <li>Click the camera icon in the address bar</li>
                <li>Select "Allow" for camera access</li>
                <li>Refresh the page</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #4CAF50",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ marginTop: "10px", color: "#666" }}>
            Fetching product details...
          </p>
        </div>
      )}

      {/* Product review */}
      {productData && (
        <div
          style={{
            backgroundColor: "white",
            border: "2px solid #4CAF50",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ marginBottom: "15px", color: "#4CAF50" }}>
            ✅ Product Scanned
          </h3>

          <div style={{ marginBottom: "15px" }}>
            <strong>Barcode:</strong> {scannedBarcode}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Product Name:
            </label>
            <input
              type="text"
              value={productData.name}
              onChange={(e) =>
                setProductData({ ...productData, name: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "6px",
              }}
            />
          </div>

          {productData.brand && (
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Brand:
              </label>
              <input
                type="text"
                value={productData.brand}
                onChange={(e) =>
                  setProductData({ ...productData, brand: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "14px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              />
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Quantity:
              </label>
              <input
                type="number"
                value={customQuantity}
                onChange={(e) => setCustomQuantity(e.target.value)}
                min="0"
                step="0.1"
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "14px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Unit:
              </label>
              <select
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "14px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              >
                <option value="pieces">Pieces</option>
                <option value="g">Grams (g)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="L">Liters (L)</option>
                <option value="oz">Ounces (oz)</option>
                <option value="lb">Pounds (lb)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleAddProduct}
              style={{
                flex: 1,
                padding: "12px",
                fontSize: "16px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ➕ Add to Inventory
            </button>
            <button
              onClick={handleScanAnother}
              style={{
                flex: 1,
                padding: "12px",
                fontSize: "16px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              📷 Scan Another
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;
