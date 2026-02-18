import { supabase } from "../../config/supabase";
import { AppError } from "../../middleware/errorHandler";
import type {
  ChoreDefinition,
  Room,
  ChoreCategory,
  CreateChoreDTO,
  UpdateChoreDTO,
  CreateRoomDTO,
  CreateChoreCategoryDTO,
  GetChoresQuery,
  GetRoomsQuery,
  GetCategoriesQuery,
} from "./chores.types";

export class ChoresService {
  // ========== CHORES ==========

  async getChores(query: GetChoresQuery): Promise<ChoreDefinition[]> {
    let supabaseQuery = supabase
      .from("chores")
      .select("*")
      .eq("householdId", query.householdId);

    if (query.room) {
      supabaseQuery = supabaseQuery.eq("room", query.room);
    }

    if (query.choreCategory) {
      supabaseQuery = supabaseQuery.eq("choreCategory", query.choreCategory);
    }

    if (query.active !== undefined) {
      supabaseQuery = supabaseQuery.eq("active", query.active);
    }

    if (query.priority) {
      supabaseQuery = supabaseQuery.eq("priority", query.priority);
    }

    const { data, error } = await supabaseQuery.order("nextDue", {
      ascending: true,
    });

    if (error) {
      throw new AppError(`Failed to fetch chores: ${error.message}`, 500);
    }

    return data || [];
  }

  async getChoreById(
    id: string,
    householdId: string,
  ): Promise<ChoreDefinition> {
    const { data, error } = await supabase
      .from("chores")
      .select("*")
      .eq("id", id)
      .eq("householdId", householdId)
      .single();

    if (error) {
      throw new AppError(`Failed to fetch chore: ${error.message}`, 404);
    }

    return data;
  }

  async createChore(chore: CreateChoreDTO): Promise<ChoreDefinition> {
    const { data, error } = await supabase
      .from("chores")
      .insert([chore])
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to create chore: ${error.message}`, 500);
    }

    return data;
  }

  async updateChore(
    id: string,
    updates: UpdateChoreDTO,
  ): Promise<ChoreDefinition> {
    const { householdId, ...updateData } = updates;

    const { data, error } = await supabase
      .from("chores")
      .update(updateData)
      .eq("id", id)
      .eq("householdId", householdId)
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to update chore: ${error.message}`, 500);
    }

    return data;
  }

  async deleteChore(id: string, householdId: string): Promise<void> {
    const { error } = await supabase
      .from("chores")
      .delete()
      .eq("id", id)
      .eq("householdId", householdId);

    if (error) {
      throw new AppError(`Failed to delete chore: ${error.message}`, 500);
    }
  }

  // ========== ROOMS ==========

  async getRooms(query: GetRoomsQuery): Promise<Room[]> {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("householdId", query.householdId)
      .order("order", { ascending: true });

    if (error) {
      throw new AppError(`Failed to fetch rooms: ${error.message}`, 500);
    }

    return data || [];
  }

  async getRoomById(id: string, householdId: string): Promise<Room> {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", id)
      .eq("householdId", householdId)
      .single();

    if (error) {
      throw new AppError(`Failed to fetch room: ${error.message}`, 404);
    }

    return data;
  }

  async createRoom(room: CreateRoomDTO): Promise<Room> {
    const { data, error } = await supabase
      .from("rooms")
      .insert([room])
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to create room: ${error.message}`, 500);
    }

    return data;
  }

  async deleteRoom(id: string, householdId: string): Promise<void> {
    const { error } = await supabase
      .from("rooms")
      .delete()
      .eq("id", id)
      .eq("householdId", householdId);

    if (error) {
      throw new AppError(`Failed to delete room: ${error.message}`, 500);
    }
  }

  // ========== CHORE CATEGORIES ==========

  async getChoreCategories(
    query: GetCategoriesQuery,
  ): Promise<ChoreCategory[]> {
    const { data, error } = await supabase
      .from("chore_categories")
      .select("*")
      .eq("householdId", query.householdId)
      .order("order", { ascending: true });

    if (error) {
      throw new AppError(
        `Failed to fetch chore categories: ${error.message}`,
        500,
      );
    }

    return data || [];
  }

  async getChoreCategoryById(
    id: string,
    householdId: string,
  ): Promise<ChoreCategory> {
    const { data, error } = await supabase
      .from("chore_categories")
      .select("*")
      .eq("id", id)
      .eq("householdId", householdId)
      .single();

    if (error) {
      throw new AppError(
        `Failed to fetch chore category: ${error.message}`,
        404,
      );
    }

    return data;
  }

  async createChoreCategory(
    category: CreateChoreCategoryDTO,
  ): Promise<ChoreCategory> {
    const { data, error } = await supabase
      .from("chore_categories")
      .insert([category])
      .select()
      .single();

    if (error) {
      throw new AppError(
        `Failed to create chore category: ${error.message}`,
        500,
      );
    }

    return data;
  }

  async deleteChoreCategory(id: string, householdId: string): Promise<void> {
    const { error } = await supabase
      .from("chore_categories")
      .delete()
      .eq("id", id)
      .eq("householdId", householdId);

    if (error) {
      throw new AppError(
        `Failed to delete chore category: ${error.message}`,
        500,
      );
    }
  }
}

export const choresService = new ChoresService();
