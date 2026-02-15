import type { User } from "../types/Product";

interface UserManagementProps {
  users: User[];
  activeUser: User | null;
  onSelectUser: (user: User) => void;
  onAddUser: (name: string, avatar: string, color: string) => void;
}

const AVATARS = ["👤", "👨", "👩", "🧑", "👦", "👧", "🧔", "👨‍🦱", "👩‍🦰", "👨‍🦲"];
const COLORS = [
  "#4CAF50",
  "#2196F3",
  "#FF9800",
  "#E91E63",
  "#9C27B0",
  "#00BCD4",
];

export function UserManagement({
  users,
  activeUser,
  onSelectUser,
  onAddUser,
}: UserManagementProps) {
  const [showAddUser, setShowAddUser] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleAddUser = () => {
    if (!newName.trim()) return;
    onAddUser(newName.trim(), selectedAvatar, selectedColor);
    setNewName("");
    setSelectedAvatar(AVATARS[0]);
    setSelectedColor(COLORS[0]);
    setShowAddUser(false);
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        marginBottom: "20px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h2>👥 Household Members</h2>

      {/* Active User Display */}
      {activeUser && (
        <div
          style={{
            padding: "12px",
            backgroundColor: activeUser.color + "20",
            border: `2px solid ${activeUser.color}`,
            borderRadius: "8px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "32px" }}>{activeUser.avatar}</span>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "18px" }}>
              Active User: {activeUser.name}
            </div>
            <div style={{ fontSize: "14px", color: "#666" }}>
              All actions will be logged under this user
            </div>
          </div>
        </div>
      )}

      {/* User Selection */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => onSelectUser(user)}
            style={{
              padding: "12px 16px",
              border:
                activeUser?.id === user.id
                  ? `3px solid ${user.color}`
                  : "2px solid #ddd",
              borderRadius: "8px",
              backgroundColor:
                activeUser?.id === user.id ? user.color + "30" : "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "16px",
              fontWeight: activeUser?.id === user.id ? "bold" : "normal",
            }}
          >
            <span style={{ fontSize: "24px" }}>{user.avatar}</span>
            <span>{user.name}</span>
          </button>
        ))}

        <button
          onClick={() => setShowAddUser(!showAddUser)}
          style={{
            padding: "12px 16px",
            border: "2px dashed #4CAF50",
            borderRadius: "8px",
            backgroundColor: "white",
            cursor: "pointer",
            fontSize: "16px",
            color: "#4CAF50",
            fontWeight: "bold",
          }}
        >
          + Add Member
        </button>
      </div>

      {/* Add User Form */}
      {showAddUser && (
        <div
          style={{
            padding: "16px",
            border: "2px solid #4CAF50",
            borderRadius: "8px",
            backgroundColor: "white",
          }}
        >
          <h3>Add New Household Member</h3>

          <input
            type="text"
            placeholder="Name (e.g., Daniel, Damjan)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "100%",
              marginBottom: "12px",
              fontSize: "16px",
            }}
          />

          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Choose Avatar:
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  style={{
                    padding: "8px",
                    fontSize: "24px",
                    border:
                      selectedAvatar === avatar
                        ? "3px solid #4CAF50"
                        : "2px solid #ddd",
                    borderRadius: "8px",
                    backgroundColor:
                      selectedAvatar === avatar ? "#e8f5e9" : "white",
                    cursor: "pointer",
                  }}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Choose Color:
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: color,
                    border:
                      selectedColor === color
                        ? "4px solid #000"
                        : "2px solid #ddd",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleAddUser}
              style={{
                padding: "10px 20px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              Add Member
            </button>
            <button
              onClick={() => setShowAddUser(false)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#666",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
