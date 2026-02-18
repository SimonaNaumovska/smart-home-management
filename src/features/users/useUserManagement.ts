import { useMemo } from "react";
import type { User } from "../../types/Product";
import type { HouseholdMember } from "../../api/householdApi";

interface UseUserManagementProps {
  currentUser: User | null;
  householdMembers: HouseholdMember[];
  currentUserId: string | null;
}

interface MemberCardData {
  member: HouseholdMember;
  isCurrentUser: boolean;
  displayName: string;
  cardStyles: {
    border: string;
    backgroundColor: string;
  };
}

export function useUserManagement({
  currentUser,
  householdMembers,
  currentUserId,
}: UseUserManagementProps) {
  // Check if a member is the current user
  const isCurrentUser = (memberId: string) => memberId === currentUserId;

  // Get card styles based on whether member is current user
  const getMemberCardStyles = (member: HouseholdMember, isCurrent: boolean) => {
    return {
      border: isCurrent ? `3px solid ${member.color}` : "2px solid #ddd",
      backgroundColor: isCurrent ? member.color + "30" : "white",
    };
  };

  // Get display name with "(You)" suffix for current user
  const getMemberDisplayName = (
    member: HouseholdMember,
    isCurrent: boolean,
  ) => {
    return member.displayName + (isCurrent ? " (You)" : "");
  };

  // Prepare member card data with computed values
  const memberCardData = useMemo((): MemberCardData[] => {
    return householdMembers.map((member) => {
      const isCurrent = isCurrentUser(member.userId);
      return {
        member,
        isCurrentUser: isCurrent,
        displayName: getMemberDisplayName(member, isCurrent),
        cardStyles: getMemberCardStyles(member, isCurrent),
      };
    });
  }, [householdMembers, currentUserId]);

  // Current user card styles
  const currentUserCardStyles = useMemo(() => {
    if (!currentUser) return {};
    return {
      backgroundColor: currentUser.color + "20",
      border: `2px solid ${currentUser.color}`,
    };
  }, [currentUser]);

  return {
    currentUser,
    memberCardData,
    currentUserCardStyles,
  };
}
