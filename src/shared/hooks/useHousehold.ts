import { useState, useEffect } from "react";
import { supabase } from "../../supabase/config";

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

export interface Household {
  id: string;
  name: string;
  createdAt: string;
}

export const useHousehold = (authUserId: string | null) => {
  const [household, setHousehold] = useState<Household | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUserId) {
      setLoading(false);
      return;
    }

    fetchHousehold();
  }, [authUserId]);

  const fetchHousehold = async () => {
    if (!authUserId) return;

    try {
      setLoading(true);
      setError(null);

      // Get user's household membership
      const { data: memberData, error: memberError } = await supabase
        .from("household_members")
        .select("household_id, role, display_name, joined_at")
        .eq("user_id", authUserId)
        .single();

      if (memberError) {
        if (memberError.code === "PGRST116") {
          // No household found - user needs to create or join one
          setHousehold(null);
          setHouseholdMembers([]);
          setLoading(false);
          return;
        }
        throw memberError;
      }

      // Get household details
      const { data: householdData, error: householdError } = await supabase
        .from("households")
        .select("id, name, created_at")
        .eq("id", memberData.household_id)
        .single();

      if (householdError) throw householdError;

      setHousehold({
        id: householdData.id,
        name: householdData.name,
        createdAt: householdData.created_at,
      });

      // Get all household members
      const { data: membersData, error: membersError } = await supabase
        .from("household_members")
        .select(
          "id, household_id, user_id, role, display_name, avatar, color, joined_at",
        )
        .eq("household_id", memberData.household_id);

      if (membersError) throw membersError;

      setHouseholdMembers(
        membersData.map((m) => ({
          id: m.id,
          householdId: m.household_id,
          userId: m.user_id,
          role: m.role as "owner" | "member",
          displayName: m.display_name,
          avatar: m.avatar || "👤",
          color: m.color || "#4CAF50",
          joinedAt: m.joined_at,
        })),
      );

      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching household:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const createHousehold = async (
    name: string,
    displayName: string,
    avatar: string = "👤",
    color: string = "#4CAF50",
  ): Promise<string> => {
    if (!authUserId) throw new Error("No authenticated user");

    try {
      // Check if user already has a household
      const { data: existingMember } = await supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", authUserId)
        .maybeSingle();

      if (existingMember) {
        console.log("User already has household:", existingMember.household_id);
        await fetchHousehold();
        return existingMember.household_id;
      }

      // Generate household ID
      const householdId = `household-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      console.log("Creating household with ID:", householdId);

      // Create household
      const { data: householdData, error: householdError } = await supabase
        .from("households")
        .insert({
          id: householdId,
          name,
        })
        .select()
        .single();

      if (householdError) {
        console.error("Failed to create household:", householdError);
        throw new Error(`Household creation failed: ${householdError.message}`);
      }

      console.log("Household created successfully:", householdData);

      // Add user as owner
      const { data: memberData, error: memberError } = await supabase
        .from("household_members")
        .insert({
          household_id: householdId,
          user_id: authUserId,
          role: "owner",
          display_name: displayName,
          avatar,
          color,
        })
        .select()
        .single();

      if (memberError) {
        console.error("Failed to add household member:", memberError);
        throw new Error(`Member addition failed: ${memberError.message}`);
      }

      console.log("Member added successfully:", memberData);

      await fetchHousehold();
      return householdId;
    } catch (err: any) {
      console.error("Error creating household:", err);
      throw err;
    }
  };

  const joinHousehold = async (
    householdId: string,
    displayName: string,
    avatar: string = "👤",
    color: string = "#4CAF50",
  ): Promise<void> => {
    if (!authUserId) throw new Error("No authenticated user");

    try {
      const { error } = await supabase.from("household_members").insert({
        household_id: householdId,
        user_id: authUserId,
        role: "member",
        display_name: displayName,
        avatar,
        color,
      });

      if (error) throw error;

      await fetchHousehold();
    } catch (err: any) {
      console.error("Error joining household:", err);
      throw err;
    }
  };

  const leaveHousehold = async (): Promise<void> => {
    if (!authUserId || !household) return;

    try {
      const { error } = await supabase
        .from("household_members")
        .delete()
        .eq("user_id", authUserId)
        .eq("household_id", household.id);

      if (error) throw error;

      setHousehold(null);
      setHouseholdMembers([]);
    } catch (err: any) {
      console.error("Error leaving household:", err);
      throw err;
    }
  };

  return {
    household,
    householdMembers,
    loading,
    error,
    createHousehold,
    joinHousehold,
    leaveHousehold,
    refreshHousehold: fetchHousehold,
  };
};
