import { api } from "./client";
import type { ConsumptionLog, User } from "../types/Product";

interface ApiResponse<T> {
  status: string;
  data: T;
  count?: number;
}

interface GetConsumptionLogsParams {
  householdId: string;
  userId?: string;
  productId?: string;
  type?: "food" | "chore";
  startDate?: number;
  endDate?: number;
  limit?: number;
}

interface GetUsersParams {
  householdId: string;
}

/**
 * Dashboard API Service - Connects to Express Backend
 * Uses the shared api() helper for consistent API calls
 */
class DashboardApiService {
  // ========== CONSUMPTION LOGS ==========

  /**
   * Get all consumption logs for a household
   */
  async getConsumptionLogs(
    params: GetConsumptionLogsParams,
  ): Promise<ConsumptionLog[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("householdId", params.householdId);

    if (params.userId) queryParams.append("userId", params.userId);
    if (params.productId) queryParams.append("productId", params.productId);
    if (params.type) queryParams.append("type", params.type);
    if (params.startDate)
      queryParams.append("startDate", params.startDate.toString());
    if (params.endDate)
      queryParams.append("endDate", params.endDate.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const result: ApiResponse<ConsumptionLog[]> = await api(
      `/dashboard/consumption-logs?${queryParams}`,
    );
    return result.data;
  }

  /**
   * Get a single consumption log by ID
   */
  async getConsumptionLogById(
    id: string,
    householdId: string,
  ): Promise<ConsumptionLog> {
    const result: ApiResponse<ConsumptionLog> = await api(
      `/dashboard/consumption-logs/${id}?householdId=${householdId}`,
    );
    return result.data;
  }

  /**
   * Create a new consumption log
   */
  async createConsumptionLog(
    log: Omit<ConsumptionLog, "id">,
  ): Promise<ConsumptionLog> {
    const result: ApiResponse<ConsumptionLog> = await api(
      "/dashboard/consumption-logs",
      {
        method: "POST",
        body: JSON.stringify(log),
      },
    );
    return result.data;
  }

  /**
   * Delete a consumption log
   */
  async deleteConsumptionLog(id: string, householdId: string): Promise<void> {
    await api(`/dashboard/consumption-logs/${id}?householdId=${householdId}`, {
      method: "DELETE",
    });
  }

  /**
   * Delete old consumption logs
   */
  async deleteOldConsumptionLogs(
    householdId: string,
    daysToKeep: number = 90,
  ): Promise<void> {
    await api(
      `/dashboard/consumption-logs/old/cleanup?householdId=${householdId}&daysToKeep=${daysToKeep}`,
      {
        method: "DELETE",
      },
    );
  }

  /**
   * Delete all consumption logs
   */
  async deleteAllConsumptionLogs(householdId: string): Promise<void> {
    await api(
      `/dashboard/consumption-logs/all/clear?householdId=${householdId}`,
      {
        method: "DELETE",
      },
    );
  }

  // ========== USERS ==========

  /**
   * Get all users for a household
   */
  async getUsers(params: GetUsersParams): Promise<User[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("householdId", params.householdId);

    const result: ApiResponse<User[]> = await api(
      `/dashboard/users?${queryParams}`,
    );
    return result.data;
  }

  /**
   * Get a single user by ID
   */
  async getUserById(id: string, householdId: string): Promise<User> {
    const result: ApiResponse<User> = await api(
      `/dashboard/users/${id}?householdId=${householdId}`,
    );
    return result.data;
  }

  /**
   * Create a new user
   */
  async createUser(user: Omit<User, "id">): Promise<User> {
    const result: ApiResponse<User> = await api("/dashboard/users", {
      method: "POST",
      body: JSON.stringify(user),
    });
    return result.data;
  }

  /**
   * Update an existing user
   */
  async updateUser(
    id: string,
    updates: Partial<User> & { householdId: string },
  ): Promise<User> {
    const result: ApiResponse<User> = await api(`/dashboard/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return result.data;
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string, householdId: string): Promise<void> {
    await api(`/dashboard/users/${id}?householdId=${householdId}`, {
      method: "DELETE",
    });
  }
}

export const dashboardApi = new DashboardApiService();
