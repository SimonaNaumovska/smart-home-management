import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import type { Product } from "../types/Product";

interface ProductData {
  name: string;
  brand?: string;
  quantity?: string;
  unit?: string;
  category?: string;
}

interface BarcodeScannerProps {
  onAddProduct: (product: Omit<Product, "id">) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onAddProduct }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [customQuantity, setCustomQuantity] = useState("1");
  const [customUnit, setCustomUnit] = useState("pieces");

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            if (scannerRef.current) {
              scannerRef.current.clear();
            }
          })
          .catch((err) => console.log("Scanner cleanup error:", err));
      }
    };
  }, []);

  const fetchProductData = async (
    barcode: string,
  ): Promise<ProductData | null> => {
    try {
      setLoading(true);
      setError("");

      // Try OpenFoodFacts API
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      );
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;

        // Extract quantity and unit from product_quantity field
        const quantity = product.product_quantity || product.quantity || "1";
        const unit = product.product_quantity_unit || "pieces";

        return {
          name:
            product.product_name ||
            product.product_name_en ||
            `Product ${barcode}`,
          brand: product.brands || undefined,
          quantity: quantity.toString(),
          unit: unit,
          category: product.categories_tags?.[0]?.replace("en:", "") || "food",
        };
      }

      // If not found, return basic product data
      return {
        name: `Product ${barcode}`,
        quantity: "1",
        unit: "pieces",
        category: "other",
      };
    } catch (err) {
      console.error("Error fetching product data:", err);
      setError("Failed to fetch product data. You can add manually.");
      return {
        name: `Product ${barcode}`,
        quantity: "1",
        unit: "pieces",
        category: "other",
      };
    } finally {
      setLoading(false);
    }
  };

  const startScanning = async () => {
    try {
      setError("");

      // Set scanning state first to render the div
      setIsScanning(true);

      // Wait for React to render the qr-reader div
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Check if element exists
      const element = document.getElementById("qr-reader");
      if (!element) {
        setError("Scanner container not found. Please try again.");
        setIsScanning(false);
        return;
      }

      // Clean up any existing scanner first
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
        scannerRef.current = null;
      }

      // Check camera permission (optional - not all browsers support this API)
      try {
        if (navigator.permissions) {
          const permissionStatus = await navigator.permissions.query({
            name: "camera" as PermissionName,
          });
          setCameraPermission(permissionStatus.state);

          if (permissionStatus.state === "denied") {
            setError(
              "Camera access denied. Please enable camera in browser settings.",
            );
            return;
          }
        }
      } catch (permError) {
        // Permission API not supported, continue anyway
        console.log("Permissions API not supported");
      }

      // Initialize scanner
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setError("No camera found on this device.");
        return;
      }

      // Try to use back camera, fallback to first available
      const cameraId =
        devices.find((d) => d.label.toLowerCase().includes("back"))?.id ||
        devices[0].id;

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          // Barcode detected
          console.log("Barcode scanned:", decodedText);
          setScannedBarcode(decodedText);

          // Stop scanning
          try {
            await scanner.stop();
          } catch (e) {
            console.log("Stop error:", e);
          }
          setIsScanning(false);

          // Fetch product data
          const product = await fetchProductData(decodedText);
          if (product) {
            setProductData(product);
            setCustomQuantity(product.quantity || "1");
            setCustomUnit(product.unit || "pieces");
          }
        },
        () => {
          // Scanner error (usually just "no barcode found")
          // Don't show these errors as they're normal
        },
      );

      // Camera started successfully - isScanning already set to true above
      setCameraPermission("granted");
    } catch (err: any) {
      console.error("Scanner start error:", err);
      console.error("Error details:", {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });

      if (
        err.name === "NotAllowedError" ||
        err.message?.includes("Permission")
      ) {
        setError(
          "Camera access denied. Please click 'Allow' when your browser asks for camera permission.",
        );
        setCameraPermission("denied");
      } else if (
        err.name === "NotFoundError" ||
        err.message?.includes("camera")
      ) {
        setError("No camera found. Please make sure your device has a camera.");
      } else if (err.message?.includes("already")) {
        setError(
          "Camera is already in use. Please close other apps using the camera.",
        );
      } else {
        setError(
          `Scanner error: ${err.message || "Failed to start camera. Please try again or use a different browser."}`,
        );
      }
      setIsScanning(false);

      // Clean up on error
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (e) {
          // Ignore
        }
        scannerRef.current = null;
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setIsScanning(false);
      } catch (err) {
        console.error("Stop scanner error:", err);
        setIsScanning(false);
      }
      scannerRef.current = null;
    }
  };

  const handleAddProduct = () => {
    if (!productData) return;

    const newProduct: Omit<Product, "id"> = {
      name: productData.brand
        ? `${productData.brand} ${productData.name}`
        : productData.name,
      category: productData.category || "food",
      quantity: parseFloat(customQuantity) || 1,
      unit: customUnit,
      minStock: 1,
      purchased: new Date().toISOString().split("T")[0],
      useBy: "",
      storage: "pantry",
      toBuy: false,
      frequentlyUsed: false,
    };

    onAddProduct(newProduct);

    // Reset for next scan
    setScannedBarcode("");
    setProductData(null);
    setCustomQuantity("1");
    setCustomUnit("pieces");
  };

  const handleScanAnother = () => {
    setScannedBarcode("");
    setProductData(null);
    setError("");
    startScanning();
  };

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
