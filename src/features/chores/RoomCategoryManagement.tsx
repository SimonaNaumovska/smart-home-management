import React from "react";
import type { Room, ChoreCategory } from "../../types/Product";
import { useRoomCategoryManagement } from "./useRoomCategoryManagement";

interface RoomCategoryManagementProps {
  rooms: Room[];
  categories: ChoreCategory[];
  onAddRoom: (room: Omit<Room, "id">) => void;
  onDeleteRoom: (roomId: string) => void;
  onAddCategory: (category: Omit<ChoreCategory, "id">) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const RoomCategoryManagement: React.FC<RoomCategoryManagementProps> = ({
  rooms,
  categories,
  onAddRoom,
  onDeleteRoom,
  onAddCategory,
  onDeleteCategory,
}) => {
  const {
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
    roomEmojis,
    categoryEmojis,
    handleAddRoom,
    handleAddCategory,
    formatFrequency,
  } = useRoomCategoryManagement({
    rooms,
    categories,
    onAddRoom,
    onAddCategory,
  });

  return (
    <div style={{ padding: "20px", maxWidth: "800px" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>
        🏠 Rooms & Frequencies
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
          onClick={() => setActiveTab("frequencies")}
          style={{
            padding: "10px 20px",
            backgroundColor:
              activeTab === "frequencies" ? "#2196F3" : "#f5f5f5",
            color: activeTab === "frequencies" ? "white" : "#333",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📋 Frequencies
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

      {/* Frequencies Tab */}
      {activeTab === "frequencies" && (
        <div>
          <h3 style={{ marginBottom: "15px", color: "#2196F3" }}>
            Add Chore Frequency
          </h3>
          <p style={{ marginBottom: "20px", color: "#666", fontSize: "14px" }}>
            Create custom frequencies for your chores (e.g., Daily, Weekly,
            Seasonal, Winter Cleaning, etc.)
          </p>

          {/* Add Category Form */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "20px",
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: "1", minWidth: "150px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                Frequency Name
              </label>
              <input
                type="text"
                placeholder="e.g., Winter Cleaning"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
            </div>
            <div style={{ minWidth: "120px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                Frequency (days)
              </label>
              <input
                type="number"
                min="1"
                placeholder="Days"
                value={newCategoryFrequency}
                onChange={(e) =>
                  setNewCategoryFrequency(parseInt(e.target.value) || 1)
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              />
            </div>
            <div style={{ minWidth: "60px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                Icon
              </label>
              <select
                value={newCategoryIcon}
                onChange={(e) => setNewCategoryIcon(e.target.value)}
                style={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "18px",
                  width: "100%",
                }}
              >
                {categoryEmojis.map((emoji) => (
                  <option key={emoji} value={emoji}>
                    {emoji}
                  </option>
                ))}
              </select>
            </div>
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
                minWidth: "120px",
              }}
            >
              ➕ Add Frequency
            </button>
          </div>

          {/* Frequencies List */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
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
                  <div>
                    <div style={{ fontWeight: "bold", color: "#333" }}>
                      {category.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {formatFrequency(category.frequencyDays)}
                    </div>
                  </div>
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

      {activeTab === "frequencies" && categories.length === 0 && (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            color: "#999",
          }}
        >
          <p>No frequencies yet. Add your first frequency above! 📋</p>
        </div>
      )}
    </div>
  );
};

export default RoomCategoryManagement;
