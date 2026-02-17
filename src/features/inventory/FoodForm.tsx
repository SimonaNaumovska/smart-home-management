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
    <div className="compact-form food-form">
      <div className="form-header">
        <h3>🥗 Add Food Item</h3>
      </div>

      <div className="form-grid">
        {/* Row 1: Item Name, Quantity, Unit, Min Stock */}
        <div className="form-field col-3">
          <label className="form-label">Item Name</label>
          <input
            type="text"
            placeholder="Enter item name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Quantity</label>
          <input
            type="number"
            placeholder="0"
            value={quantity}
            onChange={(e) => onQuantityChange(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Unit</label>
          <select
            value={unit}
            onChange={(e) => onUnitChange(e.target.value)}
            className="form-input"
          >
            <option value="">Select</option>
            {FOOD_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Min Stock</label>
          <input
            type="number"
            placeholder="0"
            value={minStock}
            onChange={(e) => onMinStockChange(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Row 2: Storage Location, Purchase Date, Expiry Date */}
        <div className="form-field col-2">
          <label className="form-label">Storage Location</label>
          <select
            value={storage}
            onChange={(e) => onStorageChange(e.target.value)}
            className="form-input"
          >
            <option value="">Select location</option>
            {FOOD_STORAGE_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field col-2">
          <label className="form-label">Purchase Date</label>
          <input
            type="date"
            value={purchased}
            onChange={(e) => onPurchasedChange(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-field col-2">
          <label className="form-label">Expiry Date</label>
          <input
            type="date"
            value={useBy}
            onChange={(e) => onUseByChange(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Row 3: Checkboxes */}
        <div className="form-checkboxes">
          <label className="form-checkbox-small">
            <input
              type="checkbox"
              checked={frequentlyUsed}
              onChange={(e) => onFrequentlyUsedChange(e.target.checked)}
            />
            <span>Frequently Used</span>
          </label>

          <label className="form-checkbox-small">
            <input
              type="checkbox"
              checked={toBuy}
              onChange={(e) => onToBuyChange(e.target.checked)}
            />
            <span>Add to Shopping List</span>
          </label>
        </div>
      </div>

      <button onClick={onAddProduct} className="form-submit food">
        Add Food Item
      </button>
    </div>
  );
}
