interface CleaningFormProps {
  name: string;
  quantity: string;
  unit: string;
  minStock: string;
  purchased: string;
  storage: string;
  frequentlyUsed: boolean;
  toBuy: boolean;
  onNameChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onMinStockChange: (value: string) => void;
  onPurchasedChange: (value: string) => void;
  onStorageChange: (value: string) => void;
  onFrequentlyUsedChange: (value: boolean) => void;
  onToBuyChange: (value: boolean) => void;
  onAddProduct: () => void;
}

// Note: Reserved for future category selection feature
// @ts-ignore
const CLEANING_CATEGORIES = [
  "All-Purpose Cleaner",
  "Disinfectant",
  "Floor Cleaner",
  "Window Cleaner",
  "Laundry Detergent",
  "Dish Soap",
  "Bathroom Cleaner",
  "Bleach",
  "Deodorant",
  "Other",
];

const CLEANING_STORAGE_LOCATIONS = [
  "Laundry Room",
  "Under Kitchen Sink",
  "Bathroom Cabinet",
  "Garage",
  "Storage Closet",
  "Utility Room",
];

const CLEANING_UNITS = ["L", "ml", "oz", "pcs", "bottles", "boxes"];

export function CleaningForm({
  name,
  quantity,
  unit,
  minStock,
  purchased,
  storage,
  frequentlyUsed,
  toBuy,
  onNameChange,
  onQuantityChange,
  onUnitChange,
  onMinStockChange,
  onPurchasedChange,
  onStorageChange,
  onFrequentlyUsedChange,
  onToBuyChange,
  onAddProduct,
}: CleaningFormProps) {
  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #2196F3",
        borderRadius: "8px",
        backgroundColor: "#e3f2fd",
        marginBottom: "20px",
      }}
    >
      <h2 style={{ color: "#1565c0" }}>🧹 Cleaning & Supplies</h2>
      <p style={{ color: "#555", fontSize: "14px" }}>
        Track cleaning supplies, detergents, and household maintenance items
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
          placeholder="Item Name (e.g., Bleach, Dish Soap)"
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
          {CLEANING_UNITS.map((u) => (
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

        <select
          value={storage}
          onChange={(e) => onStorageChange(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            flex: "1 1 calc(50% - 6px)",
            minWidth: "150px",
          }}
        >
          <option value="">Select Storage Location</option>
          {CLEANING_STORAGE_LOCATIONS.map((loc) => (
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
          backgroundColor: "#2196F3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        Add Cleaning Item
      </button>
    </div>
  );
}
