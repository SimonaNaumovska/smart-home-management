interface FoodFormProps {
  name: string;
  quantity: string;
  unit: string;
  minStock: string;
  purchased: string;
  useBy: string;
  storage: string;
  frequentlyUsed: boolean;
  toBuy: boolean;
  onNameChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onMinStockChange: (value: string) => void;
  onPurchasedChange: (value: string) => void;
  onUseByChange: (value: string) => void;
  onStorageChange: (value: string) => void;
  onFrequentlyUsedChange: (value: boolean) => void;
  onToBuyChange: (value: boolean) => void;
  onAddProduct: () => void;
}

const FOOD_STORAGE_LOCATIONS = [
  "Kitchen Pantry",
  "Refrigerator",
  "Freezer",
  "Counter",
  "Cupboard",
];

const FOOD_UNITS = [
  "kg",
  "g",
  "lbs",
  "oz",
  "L",
  "ml",
  "cups",
  "tbsp",
  "tsp",
  "pieces",
];

export function FoodForm({
  name,
  quantity,
  unit,
  minStock,
  purchased,
  useBy,
  storage,
  frequentlyUsed,
  toBuy,
  onNameChange,
  onQuantityChange,
  onUnitChange,
  onMinStockChange,
  onPurchasedChange,
  onUseByChange,
  onStorageChange,
  onFrequentlyUsedChange,
  onToBuyChange,
  onAddProduct,
}: FoodFormProps) {
  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #4CAF50",
        borderRadius: "8px",
        backgroundColor: "#f1f8f4",
        marginBottom: "20px",
      }}
    >
      <h2 style={{ color: "#2e7d32" }}>🥗 Food & Beverage</h2>
      <p style={{ color: "#555", fontSize: "14px" }}>
        Track your groceries, pantry items, and perishables
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <input
          type="text"
          placeholder="Item Name (e.g., Milk, Bread, Chicken)"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            flex: "1 1 100%",
            minWidth: "200px",
          }}
        />

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            flex: "1 1 calc(50% - 6px)",
            minWidth: "150px",
          }}
        />

        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            flex: "1 1 calc(50% - 6px)",
            minWidth: "150px",
          }}
        >
          <option value="">Select Unit</option>
          {FOOD_UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Min Stock Level"
          value={minStock}
          onChange={(e) => onMinStockChange(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            flex: "1 1 calc(50% - 6px)",
            minWidth: "150px",
          }}
        />

        <input
          type="date"
          placeholder="Purchased"
          value={purchased}
          onChange={(e) => onPurchasedChange(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            flex: "1 1 calc(50% - 6px)",
            minWidth: "150px",
          }}
        />

        <input
          type="date"
          placeholder="Use By (Expiration)"
          value={useBy}
          onChange={(e) => onUseByChange(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            flex: "1 1 calc(50% - 6px)",
            minWidth: "150px",
          }}
        />

        <select
          value={storage}
          onChange={(e) => onStorageChange(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            flex: "1 1 100%",
            minWidth: "200px",
          }}
        >
          <option value="">Select Storage Location</option>
          {FOOD_STORAGE_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px",
            borderRadius: "4px",
            backgroundColor: "white",
            flex: "1 1 calc(50% - 6px)",
            minWidth: "150px",
          }}
        >
          <input
            type="checkbox"
            checked={frequentlyUsed}
            onChange={(e) => onFrequentlyUsedChange(e.target.checked)}
          />
          <span>Frequently Used</span>
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px",
            borderRadius: "4px",
            backgroundColor: "white",
            flex: "1 1 calc(50% - 6px)",
            minWidth: "150px",
          }}
        >
          <input
            type="checkbox"
            checked={toBuy}
            onChange={(e) => onToBuyChange(e.target.checked)}
          />
          <span>Add to Shopping List</span>
        </label>
      </div>

      <button
        onClick={onAddProduct}
        style={{
          padding: "10px 24px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        Add Food Item
      </button>
    </div>
  );
}
