import type { Room } from "../../types/Product";

interface CleaningFormProps {
  name: string;
  quantity: string;
  unit: string;
  minStock: string;
  purchased: string;
  storage: string;
  frequentlyUsed: boolean;
  toBuy: boolean;
  rooms: Room[];
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
  rooms,
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
  // Use rooms if available, otherwise use default cleaning storage locations
  const storageLocations =
    rooms.length > 0
      ? rooms.sort((a, b) => a.order - b.order).map((r) => r.name)
      : CLEANING_STORAGE_LOCATIONS;
  return (
    <div className="compact-form cleaning-form">
      <div className="form-header">
        <h3>🧹 Add Cleaning Item</h3>
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
            {CLEANING_UNITS.map((u) => (
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

        {/* Row 2: Storage Location, Purchase Date */}
        <div className="form-field col-2">
          <label className="form-label">Storage Location</label>
          <select
            value={storage}
            onChange={(e) => onStorageChange(e.target.value)}
            className="form-input"
          >
            <option value="">Select location</option>
            {storageLocations.map((loc) => (
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

      <button onClick={onAddProduct} className="form-submit cleaning">
        Add Cleaning Item
      </button>
    </div>
  );
}
