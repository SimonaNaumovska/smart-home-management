import { useState, useEffect } from "react";
import type {
  AISuggestion,
  Product,
  ChoreDefinition,
  ConsumptionLog,
} from "../../types/Product";
import {
  generateSuggestions,
  applySuggestion,
  logSuggestionFeedback,
} from "../../services/suggestionsService";

interface SuggestionsPanelProps {
  products: Product[];
  chores: ChoreDefinition[];
  consumptionLogs: ConsumptionLog[];
  onProductUpdate: (product: Product) => void;
}

export function SuggestionsPanel({
  products,
  chores,
  consumptionLogs,
  onProductUpdate,
}: SuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastGeneratedTime, setLastGeneratedTime] = useState<number | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  // Generate suggestions on mount and when data changes
  useEffect(() => {
    const generateNewSuggestions = async () => {
      // Only regenerate every 5 minutes to avoid API spam
      if (lastGeneratedTime && Date.now() - lastGeneratedTime < 5 * 60 * 1000) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const newSuggestions = await generateSuggestions(
          products,
          chores,
          consumptionLogs,
        );
        setSuggestions(newSuggestions);
        setLastGeneratedTime(Date.now());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate suggestions",
        );
        console.error("Suggestion generation error:", err);
      } finally {
        setLoading(false);
      }
    };

    generateNewSuggestions();
  }, []); // Only on mount

  const handleAccept = (suggestion: AISuggestion) => {
    // Apply the suggestion (only if it modifies data)
    const { updatedProducts, message } = applySuggestion(suggestion, products);

    // Update products if changes were made
    if (updatedProducts.length > 0) {
      updatedProducts.forEach((p) => {
        const original = products.find((op) => op.id === p.id);
        if (original && JSON.stringify(original) !== JSON.stringify(p)) {
          onProductUpdate(p);
        }
      });
    }

    // Log feedback
    logSuggestionFeedback(suggestion, "accepted");

    // Update UI
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === suggestion.id ? { ...s, status: "accepted" } : s,
      ),
    );

    // Show confirmation
    alert(message);
  };

  const handleReject = (suggestion: AISuggestion) => {
    logSuggestionFeedback(suggestion, "rejected");
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === suggestion.id ? { ...s, status: "rejected" } : s,
      ),
    );
  };

  const handleIgnore = (suggestion: AISuggestion) => {
    logSuggestionFeedback(suggestion, "ignored");
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
  };

  const refreshSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const newSuggestions = await generateSuggestions(
        products,
        chores,
        consumptionLogs,
      );
      setSuggestions(newSuggestions);
      setLastGeneratedTime(Date.now());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate suggestions",
      );
      console.error("Suggestion generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestionIcon = (type: string): string => {
    switch (type) {
      case "low-stock":
        return "📦";
      case "meal-idea":
        return "🍽️";
      case "consumption-spike":
        return "📈";
      case "expiration-warning":
        return "⏰";
      case "chore-optimization":
        return "🧹";
      default:
        return "💡";
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return "#4CAF50"; // Green
    if (confidence >= 60) return "#FF9800"; // Orange
    return "#f44336"; // Red
  };

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 4px 0", fontSize: "28px" }}>
            🤖 AI Smart Insights
          </h2>
          <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
            AI-powered suggestions you control
          </p>
        </div>
        <button
          onClick={refreshSuggestions}
          disabled={loading}
          style={{
            padding: "12px 24px",
            backgroundColor: loading ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {loading ? "⏳ Loading..." : "🔄 Refresh Insights"}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#FFCDD2",
            borderLeft: "4px solid #f44336",
            marginBottom: "20px",
            borderRadius: "4px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {!error && !import.meta.env.VITE_GROQ_API_KEY && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#FFF3E0",
            borderLeft: "4px solid #FF9800",
            marginBottom: "20px",
            borderRadius: "4px",
          }}
        >
          ⚙️ <strong>Setup needed:</strong> Add your Groq API key to{" "}
          <code style={{ backgroundColor: "#f5f5f5", padding: "2px 6px" }}>
            .env.local
          </code>{" "}
          as{" "}
          <code style={{ backgroundColor: "#f5f5f5", padding: "2px 6px" }}>
            VITE_GROQ_API_KEY
          </code>
        </div>
      )}

      {pendingSuggestions.length === 0 && !loading && (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "#999",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
          }}
        >
          {suggestions.length > 0 ? (
            <>
              <p style={{ fontSize: "16px", margin: 0 }}>
                ✅ You've reviewed all suggestions!
              </p>
              <p
                style={{ fontSize: "14px", color: "#bbb", margin: "8px 0 0 0" }}
              >
                Click "Refresh Insights" for new suggestions
              </p>
            </>
          ) : (
            <p style={{ fontSize: "16px" }}>
              No suggestions yet. Check back later!
            </p>
          )}
        </div>
      )}

      <div style={{ display: "grid", gap: "16px" }}>
        {pendingSuggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            style={{
              padding: "20px",
              backgroundColor: "white",
              border: "2px solid #e0e0e0",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            {/* Header with icon and title */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: "12px",
              }}
            >
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>
                    {getSuggestionIcon(suggestion.type)}
                  </span>
                  {suggestion.title}
                </h3>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginLeft: "16px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "white",
                    backgroundColor: getConfidenceColor(suggestion.confidence),
                    padding: "4px 12px",
                    borderRadius: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {suggestion.confidence}% confidence
                </span>
              </div>
            </div>

            {/* Description */}
            <p
              style={{
                margin: "0 0 12px 0",
                fontSize: "15px",
                color: "#333",
                lineHeight: "1.5",
              }}
            >
              {suggestion.description}
            </p>

            {/* Reasoning */}
            <div
              style={{
                padding: "12px",
                backgroundColor: "#F5F5F5",
                borderRadius: "6px",
                marginBottom: "16px",
                borderLeft: "3px solid #2196F3",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#666",
                  fontStyle: "italic",
                }}
              >
                <strong>Why:</strong> {suggestion.reasoning}
              </p>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => handleReject(suggestion)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                ✕ Not helpful
              </button>
              <button
                onClick={() => handleIgnore(suggestion)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#9E9E9E",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ⊘ Ignore
              </button>
              <button
                onClick={() => handleAccept(suggestion)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                ✓ Accept & Apply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
