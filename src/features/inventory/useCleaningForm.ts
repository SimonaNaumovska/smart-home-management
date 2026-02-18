import { useMemo } from "react";
import type { Room } from "../../types/Product";

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

interface UseCleaningFormProps {
  rooms: Room[];
}

export const useCleaningForm = ({ rooms }: UseCleaningFormProps) => {
  // Use rooms if available, otherwise use default cleaning storage locations
  const storageLocations = useMemo(
    () =>
      rooms.length > 0
        ? rooms.sort((a, b) => a.order - b.order).map((r) => r.name)
        : CLEANING_STORAGE_LOCATIONS,
    [rooms],
  );

  return {
    storageLocations,
    cleaningUnits: CLEANING_UNITS,
  };
};
