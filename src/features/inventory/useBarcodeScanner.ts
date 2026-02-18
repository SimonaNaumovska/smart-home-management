import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import type { Product } from "../../types/Product";

interface ProductData {
  name: string;
  brand?: string;
  quantity?: string;
  unit?: string;
  category?: string;
}

interface UseBarcodeScannerProps {
  onAddProduct: (product: Omit<Product, "id">) => void;
}

export const useBarcodeScanner = ({ onAddProduct }: UseBarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");
  const [customQuantity, setCustomQuantity] = useState("1");
  const [customUnit, setCustomUnit] = useState("pieces");
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

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

  const fetchProductData = useCallback(async (
    barcode: string
  ): Promise<ProductData | null> => {
    try {
      setLoading(true);
      setError("");

      // Try OpenFoodFacts API
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
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
  }, []);

  const startScanning = useCallback(async () => {
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
              "Camera access denied. Please enable camera in browser settings."
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
        }
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
          "Camera access denied. Please click 'Allow' when your browser asks for camera permission."
        );
        setCameraPermission("denied");
      } else if (
        err.name === "NotFoundError" ||
        err.message?.includes("camera")
      ) {
        setError("No camera found. Please make sure your device has a camera.");
      } else if (err.message?.includes("already")) {
        setError(
          "Camera is already in use. Please close other apps using the camera."
        );
      } else {
        setError(
          `Scanner error: ${err.message || "Failed to start camera. Please try again or use a different browser."}`
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
  }, [fetchProductData]);

  const stopScanning = useCallback(async () => {
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
  }, []);

  const handleAddProduct = useCallback(() => {
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
  }, [productData, customQuantity, customUnit, onAddProduct]);

  const handleScanAnother = useCallback(() => {
    setScannedBarcode("");
    setProductData(null);
    setError("");
    startScanning();
  }, [startScanning]);

  return {
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
  };
};
