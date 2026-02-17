import { useState } from "react";
import type { Product } from "../../types/Product";
import {
  parseNaturalLanguageInput,
  applyParsedUpdate,
  type ParsedProductUpdate,
} from "../../services/nlParserService";

interface NaturalLanguageLoggerProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onConsumeProduct: (productId: string, amount: number) => void;
}

export function NaturalLanguageLogger({
  products,
  onAddProduct,
  onUpdateProduct,
  onConsumeProduct,
}: NaturalLanguageLoggerProps) {
  const [input, setInput] = useState("");
  const [suggestion, setSuggestion] = useState<ParsedProductUpdate | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!input.trim()) {
      setError("Please enter something like 'I bought 10 eggs'");
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const parsed = await parseNaturalLanguageInput(input, products);
      if (parsed) {
        setSuggestion(parsed);
      } else {
        setError(
          "Could not understand that input. Check browser console for details. Try: 'I bought 10 eggs'",
        );
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error parsing input. Try again.";
      setError(errorMsg);
      console.error("NL Parser Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (!suggestion) return;

    const product = applyParsedUpdate(suggestion, products);
    if (!product) {
      setError("Could not apply this update");
      return;
    }

    // Check if product exists
    const existing = products.find(
      (p) => p.name.toLowerCase() === product.name.toLowerCase(),
    );

    // Route to appropriate handler based on action
    if (suggestion.action === "consume") {
      // For consume action, use the existing product ID
      if (existing) {
        onConsumeProduct(existing.id, suggestion.quantity);
      } else {
        setError("Cannot consume a product that doesn't exist in inventory");
        return;
      }
    } else if (existing && suggestion.action === "update") {
      // For update action, update the existing product
      onUpdateProduct(product);
    } else {
      // For add action or if product doesn't exist, add as new
      onAddProduct(product);
    }

    // Clear and show success
    setInput("");
    setSuggestion(null);
    alert(
      `✅ ${suggestion.action === "consume" ? "Consumed" : "Added"}: ${product.quantity} ${product.unit} of ${product.name}`,
    );
  };

  const handleReject = () => {
    setSuggestion(null);
    setInput("");
    setError(null);
  };

  const getActionLabel = (action: string): string => {
    switch (action) {
      case "add":
        return "➕ Add new product";
      case "update":
        return "📝 Update existing product";
      case "consume":
        return "📉 Log consumption";
      default:
        return "Process";
    }
  };

  const getActionColor = (action: string): string => {
    switch (action) {
      case "add":
        return "#4CAF50";
      case "update":
        return "#2196F3";
      case "consume":
        return "#FF9800";
      default:
        return "#666";
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        borderRadius: "12px",
        marginBottom: "24px",
      }}
    >
      <h3
        style={{
          margin: "0 0 16px 0",
          fontSize: "18px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        🗣️ Quick Input
      </h3>

      <p
        style={{
          margin: "0 0 16px 0",
          fontSize: "13px",
          color: "#666",
        }}
      >
        Say what you bought or used: "I bought 10 eggs", "Used 500ml milk",
        "Bought 2L detergent"
      </p>

      {/* Input Field */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleParse();
            }
          }}
          placeholder="e.g., I bought 10 eggs..."
          style={{
            flex: 1,
            padding: "12px",
            fontSize: "14px",
            border: "2px solid #ddd",
            borderRadius: "6px",
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={handleParse}
          disabled={loading || !input.trim()}
          style={{
            padding: "12px 24px",
            backgroundColor: loading ? "#ccc" : "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "🤖 Parsing..." : "🎤 Parse"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#FFCDD2",
            borderLeft: "4px solid #f44336",
            borderRadius: "4px",
            marginBottom: "16px",
            color: "#c62828",
            fontSize: "13px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* AI Suggestion */}
      {suggestion && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "white",
            border: `2px solid ${getActionColor(suggestion.action)}`,
            borderRadius: "8px",
            marginBottom: "16px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              marginBottom: "12px",
            }}
          >
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>
                {getActionLabel(suggestion.action)}
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#333",
                  fontWeight: "bold",
                }}
              >
                {suggestion.quantity} {suggestion.unit} of{" "}
                <span style={{ color: getActionColor(suggestion.action) }}>
                  {suggestion.productName}
                </span>
              </p>
            </div>
            <span
              style={{
                display: "inline-block",
                backgroundColor: getActionColor(suggestion.action),
                color: "white",
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {suggestion.confidence}% sure
            </span>
          </div>

          {/* Details */}
          <div
            style={{
              padding: "12px",
              backgroundColor: "#f9f9f9",
              borderRadius: "6px",
              marginBottom: "12px",
              fontSize: "13px",
            }}
          >
            <p style={{ margin: "0 0 8px 0", color: "#666" }}>
              <strong>Category:</strong> {suggestion.category}
            </p>
            <p style={{ margin: "0 0 8px 0", color: "#666" }}>
              <strong>Action:</strong> {getActionLabel(suggestion.action)}
            </p>
            <p style={{ margin: 0, color: "#666", fontStyle: "italic" }}>
              <strong>Why:</strong> {suggestion.reasoning}
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={handleReject}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              ✕ Not Right
            </button>
            <button
              onClick={handleAccept}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: getActionColor(suggestion.action),
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              ✓ Yes, Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
