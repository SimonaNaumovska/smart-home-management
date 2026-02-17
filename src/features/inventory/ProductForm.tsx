interface ProductFormProps {
  name: string;
  category: string;
  quantity: string;
  unit: string;
  minStock: string;
  purchased: string;
  useBy: string;
  storage: string;
  toBuy: boolean;
  frequentlyUsed: boolean;
  onNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onMinStockChange: (value: string) => void;
  onPurchasedChange: (value: string) => void;
  onUseByChange: (value: string) => void;
  onStorageChange: (value: string) => void;
  onToBuyChange: (value: boolean) => void;
  onFrequentlyUsedChange: (value: boolean) => void;
  onAddProduct: () => void;
}

const CATEGORIES = [
  "Food & Beverage",
  "Cleaning",
  "Health & Wellness",
  "Electronics",
  "Toiletries",
  "Laundry",
  "Kitchen",
  "Pantry",
  "Other",
];

const STORAGE_LOCATIONS = [
  "Kitchen Pantry",
  "Refrigerator",
  "Freezer",
  "Bedroom",
  "Bathroom",
  "Laundry Room",
  "Garage",
  "Living Room",
  "Storage Closet",
  "Other",
];

export function ProductForm({
  name,
  category,
  quantity,
  unit,
  minStock,
  purchased,
  useBy,
  storage,
  toBuy,
  frequentlyUsed,
  onNameChange,
  onCategoryChange,
  onQuantityChange,
  onUnitChange,
  onMinStockChange,
  onPurchasedChange,
  onUseByChange,
  onStorageChange,
  onToBuyChange,
  onFrequentlyUsedChange,
  onAddProduct,
}: ProductFormProps) {
  return (
    <>
      <h2>Add Product</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        <input
          type="text"
          placeholder="Item Name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          style={{
            padding: "6px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">Select Category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
        />

        <input
          type="text"
          placeholder="Unit"
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
        />

        <input
          type="number"
          placeholder="Min Stock Level"
          value={minStock}
          onChange={(e) => onMinStockChange(e.target.value)}
        />

        <select
          value={storage}
          onChange={(e) => onStorageChange(e.target.value)}
          style={{
            padding: "6px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">Select Storage Location</option>
          {STORAGE_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <input
          type="date"
          placeholder="Purchased"
          value={purchased}
          onChange={(e) => onPurchasedChange(e.target.value)}
        />

        <input
          type="date"
          placeholder="Use By"
          value={useBy}
          onChange={(e) => onUseByChange(e.target.value)}
        />

        <div>
          <label>
            <input
              type="checkbox"
              checked={toBuy}
              onChange={(e) => onToBuyChange(e.target.checked)}
            />{" "}
            To Buy?
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={frequentlyUsed}
              onChange={(e) => onFrequentlyUsedChange(e.target.checked)}
            />{" "}
            Frequently Used?
          </label>
        </div>
      </div>

      <button
        onClick={onAddProduct}
        style={{ padding: "10px 20px", cursor: "pointer" }}
      >
        Add
      </button>
    </>
  );
}
