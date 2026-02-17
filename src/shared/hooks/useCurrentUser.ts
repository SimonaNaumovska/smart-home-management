import { useState, useEffect } from "react";
import type { User } from "../../types/Product";
import type { HouseholdMember } from "./useHousehold";

/**
 * Hook to get the current authenticated user as a User object
 * Maps the authenticated user to their household_member record
 */
export const useCurrentUser = (
  currentUserId: string | null,
  householdMembers: HouseholdMember[],
): User | null => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (!currentUserId || householdMembers.length === 0) {
      setCurrentUser(null);
      return;
    }

    // Find the household member record for the authenticated user
    const member = householdMembers.find((m) => m.userId === currentUserId);

    if (member) {
      setCurrentUser({
        id: member.userId,
        name: member.displayName || "Unknown",
        avatar: member.avatar,
        color: member.color,
      });
    } else {
      setCurrentUser(null);
    }
  }, [currentUserId, householdMembers]);

  return currentUser;
};
