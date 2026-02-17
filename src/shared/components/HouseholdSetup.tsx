import React, { useState } from "react";
import "./HouseholdSetup.css";

interface HouseholdSetupProps {
  onHouseholdCreated: (householdId: string) => void;
  onCreateHousehold: (
    name: string,
    displayName: string,
    avatar: string,
    color: string,
  ) => Promise<string>;
  onJoinHousehold: (
    householdId: string,
    displayName: string,
    avatar: string,
    color: string,
  ) => Promise<void>;
  userEmail: string;
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

export const HouseholdSetup: React.FC<HouseholdSetupProps> = ({
  onHouseholdCreated,
  onCreateHousehold,
  onJoinHousehold,
  userEmail,
}) => {
  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [householdName, setHouseholdName] = useState("");
  const [householdId, setHouseholdId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdName.trim() || !displayName.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const newHouseholdId = await onCreateHousehold(
        householdName,
        displayName,
        avatar,
        color,
      );
      onHouseholdCreated(newHouseholdId);
    } catch (err: any) {
      setError(err.message || "Failed to create household");
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdId.trim() || !displayName.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onJoinHousehold(householdId, displayName, avatar, color);
      onHouseholdCreated(householdId);
    } catch (err: any) {
      setError(err.message || "Failed to join household");
      setLoading(false);
    }
  };

  if (!mode) {
    return (
      <div className="household-setup-container">
        <div className="household-setup-card">
          <h2 className="household-setup-title">🏠 Welcome!</h2>
          <p className="household-setup-subtitle">
            Logged in as: <strong>{userEmail}</strong>
          </p>
          <p className="household-setup-description">
            To get started, you need to create a new household or join an
            existing one.
          </p>

          <div className="household-setup-options">
            <button
              className="household-option-btn create"
              onClick={() => setMode("create")}
            >
              <span className="option-icon">➕</span>
              <span className="option-title">Create New Household</span>
              <span className="option-desc">
                Start fresh with your own household
              </span>
            </button>

            <button
              className="household-option-btn join"
              onClick={() => setMode("join")}
            >
              <span className="option-icon">🤝</span>
              <span className="option-title">Join Existing Household</span>
              <span className="option-desc">Join someone else's household</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="household-setup-container">
        <div className="household-setup-card">
          <button className="back-btn" onClick={() => setMode(null)}>
            ← Back
          </button>
          <h2 className="household-setup-title">Create New Household</h2>

          <form onSubmit={handleCreate} className="household-form">
            <div className="form-group">
              <label htmlFor="householdName">Household Name</label>
              <input
                id="householdName"
                type="text"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                placeholder="e.g., Smith Family"
                className="form-input"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="displayName">Your Display Name</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., John"
                className="form-input"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label>Choose Your Avatar</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    style={{
                      fontSize: "32px",
                      padding: "8px",
                      border:
                        avatar === av ? "3px solid #4CAF50" : "2px solid #ddd",
                      borderRadius: "8px",
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Choose Your Color</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: c,
                      border: color === c ? "4px solid #000" : "2px solid #ddd",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="submit-btn primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Household"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="household-setup-container">
      <div className="household-setup-card">
        <button className="back-btn" onClick={() => setMode(null)}>
          ← Back
        </button>
        <h2 className="household-setup-title">Join Existing Household</h2>

        <form onSubmit={handleJoin} className="household-form">
          <div className="form-group">
            <label htmlFor="householdId">Household ID</label>
            <input
              id="householdId"
              type="text"
              value={householdId}
              onChange={(e) => setHouseholdId(e.target.value)}
              placeholder="household-xxxxx-xxxxx"
              className="form-input"
              disabled={loading}
              required
            />
            <p className="form-hint">
              Ask the household owner for their Household ID
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="displayName">Your Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., John"
              className="form-input"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Choose Your Avatar</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  style={{
                    fontSize: "32px",
                    padding: "8px",
                    border:
                      avatar === av ? "3px solid #4CAF50" : "2px solid #ddd",
                    borderRadius: "8px",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Choose Your Color</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: c,
                    border: color === c ? "4px solid #000" : "2px solid #ddd",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="submit-btn primary"
            disabled={loading}
          >
            {loading ? "Joining..." : "Join Household"}
          </button>
        </form>
      </div>
    </div>
  );
};
