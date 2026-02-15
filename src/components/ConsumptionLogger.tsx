import { useState } from "react";
import type { Product, User } from "../types/Product";

interface ConsumptionLoggerProps {
  products: Product[];
  activeUser: User | null;
  onLogConsumption: (productId: string, amount: number) => void;
}

export function ConsumptionLogger({
  products,
  activeUser,
  onLogConsumption,
}: ConsumptionLoggerProps) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [amount, setAmount] = useState("");

  const foodProducts = products.filter((p) => p.category === "Food & Beverage");

  const handleLog = () => {
    if (!selectedProduct || !amount || !activeUser) return;

    onLogConsumption(selectedProduct, Number(amount));
    setSelectedProduct("");
    setAmount("");
  };

  const selectedProductData = products.find((p) => p.id === selectedProduct);

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #9C27B0",
        borderRadius: "8px",
        marginBottom: "20px",
        backgroundColor: "#f3e5f5",
      }}
    >
      <h2 style={{ color: "#7B1FA2" }}>🍽️ Log Food Consumption</h2>
      <p style={{ color: "#555", fontSize: "14px", marginBottom: "16px" }}>
        Track what you eat - inventory updates automatically
      </p>

      {!activeUser ? (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#ffebee",
            border: "1px solid #f44336",
            borderRadius: "4px",
            color: "#c62828",
          }}
        >
          ⚠️ Please select an active user to log consumption
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              padding: "12px",
              backgroundColor: activeUser.color + "20",
              border: `2px solid ${activeUser.color}`,
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "24px" }}>{activeUser.avatar}</span>
            <span style={{ fontWeight: "bold" }}>
              {activeUser.name} is eating...
            </span>
          </div>

          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          >
            <option value="">Select Food Item</option>
            {foodProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.quantity} {product.unit} available)
              </option>
            ))}
          </select>

          {selectedProductData && (
            <div>
              <input
                type="number"
                placeholder={`Amount (${selectedProductData.unit})`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "16px",
                  width: "100%",
                }}
              />
            </div>
          )}

          <button
            onClick={handleLog}
            disabled={!selectedProduct || !amount}
            style={{
              padding: "12px",
              backgroundColor: selectedProduct && amount ? "#9C27B0" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: selectedProduct && amount ? "pointer" : "not-allowed",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Log Consumption
          </button>
        </div>
      )}
    </div>
  );
}
