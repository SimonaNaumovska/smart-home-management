import { supabase } from "../../config/supabase";
import { AppError } from "../../middleware/errorHandler";
import type {
  Household,
  HouseholdMember,
  CreateHouseholdDTO,
  JoinHouseholdDTO,
  UpdateHouseholdDTO,
  UpdateMemberDTO,
  GetHouseholdQuery,
  GetMembersQuery,
  HouseholdWithMembers,
} from "./household.types";

export class HouseholdService {
  // ========== HOUSEHOLDS ==========

  async getHouseholdByUserId(
    query: GetHouseholdQuery,
  ): Promise<HouseholdWithMembers | null> {
    // Get user's household membership
    const { data: memberData, error: memberError } = await supabase
      .from("household_members")
      .select("household_id, role, display_name, joined_at")
      .eq("user_id", query.userId)
      .maybeSingle();

    if (memberError && memberError.code !== "PGRST116") {
      throw new AppError(
        `Failed to fetch household membership: ${memberError.message}`,
        500,
      );
    }

    if (!memberData) {
      return null; // User has no household
    }

    // Get household details
    const { data: householdData, error: householdError } = await supabase
      .from("households")
      .select("id, name, created_at")
      .eq("id", memberData.household_id)
      .single();

    if (householdError) {
      throw new AppError(
        `Failed to fetch household: ${householdError.message}`,
        404,
      );
    }

    // Get all household members
    const { data: membersData, error: membersError } = await supabase
      .from("household_members")
      .select(
        "id, household_id, user_id, role, display_name, avatar, color, joined_at",
      )
      .eq("household_id", memberData.household_id);

    if (membersError) {
      throw new AppError(
        `Failed to fetch household members: ${membersError.message}`,
        500,
      );
    }

    return {
      household: {
        id: householdData.id,
        name: householdData.name,
        createdAt: householdData.created_at,
      },
      members:
        membersData?.map((m) => ({
          id: m.id,
          householdId: m.household_id,
          userId: m.user_id,
          role: m.role as "owner" | "member",
          displayName: m.display_name,
          avatar: m.avatar || "👤",
          color: m.color || "#4CAF50",
          joinedAt: m.joined_at,
        })) || [],
    };
  }

  async getHouseholdById(id: string): Promise<Household> {
    const { data, error } = await supabase
      .from("households")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new AppError(`Failed to fetch household: ${error.message}`, 404);
    }

    return {
      id: data.id,
      name: data.name,
      createdAt: data.created_at,
    };
  }

  async createHousehold(
    householdData: CreateHouseholdDTO,
  ): Promise<HouseholdWithMembers> {
    // Check if user already has a household
    const { data: existingMember } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", householdData.ownerUserId)
      .maybeSingle();

    if (existingMember) {
      // User already has a household, return it
      const existing = await this.getHouseholdByUserId({
        userId: householdData.ownerUserId,
      });
      if (existing) {
        return existing;
      }
    }

    // Generate household ID if not provided
    const householdId =
      householdData.id ||
      `household-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create household
    const { data: household, error: householdError } = await supabase
      .from("households")
      .insert({
        id: householdId,
        name: householdData.name,
      })
      .select()
      .single();

    if (householdError) {
      throw new AppError(
        `Failed to create household: ${householdError.message}`,
        500,
      );
    }

    // Add user as owner
    const { data: member, error: memberError } = await supabase
      .from("household_members")
      .insert({
        household_id: householdId,
        user_id: householdData.ownerUserId,
        role: "owner",
        display_name: householdData.ownerDisplayName,
        avatar: householdData.ownerAvatar || "👤",
        color: householdData.ownerColor || "#4CAF50",
      })
      .select()
      .single();

    if (memberError) {
      throw new AppError(
        `Failed to add household member: ${memberError.message}`,
        500,
      );
    }

    return {
      household: {
        id: household.id,
        name: household.name,
        createdAt: household.created_at,
      },
      members: [
        {
          id: member.id,
          householdId: member.household_id,
          userId: member.user_id,
          role: member.role as "owner" | "member",
          displayName: member.display_name,
          avatar: member.avatar || "👤",
          color: member.color || "#4CAF50",
          joinedAt: member.joined_at,
        },
      ],
    };
  }

  async updateHousehold(
    id: string,
    updates: UpdateHouseholdDTO,
  ): Promise<Household> {
    const { data, error } = await supabase
      .from("households")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to update household: ${error.message}`, 500);
    }

    return {
      id: data.id,
      name: data.name,
      createdAt: data.created_at,
    };
  }

  async deleteHousehold(id: string): Promise<void> {
    const { error } = await supabase.from("households").delete().eq("id", id);

    if (error) {
      throw new AppError(`Failed to delete household: ${error.message}`, 500);
    }
  }

  // ========== HOUSEHOLD MEMBERS ==========

  async getMembers(query: GetMembersQuery): Promise<HouseholdMember[]> {
    const { data, error } = await supabase
      .from("household_members")
      .select("*")
      .eq("household_id", query.householdId);

    if (error) {
      throw new AppError(
        `Failed to fetch household members: ${error.message}`,
        500,
      );
    }

    return (
      data?.map((m) => ({
        id: m.id,
        householdId: m.household_id,
        userId: m.user_id,
        role: m.role as "owner" | "member",
        displayName: m.display_name,
        avatar: m.avatar || "👤",
        color: m.color || "#4CAF50",
        joinedAt: m.joined_at,
      })) || []
    );
  }

  async joinHousehold(joinData: JoinHouseholdDTO): Promise<HouseholdMember> {
    const { data, error } = await supabase
      .from("household_members")
      .insert({
        household_id: joinData.householdId,
        user_id: joinData.userId,
        role: "member",
        display_name: joinData.displayName,
        avatar: joinData.avatar || "👤",
        color: joinData.color || "#4CAF50",
      })
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to join household: ${error.message}`, 500);
    }

    return {
      id: data.id,
      householdId: data.household_id,
      userId: data.user_id,
      role: data.role as "owner" | "member",
      displayName: data.display_name,
      avatar: data.avatar || "👤",
      color: data.color || "#4CAF50",
      joinedAt: data.joined_at,
    };
  }

  async updateMember(
    memberId: string,
    updates: UpdateMemberDTO,
  ): Promise<HouseholdMember> {
    const { data, error } = await supabase
      .from("household_members")
      .update(updates)
      .eq("id", memberId)
      .select()
      .single();

    if (error) {
      throw new AppError(
        `Failed to update household member: ${error.message}`,
        500,
      );
    }

    return {
      id: data.id,
      householdId: data.household_id,
      userId: data.user_id,
      role: data.role as "owner" | "member",
      displayName: data.display_name,
      avatar: data.avatar || "👤",
      color: data.color || "#4CAF50",
      joinedAt: data.joined_at,
    };
  }

  async leavehousehold(userId: string, householdId: string): Promise<void> {
    const { error } = await supabase
      .from("household_members")
      .delete()
      .eq("user_id", userId)
      .eq("household_id", householdId);

    if (error) {
      throw new AppError(`Failed to leave household: ${error.message}`, 500);
    }
  }

  async removeMember(memberId: string): Promise<void> {
    const { error } = await supabase
      .from("household_members")
      .delete()
      .eq("id", memberId);

    if (error) {
      throw new AppError(
        `Failed to remove household member: ${error.message}`,
        500,
      );
    }
  }
}

export const householdService = new HouseholdService();
