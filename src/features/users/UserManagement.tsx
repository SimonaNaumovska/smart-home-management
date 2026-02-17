import type { User } from "../../types/Product";
import type { HouseholdMember } from "../../shared/hooks/useHousehold";

interface UserManagementProps {
  currentUser: User | null;
  householdMembers: HouseholdMember[];
  currentUserId: string | null;
}

export function UserManagement({
  currentUser,
  householdMembers,
  currentUserId,
}: UserManagementProps) {
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
      <p style={{ color: "#666", marginBottom: "20px" }}>
        These are all members of your household. You are currently logged in as{" "}
        <strong>{currentUser?.name}</strong>.
      </p>

      {/* Current User Display */}
      {currentUser && (
        <div
          style={{
            padding: "12px",
            backgroundColor: currentUser.color + "20",
            border: `2px solid ${currentUser.color}`,
            borderRadius: "8px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "32px" }}>{currentUser.avatar}</span>
          <div>
            <div style={{ fontWeight: "bold", fontSize: "18px" }}>
              You: {currentUser.name}
            </div>
            <div style={{ fontSize: "14px", color: "#666" }}>
              All actions are logged under your account
            </div>
          </div>
        </div>
      )}

      {/* All Household Members */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <h3 style={{ marginBottom: "8px" }}>All Members:</h3>
        {householdMembers.map((member) => (
          <div
            key={member.id}
            style={{
              padding: "12px 16px",
              border:
                member.userId === currentUserId
                  ? `3px solid ${member.color}`
                  : "2px solid #ddd",
              borderRadius: "8px",
              backgroundColor:
                member.userId === currentUserId ? member.color + "30" : "white",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "24px" }}>{member.avatar}</span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight:
                    member.userId === currentUserId ? "bold" : "normal",
                }}
              >
                {member.displayName}
                {member.userId === currentUserId && " (You)"}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  textTransform: "capitalize",
                }}
              >
                {member.role}
              </div>
            </div>
            {member.userId === currentUserId && (
              <span style={{ color: "#4CAF50", fontSize: "20px" }}>✓</span>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "12px",
          backgroundColor: "#e3f2fd",
          borderRadius: "8px",
          fontSize: "14px",
          color: "#1976d2",
        }}
      >
        💡 <strong>Tip:</strong> To add new members, share your Household ID
        (found in Settings) with them. They can join during signup or by
        contacting support.
      </div>
    </div>
  );
}
