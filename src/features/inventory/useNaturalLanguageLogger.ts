import { useState } from "react";
import type { Product } from "../../types/Product";
import {
  parseNaturalLanguageInput,
  applyParsedUpdate,
  type ParsedProductUpdate,
} from "../../api/nlParserService";

interface UseNaturalLanguageLoggerProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onConsumeProduct: (productId: string, amount: number) => void;
}

export const useNaturalLanguageLogger = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onConsumeProduct,
}: UseNaturalLanguageLoggerProps) => {
  const [input, setInput] = useState("");
  const [suggestion, setSuggestion] = useState<ParsedProductUpdate | null>(null);
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

    const existing = products.find(
      (p) => p.name.toLowerCase() === product.name.toLowerCase(),
    );

    if (suggestion.action === "consume") {
      if (existing) {
        onConsumeProduct(existing.id, suggestion.quantity);
      } else {
        setError("Cannot consume a product that doesn't exist in inventory");
        return;
      }
    } else if (existing && suggestion.action === "update") {
      onUpdateProduct(product);
    } else {
      onAddProduct(product);
    }

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

  return {
    input,
    suggestion,
    loading,
    error,
    setInput,
    handleParse,
    handleAccept,
    handleReject,
  };
};
