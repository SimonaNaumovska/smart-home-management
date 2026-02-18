import { useState, useCallback } from "react";
import type { Room, ChoreCategory } from "../../types/Product";

const ROOM_EMOJIS = ["🛏️", "🚿", "🍳", "🛋️", "🧹", "🌳", "🚪", "📚", "🏠"];
const CATEGORY_EMOJIS = [
  "📋",
  "🧹",
  "🧼",
  "🧳",
  "🍳",
  "🧵",
  "💧",
  "🌿",
  "⚙️",
  "❄️",
  "🌸",
  "🍂",
  "☀️",
];

interface UseRoomCategoryManagementProps {
  rooms: Room[];
  categories: ChoreCategory[];
  onAddRoom: (room: Omit<Room, "id">) => void;
  onAddCategory: (category: Omit<ChoreCategory, "id">) => void;
}

export const useRoomCategoryManagement = ({
  rooms,
  categories,
  onAddRoom,
  onAddCategory,
}: UseRoomCategoryManagementProps) => {
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomIcon, setNewRoomIcon] = useState("🛏️");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("📋");
  const [newCategoryFrequency, setNewCategoryFrequency] = useState(7);
  const [activeTab, setActiveTab] = useState<"rooms" | "frequencies">("rooms");

  const handleAddRoom = useCallback(() => {
    if (!newRoomName.trim()) return;
    onAddRoom({
      name: newRoomName,
      icon: newRoomIcon,
      order: rooms.length,
    });
    setNewRoomName("");
    setNewRoomIcon("🛏️");
  }, [newRoomName, newRoomIcon, rooms.length, onAddRoom]);

  const handleAddCategory = useCallback(() => {
    if (!newCategoryName.trim()) return;
    if (newCategoryFrequency < 1) {
      alert("Frequency must be at least 1 day");
      return;
    }
    onAddCategory({
      name: newCategoryName,
      icon: newCategoryIcon,
      frequencyDays: newCategoryFrequency,
      order: categories.length,
    });
    setNewCategoryName("");
    setNewCategoryIcon("📋");
    setNewCategoryFrequency(7);
  }, [
    newCategoryName,
    newCategoryIcon,
    newCategoryFrequency,
    categories.length,
    onAddCategory,
  ]);

  // Helper function to format frequency days into a human-readable string
  const formatFrequency = useCallback((days: number): string => {
    if (days === 1) return "Every day";
    if (days === 7) return "Every week";
    if (days === 14) return "Every 2 weeks";
    if (days === 30) return "Every month";
    if (days === 90) return "Every 3 months";
    if (days === 180) return "Every 6 months";
    return `Every ${days} days`;
  }, []);

  return {
    // State
    newRoomName,
    setNewRoomName,
    newRoomIcon,
    setNewRoomIcon,
    newCategoryName,
    setNewCategoryName,
    newCategoryIcon,
    setNewCategoryIcon,
    newCategoryFrequency,
    setNewCategoryFrequency,
    activeTab,
    setActiveTab,

    // Constants
    roomEmojis: ROOM_EMOJIS,
    categoryEmojis: CATEGORY_EMOJIS,

    // Handlers
    handleAddRoom,
    handleAddCategory,
    formatFrequency,
  };
};
