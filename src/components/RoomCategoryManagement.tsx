import React, { useState } from "react";
import type { Room, ChoreCategory } from "../types/Product";

interface RoomCategoryManagementProps {
  rooms: Room[];
  categories: ChoreCategory[];
  onAddRoom: (room: Omit<Room, "id">) => void;
  onAddCategory: (category: Omit<ChoreCategory, "id">) => void;
  onDeleteRoom: (roomId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const RoomCategoryManagement: React.FC<RoomCategoryManagementProps> = ({
  rooms,
  categories,
  onAddRoom,
  onAddCategory,
  onDeleteRoom,
  onDeleteCategory,
}) => {
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomIcon, setNewRoomIcon] = useState("🛏️");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("📋");
  const [activeTab, setActiveTab] = useState<"rooms" | "categories">("rooms");

  const roomEmojis = ["🛏️", "🚿", "🍳", "🛋️", "🧹", "🌳", "🚪", "📚", "🏠"];
  const categoryEmojis = ["📋", "🧹", "🧼", "🧳", "🍳", "🧵", "💧", "🌿", "⚙️"];

  const handleAddRoom = () => {
    if (!newRoomName.trim()) return;
    onAddRoom({
      name: newRoomName,
      icon: newRoomIcon,
      order: rooms.length,
    });
    setNewRoomName("");
    setNewRoomIcon("🛏️");
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    onAddCategory({
      name: newCategoryName,
      icon: newCategoryIcon,
      order: categories.length,
    });
    setNewCategoryName("");
    setNewCategoryIcon("📋");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>
        🏠 Rooms & Categories
      </h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("rooms")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "rooms" ? "#4CAF50" : "#f5f5f5",
            color: activeTab === "rooms" ? "white" : "#333",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🏠 Rooms
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "categories" ? "#2196F3" : "#f5f5f5",
            color: activeTab === "categories" ? "white" : "#333",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📋 Categories
        </button>
      </div>

      {/* Rooms Tab */}
      {activeTab === "rooms" && (
        <div>
          <h3 style={{ marginBottom: "15px", color: "#4CAF50" }}>Add Room</h3>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="Room name (e.g., Kitchen)"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              style={{
                flex: 1,
                minWidth: "200px",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
            <select
              value={newRoomIcon}
              onChange={(e) => setNewRoomIcon(e.target.value)}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "18px",
                minWidth: "60px",
              }}
            >
              {roomEmojis.map((emoji) => (
                <option key={emoji} value={emoji}>
                  {emoji}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddRoom}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ➕ Add Room
            </button>
          </div>

          {/* Rooms List */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "15px",
            }}
          >
            {rooms.map((room) => (
              <div
                key={room.id}
                style={{
                  padding: "15px",
                  backgroundColor: "#f0f8ff",
                  border: "2px solid #4CAF50",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span style={{ fontSize: "24px" }}>{room.icon}</span>
                  <span style={{ fontWeight: "bold", color: "#333" }}>
                    {room.name}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteRoom(room.id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  ✕ Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div>
          <h3 style={{ marginBottom: "15px", color: "#2196F3" }}>
            Add Chore Category
          </h3>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              placeholder="Category name (e.g., Cleaning)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={{
                flex: 1,
                minWidth: "200px",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            />
            <select
              value={newCategoryIcon}
              onChange={(e) => setNewCategoryIcon(e.target.value)}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "18px",
                minWidth: "60px",
              }}
            >
              {categoryEmojis.map((emoji) => (
                <option key={emoji} value={emoji}>
                  {emoji}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddCategory}
              style={{
                padding: "10px 20px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ➕ Add Category
            </button>
          </div>

          {/* Categories List */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "15px",
            }}
          >
            {categories.map((category) => (
              <div
                key={category.id}
                style={{
                  padding: "15px",
                  backgroundColor: "#e3f2fd",
                  border: "2px solid #2196F3",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span style={{ fontSize: "24px" }}>{category.icon}</span>
                  <span style={{ fontWeight: "bold", color: "#333" }}>
                    {category.name}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteCategory(category.id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  ✕ Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {activeTab === "rooms" && rooms.length === 0 && (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            color: "#999",
          }}
        >
          <p>No rooms yet. Add your first room above! 🏠</p>
        </div>
      )}

      {activeTab === "categories" && categories.length === 0 && (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            color: "#999",
          }}
        >
          <p>No categories yet. Add your first category above! 📋</p>
        </div>
      )}
    </div>
  );
};

export default RoomCategoryManagement;
