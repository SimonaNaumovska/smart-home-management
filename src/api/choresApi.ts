import { api } from "./client";
import type { ChoreDefinition, Room, ChoreCategory } from "../types/Product";

interface ApiResponse<T> {
  status: string;
  data: T;
  count?: number;
}

interface GetChoresParams {
  householdId: string;
  room?: string;
  choreCategory?: string;
  active?: boolean;
  priority?: string;
}

interface GetRoomsParams {
  householdId: string;
}

interface GetCategoriesParams {
  householdId: string;
}

/**
 * Chores API Service - Connects to Express Backend
 * Uses the shared api() helper for consistent API calls
 */
class ChoresApiService {
  // ========== CHORES ==========

  /**
   * Get all chores for a household
   */
  async getChores(params: GetChoresParams): Promise<ChoreDefinition[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("householdId", params.householdId);

    if (params.room) queryParams.append("room", params.room);
    if (params.choreCategory)
      queryParams.append("choreCategory", params.choreCategory);
    if (params.active !== undefined)
      queryParams.append("active", params.active.toString());
    if (params.priority) queryParams.append("priority", params.priority);

    const result: ApiResponse<ChoreDefinition[]> = await api(
      `/chores?${queryParams}`,
    );
    return result.data;
  }

  /**
   * Get a single chore by ID
   */
  async getChoreById(
    id: string,
    householdId: string,
  ): Promise<ChoreDefinition> {
    const result: ApiResponse<ChoreDefinition> = await api(
      `/chores/${id}?householdId=${householdId}`,
    );
    return result.data;
  }

  /**
   * Create a new chore
   */
  async createChore(
    chore: Omit<ChoreDefinition, "id">,
  ): Promise<ChoreDefinition> {
    const result: ApiResponse<ChoreDefinition> = await api("/chores", {
      method: "POST",
      body: JSON.stringify(chore),
    });
    return result.data;
  }

  /**
   * Update an existing chore
   */
  async updateChore(
    id: string,
    updates: Partial<ChoreDefinition> & { householdId: string },
  ): Promise<ChoreDefinition> {
    const result: ApiResponse<ChoreDefinition> = await api(`/chores/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return result.data;
  }

  /**
   * Delete a chore
   */
  async deleteChore(id: string, householdId: string): Promise<void> {
    await api(`/chores/${id}?householdId=${householdId}`, {
      method: "DELETE",
    });
  }

  // ========== ROOMS ==========

  /**
   * Get all rooms for a household
   */
  async getRooms(params: GetRoomsParams): Promise<Room[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("householdId", params.householdId);

    const result: ApiResponse<Room[]> = await api(
      `/chores/rooms/all?${queryParams}`,
    );
    return result.data;
  }

  /**
   * Get a single room by ID
   */
  async getRoomById(id: string, householdId: string): Promise<Room> {
    const result: ApiResponse<Room> = await api(
      `/chores/rooms/${id}?householdId=${householdId}`,
    );
    return result.data;
  }

  /**
   * Create a new room
   */
  async createRoom(room: Omit<Room, "id">): Promise<Room> {
    const result: ApiResponse<Room> = await api("/chores/rooms", {
      method: "POST",
      body: JSON.stringify(room),
    });
    return result.data;
  }

  /**
   * Delete a room
   */
  async deleteRoom(id: string, householdId: string): Promise<void> {
    await api(`/chores/rooms/${id}?householdId=${householdId}`, {
      method: "DELETE",
    });
  }

  // ========== CHORE CATEGORIES ==========

  /**
   * Get all chore categories for a household
   */
  async getChoreCategories(
    params: GetCategoriesParams,
  ): Promise<ChoreCategory[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("householdId", params.householdId);

    const result: ApiResponse<ChoreCategory[]> = await api(
      `/chores/categories/all?${queryParams}`,
    );
    return result.data;
  }

  /**
   * Get a single chore category by ID
   */
  async getChoreCategoryById(
    id: string,
    householdId: string,
  ): Promise<ChoreCategory> {
    const result: ApiResponse<ChoreCategory> = await api(
      `/chores/categories/${id}?householdId=${householdId}`,
    );
    return result.data;
  }

  /**
   * Create a new chore category
   */
  async createChoreCategory(
    category: Omit<ChoreCategory, "id">,
  ): Promise<ChoreCategory> {
    const result: ApiResponse<ChoreCategory> = await api("/chores/categories", {
      method: "POST",
      body: JSON.stringify(category),
    });
    return result.data;
  }

  /**
   * Delete a chore category
   */
  async deleteChoreCategory(id: string, householdId: string): Promise<void> {
    await api(`/chores/categories/${id}?householdId=${householdId}`, {
      method: "DELETE",
    });
  }
}

export const choresApi = new ChoresApiService();
