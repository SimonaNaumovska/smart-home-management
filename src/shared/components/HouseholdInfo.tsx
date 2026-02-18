import React, { useState } from "react";
import type { Household, HouseholdMember } from "../../api/householdApi";
import "./HouseholdInfo.css";

interface HouseholdInfoProps {
  household: Household;
  members: HouseholdMember[];
  currentUserId: string;
}

export const HouseholdInfo: React.FC<HouseholdInfoProps> = ({
  household,
  members,
  currentUserId,
}) => {
  const [copied, setCopied] = useState(false);

  const currentMember = members.find((m) => m.userId === currentUserId);
  const isOwner = currentMember?.role === "owner";

  const copyHouseholdId = () => {
    navigator.clipboard.writeText(household.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="household-info-container">
      <div className="household-info-card">
        <h3 className="household-info-title">🏠 Household Information</h3>

        <div className="household-detail">
          <span className="detail-label">Name:</span>
          <span className="detail-value">{household.name}</span>
        </div>

        <div className="household-detail">
          <span className="detail-label">Household ID:</span>
          <div className="household-id-row">
            <code className="household-id">{household.id}</code>
            <button className="copy-btn" onClick={copyHouseholdId}>
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          </div>
          <p className="detail-hint">
            Share this ID with family members so they can join your household
          </p>
        </div>

        <div className="household-detail">
          <span className="detail-label">Your Role:</span>
          <span className={`role-badge ${currentMember?.role}`}>
            {currentMember?.role === "owner" ? "👑 Owner" : "👤 Member"}
          </span>
        </div>

        <div className="household-detail">
          <span className="detail-label">Members ({members.length}):</span>
          <div className="members-list">
            {members.map((member) => (
              <div key={member.id} className="member-item">
                <span className="member-name">
                  {member.displayName || "Unnamed"}
                  {member.userId === currentUserId && " (You)"}
                </span>
                <span className={`member-role ${member.role}`}>
                  {member.role === "owner" ? "Owner" : "Member"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {isOwner && (
          <div className="owner-notice">
            <strong>💡 Tip:</strong> As the owner, you can share the Household
            ID above with others to let them join your household.
          </div>
        )}
      </div>
    </div>
  );
};
