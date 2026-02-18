import { useMemo } from "react";
import type { Room } from "../../types/Product";

const DEFAULT_FOOD_STORAGE = [
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

interface UseFoodFormProps {
  rooms: Room[];
}

export const useFoodForm = ({ rooms }: UseFoodFormProps) => {
  // Use rooms if available, otherwise use default food storage locations
  const storageLocations = useMemo(
    () =>
      rooms.length > 0
        ? rooms.sort((a, b) => a.order - b.order).map((r) => r.name)
        : DEFAULT_FOOD_STORAGE,
    [rooms],
  );

  return {
    storageLocations,
    foodUnits: FOOD_UNITS,
  };
};
