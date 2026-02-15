import { useState } from "react";
import type { ChoreDefinition, User, Product } from "../types/Product";

interface ChoresDashboardProps {
  chores: ChoreDefinition[];
  products: Product[];
  activeUser: User | null;
  onAddChore: (chore: ChoreDefinition) => void;
  onUpdateChore: (chore: ChoreDefinition) => void;
  onCompleteChore: (choreId: string) => void;
  onDeleteChore: (choreId: string) => void;
}

const ROOMS = [
  "Kitchen",
  "Bathroom",
  "Bedroom1",
  "Bedroom2",
  "Bedroom3",
  "Living Room",
  "Whole House",
  "Storage",
  "Garage",
  "Other",
];

const CATEGORIES = [
  { label: "Daily", days: 1 },
  { label: "Weekly", days: 7 },
  { label: "Biweekly", days: 14 },
  { label: "Monthly", days: 30 },
  { label: "Quarterly", days: 90 },
  { label: "Half-year", days: 180 },
];

const PRIORITIES = ["01 High", "02 Normal", "03 Low"];

export function ChoresDashboard({
  chores,
  // products,
  activeUser,
  onAddChore,
  onUpdateChore,
  onCompleteChore,
  onDeleteChore,
}: ChoresDashboardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [room, setRoom] = useState("Kitchen");
  const [choreCategory, setChoreCategory] =
    useState<ChoreDefinition["choreCategory"]>("Daily");
  const [priority, setPriority] =
    useState<ChoreDefinition["priority"]>("02 Normal");
  const [frequency, setFrequency] = useState(1);

  // Calculate status for each chore
  const getStatus = (chore: ChoreDefinition): string => {
    if (!chore.nextDue) return "04 NOT SET";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(chore.nextDue);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "01 OVERDUE";
    if (diffDays === 0) return "02 DUE TODAY";
    if (diffDays === 1) return "03 DUE TOMORROW";
    return "05 OK";
  };

  const getStatusColor = (status: string): string => {
    if (status.includes("OVERDUE")) return "#f44336";
    if (status.includes("DUE TODAY")) return "#FF9800";
    if (status.includes("DUE TOMORROW")) return "#FFC107";
    if (status.includes("NOT SET")) return "#9E9E9E";
    return "#4CAF50";
  };

  const handleAddTask = () => {
    if (!taskName.trim()) {
      alert("Please enter a task name");
      return;
    }

    const newChore: ChoreDefinition = {
      id: `TASK-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name: taskName,
      room,
      choreCategory,
      priority,
      active: true,
      done: false,
      skipToday: false,
      lastDone: "",
      nextDue: "",
      frequency,
      skipDays: 0,
      consumedProducts: [],
    };

    onAddChore(newChore);
    setTaskName("");
    setShowAddForm(false);
  };

  const handleMarkDone = (chore: ChoreDefinition) => {
    if (!activeUser) {
      alert("Please select an active user first");
      return;
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Calculate next due date
    const nextDueDate = new Date(today);
    nextDueDate.setDate(nextDueDate.getDate() + chore.frequency);
    const nextDueStr = nextDueDate.toISOString().split("T")[0];

    const updatedChore: ChoreDefinition = {
      ...chore,
      done: true,
      lastDone: todayStr,
      nextDue: nextDueStr,
      skipToday: false,
    };

    onUpdateChore(updatedChore);

    // If chore has consumed products, trigger completion
    if (chore.consumedProducts.length > 0) {
      onCompleteChore(chore.id);
    }

    // Reset done after a moment to allow for repeated marking
    setTimeout(() => {
      onUpdateChore({ ...updatedChore, done: false });
    }, 500);
  };

  const handleSkipToday = (chore: ChoreDefinition) => {
    const updatedChore: ChoreDefinition = {
      ...chore,
      skipToday: !chore.skipToday,
      skipDays: chore.skipToday ? 0 : chore.skipDays + 1,
    };

    // If skipping, adjust next due date
    if (!chore.skipToday) {
      const today = new Date();
      const nextDueDate = new Date(today);
      nextDueDate.setDate(nextDueDate.getDate() + 1);
      updatedChore.nextDue = nextDueDate.toISOString().split("T")[0];
    }

    onUpdateChore(updatedChore);
  };

  const handleToggleActive = (chore: ChoreDefinition) => {
    onUpdateChore({ ...chore, active: !chore.active });
  };

  // Sort chores by status priority
  const sortedChores = [...chores].sort((a, b) => {
    const statusA = getStatus(a);
    const statusB = getStatus(b);
    return statusA.localeCompare(statusB);
  });

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "28px" }}>🗓️ Chores Dashboard</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: "12px 24px",
            backgroundColor: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {showAddForm ? "✕ Cancel" : "+ Add Task"}
        </button>
      </div>

      {!activeUser && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#FFF3E0",
            borderLeft: "4px solid #FF9800",
            marginBottom: "20px",
            borderRadius: "4px",
          }}
        >
          ⚠️ Please select an active user to mark tasks as done
        </div>
      )}

      {/* Summary Stats */}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: "1 1 200px",
            padding: "16px",
            backgroundColor: "#FFEBEE",
            borderRadius: "8px",
            borderLeft: "4px solid #f44336",
          }}
        >
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#f44336" }}
          >
            {chores.filter((c) => getStatus(c).includes("OVERDUE")).length}
          </div>
          <div style={{ color: "#666" }}>Overdue Tasks</div>
        </div>

        <div
          style={{
            flex: "1 1 200px",
            padding: "16px",
            backgroundColor: "#FFF3E0",
            borderRadius: "8px",
            borderLeft: "4px solid #FF9800",
          }}
        >
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#FF9800" }}
          >
            {chores.filter((c) => getStatus(c).includes("DUE TODAY")).length}
          </div>
          <div style={{ color: "#666" }}>Due Today</div>
        </div>

        <div
          style={{
            flex: "1 1 200px",
            padding: "16px",
            backgroundColor: "#E8F5E9",
            borderRadius: "8px",
            borderLeft: "4px solid #4CAF50",
          }}
        >
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#4CAF50" }}
          >
            {chores.filter((c) => c.active).length}
          </div>
          <div style={{ color: "#666" }}>Active Tasks</div>
        </div>

        <div
          style={{
            flex: "1 1 200px",
            padding: "16px",
            backgroundColor: "#F3E5F5",
            borderRadius: "8px",
            borderLeft: "4px solid #9C27B0",
          }}
        >
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#9C27B0" }}
          >
            {chores.filter((c) => c.skipToday).length}
          </div>
          <div style={{ color: "#666" }}>Skipped Today</div>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div
          style={{
            padding: "24px",
            backgroundColor: "#FFF8E1",
            borderRadius: "12px",
            marginBottom: "24px",
            border: "2px solid #FF9800",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Add New Task</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ flex: "1 1 calc(50% - 8px)", minWidth: "200px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Task Name *
              </label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "16px",
                  border: "2px solid #ddd",
                  borderRadius: "6px",
                }}
                placeholder="e.g., Clean kitchen"
              />
            </div>

            <div style={{ flex: "1 1 calc(25% - 8px)", minWidth: "150px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Room
              </label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "16px",
                  border: "2px solid #ddd",
                  borderRadius: "6px",
                }}
              >
                {ROOMS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: "1 1 calc(25% - 8px)", minWidth: "150px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Category
              </label>
              <select
                value={choreCategory}
                onChange={(e) => {
                  const cat = e.target
                    .value as ChoreDefinition["choreCategory"];
                  setChoreCategory(cat);
                  const freq =
                    CATEGORIES.find((c) => c.label === cat)?.days || 1;
                  setFrequency(freq);
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "16px",
                  border: "2px solid #ddd",
                  borderRadius: "6px",
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.label} value={c.label}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: "1 1 calc(25% - 8px)", minWidth: "150px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as ChoreDefinition["priority"])
                }
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "16px",
                  border: "2px solid #ddd",
                  borderRadius: "6px",
                }}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleAddTask}
            style={{
              marginTop: "16px",
              padding: "12px 32px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Add Task
          </button>
        </div>
      )}

      {/* Chores Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderRadius: "8px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#FF9800", color: "white" }}>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                Task
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                Room
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                Category
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                Priority
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "center",
                  fontSize: "13px",
                }}
              >
                Active
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "center",
                  fontSize: "13px",
                }}
              >
                Done
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "center",
                  fontSize: "13px",
                }}
              >
                Skip Today
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                Last Done
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                Next Due
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "14px 8px",
                  textAlign: "center",
                  fontSize: "13px",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedChores.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#999",
                    fontSize: "16px",
                  }}
                >
                  No tasks yet. Click "Add Task" to get started!
                </td>
              </tr>
            ) : (
              sortedChores.map((chore) => {
                const status = getStatus(chore);
                const statusColor = getStatusColor(status);

                return (
                  <tr
                    key={chore.id}
                    style={{
                      borderBottom: "1px solid #eee",
                      opacity: chore.active ? 1 : 0.5,
                      backgroundColor: chore.skipToday ? "#FFF9C4" : "white",
                    }}
                  >
                    <td style={{ padding: "12px 8px", fontWeight: "bold" }}>
                      {chore.name}
                    </td>
                    <td style={{ padding: "12px 8px", color: "#666" }}>
                      {chore.room}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      {chore.choreCategory}
                    </td>
                    <td
                      style={{
                        padding: "12px 8px",
                        color: chore.priority.includes("High")
                          ? "#f44336"
                          : chore.priority.includes("Low")
                            ? "#2196F3"
                            : "#666",
                        fontWeight: "bold",
                      }}
                    >
                      {chore.priority}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      <button
                        onClick={() => handleToggleActive(chore)}
                        style={{
                          padding: "4px 12px",
                          backgroundColor: chore.active ? "#4CAF50" : "#9E9E9E",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        {chore.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      <button
                        onClick={() => handleMarkDone(chore)}
                        disabled={!activeUser || !chore.active}
                        style={{
                          padding: "6px 16px",
                          backgroundColor:
                            activeUser && chore.active ? "#4CAF50" : "#ddd",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor:
                            activeUser && chore.active
                              ? "pointer"
                              : "not-allowed",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        ✓ Done
                      </button>
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      <button
                        onClick={() => handleSkipToday(chore)}
                        disabled={!chore.active}
                        style={{
                          padding: "4px 12px",
                          backgroundColor: chore.skipToday
                            ? "#FFC107"
                            : "#f5f5f5",
                          color: chore.skipToday ? "white" : "#666",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          cursor: chore.active ? "pointer" : "not-allowed",
                          fontSize: "12px",
                        }}
                      >
                        {chore.skipToday ? "Skipped" : "Skip"}
                      </button>
                    </td>
                    <td style={{ padding: "12px 8px", fontSize: "13px" }}>
                      {chore.lastDone || "-"}
                    </td>
                    <td style={{ padding: "12px 8px", fontSize: "13px" }}>
                      {chore.nextDue || "-"}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          backgroundColor: statusColor,
                          color: "white",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "bold",
                        }}
                      >
                        {status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      <button
                        onClick={() => onDeleteChore(chore.id)}
                        style={{
                          padding: "4px 8px",
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
