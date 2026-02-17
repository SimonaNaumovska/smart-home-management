import { useState, useEffect } from "react";
import type {
  ChoreDefinition,
  User,
  Product,
  Room,
  ChoreCategory,
} from "../../types/Product";

interface ChoresDashboardProps {
  chores: ChoreDefinition[];
  products: Product[];
  activeUser: User | null;
  rooms: Room[];
  choreCategories: ChoreCategory[];
  onAddChore: (chore: ChoreDefinition) => void;
  onUpdateChore: (chore: ChoreDefinition) => void;
  onCompleteChore: (choreId: string) => void;
  onDeleteChore: (choreId: string) => void;
}

// Fallback rooms if no rooms are defined
const DEFAULT_ROOMS = [
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
  activeUser,
  rooms,
  choreCategories,
  onAddChore,
  onUpdateChore,
  onCompleteChore,
  onDeleteChore,
}: ChoresDashboardProps) {
  // Use dynamic rooms if available, otherwise use defaults
  const availableRooms =
    rooms.length > 0
      ? rooms.sort((a, b) => a.order - b.order).map((r) => r.name)
      : DEFAULT_ROOMS;

  // Use dynamic categories if available, otherwise use defaults
  const availableCategories =
    choreCategories.length > 0
      ? choreCategories.sort((a, b) => a.order - b.order).map((c) => c.name)
      : CATEGORIES.map((c) => c.label);
  const [choreView, setChoreView] = useState<"dashboard" | "form">("dashboard");
  const [taskName, setTaskName] = useState("");
  const [room, setRoom] = useState(availableRooms[0] || "Kitchen");
  const [choreCategory, setChoreCategory] = useState<
    ChoreDefinition["choreCategory"]
  >(availableCategories[0] || "Daily");
  const [priority, setPriority] =
    useState<ChoreDefinition["priority"]>("02 Normal");
  const [frequency, setFrequency] = useState(1);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    if (status.includes("OVERDUE")) return "chore-status-overdue";
    if (status.includes("DUE TODAY")) return "chore-status-today";
    if (status.includes("DUE TOMORROW")) return "chore-status-tomorrow";
    if (status.includes("NOT SET")) return "chore-status-notset";
    return "chore-status-ok";
  };

  const handleAddTask = () => {
    if (!taskName.trim()) {
      alert("Please enter a chore name");
      return;
    }

    const newChore: ChoreDefinition = {
      id: `CHORE-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
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
    setChoreView("dashboard");
  };

  const handleMarkDone = (chore: ChoreDefinition) => {
    if (!activeUser) {
      alert("Please select an active user first");
      return;
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

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

    if (chore.consumedProducts.length > 0) {
      onCompleteChore(chore.id);
    }

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

  const sortedChores = [...chores].sort((a, b) => {
    const statusA = getStatus(a);
    const statusB = getStatus(b);
    return statusA.localeCompare(statusB);
  });

  return (
    <div className="chores-container">
      {/* Header */}
      <div className="chores-header">
        <h2>🗓️ Chores Management</h2>
      </div>

      {!activeUser && (
        <div className="chores-warning">
          ⚠️ Please select an active user to mark chores as done
        </div>
      )}

      {choreView === "dashboard" ? (
        <>
          {/* Statistics Cards */}
          <div className="chores-stats">
            <div className="chore-stat-card stat-overdue">
              <div className="stat-value">
                {chores.filter((c) => getStatus(c).includes("OVERDUE")).length}
              </div>
              <div className="stat-label">Overdue</div>
            </div>

            <div className="chore-stat-card stat-today">
              <div className="stat-value">
                {
                  chores.filter((c) => getStatus(c).includes("DUE TODAY"))
                    .length
                }
              </div>
              <div className="stat-label">Due Today</div>
            </div>

            <div className="chore-stat-card stat-active">
              <div className="stat-value">
                {chores.filter((c) => c.active).length}
              </div>
              <div className="stat-label">Active</div>
            </div>

            <div className="chore-stat-card stat-skipped">
              <div className="stat-value">
                {chores.filter((c) => c.skipToday).length}
              </div>
              <div className="stat-label">Skipped</div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="chores-toolbar">
            <button
              onClick={() => setChoreView("dashboard")}
              className="toolbar-icon-btn active"
            >
              <span className="btn-icon">📊</span>
              <span className="btn-label">Dashboard</span>
            </button>
            <button
              onClick={() => setChoreView("form")}
              className="toolbar-icon-btn"
            >
              <span className="btn-icon">➕</span>
              <span className="btn-label">Add Chore</span>
            </button>
          </div>

          {/* Chores Table - Desktop */}
          {!isMobileView ? (
            <div className="chores-table-wrapper">
              <table className="chores-table">
                <thead>
                  <tr>
                    <th>Chore</th>
                    <th>Room</th>
                    <th>Frequency</th>
                    <th>Priority</th>
                    <th className="th-center">Active</th>
                    <th className="th-center">Done</th>
                    <th className="th-center">Skip</th>
                    <th>Last Done</th>
                    <th>Next Due</th>
                    <th>Status</th>
                    <th className="th-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedChores.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="empty-state">
                        No chores yet. Click "Add Chore" to get started!
                      </td>
                    </tr>
                  ) : (
                    sortedChores.map((chore) => {
                      const status = getStatus(chore);
                      const statusColorClass = getStatusColor(status);

                      return (
                        <tr
                          key={chore.id}
                          className={`chore-row ${!chore.active ? "inactive" : ""} ${chore.skipToday ? "skipped" : ""}`}
                        >
                          <td className="chore-name">{chore.name}</td>
                          <td className="chore-room">{chore.room}</td>
                          <td>{chore.choreCategory}</td>
                          <td>
                            <span
                              className={`priority-badge ${
                                chore.priority.includes("High")
                                  ? "priority-high"
                                  : chore.priority.includes("Low")
                                    ? "priority-low"
                                    : "priority-normal"
                              }`}
                            >
                              {chore.priority}
                            </span>
                          </td>
                          <td className="td-center">
                            <button
                              onClick={() => handleToggleActive(chore)}
                              className={`btn-toggle ${chore.active ? "active" : "inactive"}`}
                            >
                              {chore.active ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="td-center">
                            <button
                              onClick={() => handleMarkDone(chore)}
                              disabled={!activeUser || !chore.active}
                              className="btn-done"
                            >
                              ✓ Done
                            </button>
                          </td>
                          <td className="td-center">
                            <button
                              onClick={() => handleSkipToday(chore)}
                              disabled={!chore.active}
                              className={`btn-skip ${chore.skipToday ? "skipped" : ""}`}
                            >
                              {chore.skipToday ? "Skipped" : "Skip"}
                            </button>
                          </td>
                          <td className="chore-date">
                            {chore.lastDone || "-"}
                          </td>
                          <td className="chore-date">{chore.nextDue || "-"}</td>
                          <td>
                            <span
                              className={`status-badge ${statusColorClass}`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="td-center">
                            <button
                              onClick={() => onDeleteChore(chore.id)}
                              className="btn-delete"
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
          ) : (
            /* Chores Cards - Mobile */
            <div className="chores-cards-mobile">
              {sortedChores.length === 0 ? (
                <div className="empty-state-mobile">
                  No chores yet. Click "Add Chore" to get started!
                </div>
              ) : (
                sortedChores.map((chore) => {
                  const status = getStatus(chore);
                  const statusColorClass = getStatusColor(status);

                  return (
                    <div
                      key={chore.id}
                      className={`chore-card ${!chore.active ? "inactive" : ""} ${chore.skipToday ? "skipped" : ""}`}
                    >
                      <div className="chore-card-header">
                        <div className="chore-card-title">{chore.name}</div>
                        <span className={`status-badge ${statusColorClass}`}>
                          {status}
                        </span>
                      </div>

                      <div className="chore-card-info">
                        <div className="chore-info-item">
                          <span className="info-label">Room:</span>
                          <span>{chore.room}</span>
                        </div>
                        <div className="chore-info-item">
                          <span className="info-label">Frequency:</span>
                          <span>{chore.choreCategory}</span>
                        </div>
                        <div className="chore-info-item">
                          <span className="info-label">Priority:</span>
                          <span
                            className={`priority-badge ${
                              chore.priority.includes("High")
                                ? "priority-high"
                                : chore.priority.includes("Low")
                                  ? "priority-low"
                                  : "priority-normal"
                            }`}
                          >
                            {chore.priority}
                          </span>
                        </div>
                        <div className="chore-info-item">
                          <span className="info-label">Last Done:</span>
                          <span>{chore.lastDone || "-"}</span>
                        </div>
                        <div className="chore-info-item">
                          <span className="info-label">Next Due:</span>
                          <span>{chore.nextDue || "-"}</span>
                        </div>
                      </div>

                      <div className="chore-card-actions">
                        <button
                          onClick={() => handleToggleActive(chore)}
                          className={`btn-toggle ${chore.active ? "active" : "inactive"}`}
                        >
                          {chore.active ? "Active" : "Inactive"}
                        </button>
                        <button
                          onClick={() => handleMarkDone(chore)}
                          disabled={!activeUser || !chore.active}
                          className="btn-done"
                        >
                          ✓ Done
                        </button>
                        <button
                          onClick={() => handleSkipToday(chore)}
                          disabled={!chore.active}
                          className={`btn-skip ${chore.skipToday ? "skipped" : ""}`}
                        >
                          {chore.skipToday ? "Skipped" : "Skip"}
                        </button>
                        <button
                          onClick={() => onDeleteChore(chore.id)}
                          className="btn-delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Toolbar for form view */}
          <div className="chores-toolbar">
            <button
              onClick={() => setChoreView("dashboard")}
              className="toolbar-icon-btn"
            >
              <span className="btn-icon">📊</span>
              <span className="btn-label">Dashboard</span>
            </button>
            <button
              onClick={() => setChoreView("form")}
              className="toolbar-icon-btn active"
            >
              <span className="btn-icon">➕</span>
              <span className="btn-label">Add Chore</span>
            </button>
          </div>

          {/* Add Chore Form */}
          <div className="chore-form">
            <div className="form-header">
              <h3>Add New Chore</h3>
            </div>

            <div className="form-grid">
              {/* Row 1: Chore Name, Room, Frequency, Priority */}
              <div className="form-field col-3">
                <label className="form-label">Chore Name</label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Clean kitchen"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Room</label>
                <select
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="form-input"
                >
                  {availableRooms.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Frequency</label>
                <select
                  value={choreCategory}
                  onChange={(e) => {
                    const cat = e.target
                      .value as ChoreDefinition["choreCategory"];
                    setChoreCategory(cat);
                    // Find frequency from choreCategories, fallback to CATEGORIES constant
                    const categoryData = choreCategories.find(
                      (c) => c.name === cat,
                    );
                    const freq = categoryData
                      ? categoryData.frequencyDays
                      : CATEGORIES.find((c) => c.label === cat)?.days || 1;
                    setFrequency(freq);
                  }}
                  className="form-input"
                >
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Priority</label>
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as ChoreDefinition["priority"])
                  }
                  className="form-input"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button onClick={handleAddTask} className="form-submit chore">
              Add Task
            </button>
          </div>
        </>
      )}
    </div>
  );
}
