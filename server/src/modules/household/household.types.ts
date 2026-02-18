// Household Module Types

export interface Household {
  id: string;
  name: string;
  createdAt: string;
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  userId: string;
  role: "owner" | "member";
  displayName: string | null;
  avatar: string;
  color: string;
  joinedAt: string;
}

// DTOs
export interface CreateHouseholdDTO {
  id?: string; // Optional - backend can generate
  name: string;
  ownerUserId: string;
  ownerDisplayName: string;
  ownerAvatar?: string;
  ownerColor?: string;
}

export interface JoinHouseholdDTO {
  householdId: string;
  userId: string;
  displayName: string;
  avatar?: string;
  color?: string;
}

export interface UpdateHouseholdDTO {
  name?: string;
}

export interface UpdateMemberDTO {
  displayName?: string;
  avatar?: string;
  color?: string;
  role?: "owner" | "member";
}

// Query params
export interface GetHouseholdQuery {
  userId: string;
}

export interface GetMembersQuery {
  householdId: string;
}

// Response types
export interface HouseholdWithMembers {
  household: Household;
  members: HouseholdMember[];
}
