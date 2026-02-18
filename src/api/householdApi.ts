import { api } from "./client";

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
  displayName: string;
  avatar: string;
  color: string;
  joinedAt: string;
}

export interface HouseholdWithMembers {
  household: Household;
  members: HouseholdMember[];
}

export interface CreateHouseholdDTO {
  id?: string;
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
}

/**
 * Household API Service - Connects to Express Backend
 * Uses the shared api() helper for consistent API calls
 */
class HouseholdApiService {
  /**
   * Get user's household with all members
   */
  async getUserHousehold(userId: string): Promise<HouseholdWithMembers | null> {
    return await api(`/household?userId=${userId}`);
  }

  /**
   * Get household by ID
   */
  async getHouseholdById(id: string): Promise<Household> {
    return await api(`/household/${id}`);
  }

  /**
   * Create a new household
   */
  async createHousehold(
    household: CreateHouseholdDTO,
  ): Promise<HouseholdWithMembers> {
    return await api("/household", {
      method: "POST",
      body: JSON.stringify(household),
    });
  }

  /**
   * Update household details
   */
  async updateHousehold(
    id: string,
    updates: UpdateHouseholdDTO,
  ): Promise<Household> {
    return await api(`/household/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  /**
   * Delete a household
   */
  async deleteHousehold(id: string): Promise<void> {
    await api(`/household/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Get all members of a household
   */
  async getMembers(householdId: string): Promise<HouseholdMember[]> {
    return await api(`/household/${householdId}/members`);
  }

  /**
   * Join an existing household
   */
  async joinHousehold(joinData: JoinHouseholdDTO): Promise<HouseholdMember> {
    return await api("/household/join", {
      method: "POST",
      body: JSON.stringify(joinData),
    });
  }

  /**
   * Leave a household
   */
  async leaveHousehold(userId: string, householdId: string): Promise<void> {
    await api(`/household/leave?userId=${userId}&householdId=${householdId}`, {
      method: "DELETE",
    });
  }

  /**
   * Update a household member's information
   */
  async updateMember(
    memberId: string,
    updates: UpdateMemberDTO,
  ): Promise<HouseholdMember> {
    return await api(`/household/member/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  /**
   * Remove a member from household
   */
  async removeMember(memberId: string): Promise<void> {
    await api(`/household/member/${memberId}`, {
      method: "DELETE",
    });
  }
}

export const householdApi = new HouseholdApiService();
