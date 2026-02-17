import { useState } from "react";
import { createWorker } from "tesseract.js";
import type { Product } from "../../types/Product";

interface ParsedItem {
  name: string;
  quantity: number;
  unit: string;
  price?: number;
}

interface ReceiptScannerProps {
  onAddItems: (items: Partial<Product>[]) => void;
}

export function ReceiptScanner({ onAddItems }: ReceiptScannerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [rawText, setRawText] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setParsedItems([]);
        setRawText("");
      };
      reader.readAsDataURL(file);
    }
  };

  const parseReceiptText = (text: string): ParsedItem[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    const items: ParsedItem[] = [];

    // Find the section between "ДДВ број" and "промет од"
    let startIndex = -1;
    let endIndex = lines.length;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes("ддв број") || line.includes("ddv broj")) {
        startIndex = i + 1; // Start after this line
      }
      if (line.includes("промет од") || line.includes("promet od")) {
        endIndex = i; // Stop before this line
        break;
      }
    }

    // If we didn't find markers, try to parse everything (fallback)
    if (startIndex === -1) startIndex = 0;

    // Parse items in the relevant section
    // Format: Line 1 = Item name, Line 2 = Quantity/Unit/Price
    const relevantLines = lines.slice(startIndex, endIndex);

    for (let i = 0; i < relevantLines.length - 1; i += 2) {
      const nameLine = relevantLines[i].trim();
      const detailLine = relevantLines[i + 1]?.trim();

      if (!nameLine || !detailLine) continue;

      // Skip header/footer lines
      if (
        nameLine.match(
          /^(total|subtotal|tax|вкупно|данок|сметка|картичка|готовина|payment|благајна)/i,
        )
      ) {
        i -= 1; // Don't skip next line
        continue;
      }

      // Parse the detail line: quantity unit price
      // Examples: "250 g 89.00", "1 kom 120.00", "0.5 kg 150.00"
      const detailPattern =
        /(\d+(?:[.,]\d+)?)\s*([a-zA-Zа-яА-Я.]+)?\s+(\d+(?:[.,]\d+)?)/;
      const match = detailLine.match(detailPattern);

      if (match) {
        const [, qty, unit, price] = match;

        // Normalize units
        let normalizedUnit = unit?.toLowerCase() || "unit";
        const unitMap: { [key: string]: string } = {
          gr: "g",
          "g.": "g",
          грам: "g",
          грами: "g",
          kg: "kg",
          "kg.": "kg",
          кг: "kg",
          kilogram: "kg",
          l: "L",
          "l.": "L",
          liter: "L",
          литар: "L",
          ml: "ml",
          "ml.": "ml",
          милилитар: "ml",
          kom: "pieces",
          "kom.": "pieces",
          парче: "pieces",
          парчиња: "pieces",
          пакет: "pieces",
          шише: "pieces",
        };

        normalizedUnit = unitMap[normalizedUnit] || normalizedUnit;

        items.push({
          name: nameLine,
          quantity: Number.parseFloat(qty.replace(",", ".")),
          unit: normalizedUnit,
          price: Number.parseFloat(price.replace(",", ".")),
        });
      }
    }

    return items;
  };

  const processReceipt = async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);
    setParsedItems([]);

    try {
      // Support Macedonian Cyrillic + English
      const worker = await createWorker(["mkd", "eng"], 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const {
        data: { text },
      } = await worker.recognize(image);

      setRawText(text);
      const items = parseReceiptText(text);
      setParsedItems(items);

      await worker.terminate();
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Failed to process receipt. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToInventory = () => {
    const products: Partial<Product>[] = parsedItems.map((item) => ({
      id: crypto.randomUUID(),
      name: item.name,
      category: "food", // Default to food, user can change later
      quantity: item.quantity,
      unit: item.unit,
      minStock: item.quantity * 0.2, // Set min stock to 20% of initial quantity
      lastPurchased: new Date().toISOString().split("T")[0],
      useBy: "",
      status: "in-stock",
    }));

    onAddItems(products);

    // Reset
    setImage(null);
    setParsedItems([]);
    setRawText("");
  };

  const removeItem = (index: number) => {
    setParsedItems(parsedItems.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof ParsedItem,
    value: string | number,
  ) => {
    const updated = [...parsedItems];
    updated[index] = { ...updated[index], [field]: value };
    setParsedItems(updated);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", width: "100%" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>
        📸 Receipt Scanner
      </h2>

      <div
        style={{
          backgroundColor: "#e3f2fd",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <p style={{ margin: 0, color: "#1565c0" }}>
          💡 <strong>How it works:</strong> Upload a photo of your grocery
          receipt, and we'll automatically extract items using OCR technology.
          Review and confirm before adding to inventory.
        </p>
        <p style={{ margin: "8px 0 0 0", color: "#1565c0", fontSize: "14px" }}>
          🇲🇰 Supports <strong>Macedonian Cyrillic</strong> and English text!
        </p>
      </div>

      {/* Image Upload */}
      <div style={{ marginBottom: "20px" }}>
        <label
          htmlFor="receipt-upload"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#2196F3",
            color: "white",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          📤 Upload Receipt Image
        </label>
        <input
          id="receipt-upload"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
      </div>

      {/* Image Preview */}
      {image && (
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ marginBottom: "10px", color: "#555" }}>
            Receipt Image:
          </h3>
          <img
            src={image}
            alt="Receipt"
            style={{
              maxWidth: "100%",
              maxHeight: "400px",
              borderRadius: "8px",
              border: "2px solid #ddd",
              marginBottom: "10px",
            }}
          />
          <br />
          <button
            onClick={processReceipt}
            disabled={isProcessing}
            style={{
              padding: "12px 24px",
              backgroundColor: isProcessing ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isProcessing ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {isProcessing ? `🔄 Processing... ${progress}%` : "🔍 Scan Receipt"}
          </button>
        </div>
      )}

      {/* Raw Text Toggle */}
      {rawText && (
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setShowRaw(!showRaw)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            {showRaw ? "Hide" : "Show"} Raw OCR Text
          </button>
          {showRaw && (
            <pre
              style={{
                marginTop: "10px",
                padding: "16px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                overflow: "auto",
                fontSize: "12px",
                border: "1px solid #ddd",
              }}
            >
              {rawText}
            </pre>
          )}
        </div>
      )}

      {/* Parsed Items */}
      {parsedItems.length > 0 && (
        <div>
          <h3 style={{ marginBottom: "16px", color: "#333" }}>
            ✅ Found {parsedItems.length} Items
          </h3>
          <div
            style={{
              backgroundColor: "#fff3cd",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <p style={{ margin: 0, color: "#856404" }}>
              ⚠️ Please review and edit items before adding to inventory. OCR
              isn't perfect!
            </p>
          </div>

          {parsedItems.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "16px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                marginBottom: "12px",
                border: "1px solid #ddd",
              }}
            >
              <div
                style={{ display: "flex", gap: "12px", marginBottom: "8px" }}
              >
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  placeholder="Product name"
                  style={{
                    flex: 2,
                    padding: "8px",
                    fontSize: "14px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(
                      index,
                      "quantity",
                      Number.parseFloat(e.target.value) || 0,
                    )
                  }
                  placeholder="Qty"
                  step="0.01"
                  style={{
                    flex: 1,
                    padding: "8px",
                    fontSize: "14px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                <select
                  value={item.unit}
                  onChange={(e) => updateItem(index, "unit", e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    fontSize: "14px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: "white",
                  }}
                >
                  <option value="g">g (grams)</option>
                  <option value="kg">kg</option>
                  <option value="L">L (liters)</option>
                  <option value="ml">ml</option>
                  <option value="pieces">pieces</option>
                  <option value="unit">unit</option>
                  <option value="lbs">lbs</option>
                  <option value="oz">oz</option>
                  <option value="cups">cups</option>
                </select>
                {item.price !== undefined && (
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "price",
                        Number.parseFloat(e.target.value) || 0,
                      )
                    }
                    placeholder="Price"
                    style={{
                      flex: 1,
                      padding: "8px",
                      fontSize: "14px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                )}
                <button
                  onClick={() => removeItem(index)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  ❌
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddToInventory}
            style={{
              padding: "14px 28px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              width: "100%",
            }}
          >
            ✅ Add All {parsedItems.length} Items to Inventory
          </button>
        </div>
      )}

      {/* No items found */}
      {rawText && parsedItems.length === 0 && !isProcessing && (
        <div
          style={{
            backgroundColor: "#ffebee",
            padding: "16px",
            borderRadius: "8px",
            marginTop: "20px",
          }}
        >
          <p style={{ margin: 0, color: "#c62828" }}>
            ❌ No items found in the receipt. Try:
          </p>
          <ul style={{ marginTop: "8px", color: "#c62828" }}>
            <li>Taking a clearer photo with better lighting</li>
            <li>Making sure the text is clearly visible</li>
            <li>Manually adding items instead</li>
          </ul>
        </div>
      )}
    </div>
  );
}
