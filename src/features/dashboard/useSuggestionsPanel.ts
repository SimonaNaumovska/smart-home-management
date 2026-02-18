import { useState, useEffect, useCallback } from "react";
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
} from "../../api/suggestionsService";

interface UseSuggestionsPanelProps {
  products: Product[];
  chores: ChoreDefinition[];
  consumptionLogs: ConsumptionLog[];
  onProductUpdate: (product: Product) => void;
}

export const useSuggestionsPanel = ({
  products,
  chores,
  consumptionLogs,
  onProductUpdate,
}: UseSuggestionsPanelProps) => {
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

  const handleAccept = useCallback(
    (suggestion: AISuggestion) => {
      // Apply the suggestion (only if it modifies data)
      const { updatedProducts, message } = applySuggestion(
        suggestion,
        products,
      );

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
    },
    [products, onProductUpdate],
  );

  const handleReject = useCallback((suggestion: AISuggestion) => {
    logSuggestionFeedback(suggestion, "rejected");
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === suggestion.id ? { ...s, status: "rejected" } : s,
      ),
    );
  }, []);

  const handleIgnore = useCallback((suggestion: AISuggestion) => {
    logSuggestionFeedback(suggestion, "ignored");
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
  }, []);

  const refreshSuggestions = useCallback(async () => {
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
  }, [products, chores, consumptionLogs]);

  const getSuggestionIcon = useCallback((type: string): string => {
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
  }, []);

  const getConfidenceColor = useCallback((confidence: number): string => {
    if (confidence >= 80) return "#4CAF50"; // Green
    if (confidence >= 60) return "#FF9800"; // Orange
    return "#f44336"; // Red
  }, []);

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");

  return {
    suggestions,
    loading,
    error,
    pendingSuggestions,
    handleAccept,
    handleReject,
    handleIgnore,
    refreshSuggestions,
    getSuggestionIcon,
    getConfidenceColor,
  };
};
