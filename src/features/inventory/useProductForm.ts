import { useMemo } from "react";
import type { Room } from "../../types/Product";

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

// Fallback storage locations if no rooms are defined
const DEFAULT_STORAGE_LOCATIONS = [
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

interface UseProductFormProps {
  rooms: Room[];
}

export const useProductForm = ({ rooms }: UseProductFormProps) => {
  // Use rooms if available, otherwise use default locations
  const storageLocations = useMemo(
    () =>
      rooms.length > 0
        ? rooms.sort((a, b) => a.order - b.order).map((r) => r.name)
        : DEFAULT_STORAGE_LOCATIONS,
    [rooms],
  );

  return {
    storageLocations,
    categories: CATEGORIES,
  };
};
