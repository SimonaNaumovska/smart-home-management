import { supabase } from "../../config/supabase";
import { AppError } from "../../middleware/errorHandler";
import type {
  ConsumptionLog,
  User,
  CreateConsumptionLogDTO,
  CreateUserDTO,
  UpdateUserDTO,
  GetConsumptionLogsQuery,
  GetUsersQuery,
} from "./dashboard.types";

export class DashboardService {
  // ========== CONSUMPTION LOGS ==========

  async getConsumptionLogs(
    query: GetConsumptionLogsQuery,
  ): Promise<ConsumptionLog[]> {
    let supabaseQuery = supabase
      .from("consumption_logs")
      .select("*")
      .eq("householdId", query.householdId);

    if (query.userId) {
      supabaseQuery = supabaseQuery.eq("userId", query.userId);
    }

    if (query.productId) {
      supabaseQuery = supabaseQuery.eq("productId", query.productId);
    }

    if (query.type) {
      supabaseQuery = supabaseQuery.eq("type", query.type);
    }

    if (query.startDate) {
      supabaseQuery = supabaseQuery.gte("timestamp", query.startDate);
    }

    if (query.endDate) {
      supabaseQuery = supabaseQuery.lte("timestamp", query.endDate);
    }

    if (query.limit) {
      supabaseQuery = supabaseQuery.limit(query.limit);
    }

    const { data, error } = await supabaseQuery.order("timestamp", {
      ascending: false,
    });

    if (error) {
      throw new AppError(
        `Failed to fetch consumption logs: ${error.message}`,
        500,
      );
    }

    return data || [];
  }

  async getConsumptionLogById(
    id: string,
    householdId: string,
  ): Promise<ConsumptionLog> {
    const { data, error } = await supabase
      .from("consumption_logs")
      .select("*")
      .eq("id", id)
      .eq("householdId", householdId)
      .single();

    if (error) {
      throw new AppError(
        `Failed to fetch consumption log: ${error.message}`,
        404,
      );
    }

    return data;
  }

  async createConsumptionLog(
    log: CreateConsumptionLogDTO,
  ): Promise<ConsumptionLog> {
    const { data, error } = await supabase
      .from("consumption_logs")
      .insert([log])
      .select()
      .single();

    if (error) {
      throw new AppError(
        `Failed to create consumption log: ${error.message}`,
        500,
      );
    }

    return data;
  }

  async deleteConsumptionLog(id: string, householdId: string): Promise<void> {
    const { error } = await supabase
      .from("consumption_logs")
      .delete()
      .eq("id", id)
      .eq("householdId", householdId);

    if (error) {
      throw new AppError(
        `Failed to delete consumption log: ${error.message}`,
        500,
      );
    }
  }

  async deleteOldConsumptionLogs(
    householdId: string,
    daysToKeep: number = 90,
  ): Promise<void> {
    const cutoffTimestamp = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

    const { error } = await supabase
      .from("consumption_logs")
      .delete()
      .eq("householdId", householdId)
      .lt("timestamp", cutoffTimestamp);

    if (error) {
      throw new AppError(
        `Failed to delete old consumption logs: ${error.message}`,
        500,
      );
    }
  }

  async deleteAllConsumptionLogs(householdId: string): Promise<void> {
    const { error } = await supabase
      .from("consumption_logs")
      .delete()
      .eq("householdId", householdId);

    if (error) {
      throw new AppError(
        `Failed to delete all consumption logs: ${error.message}`,
        500,
      );
    }
  }

  // ========== USERS ==========

  async getUsers(query: GetUsersQuery): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("householdId", query.householdId)
      .order("name", { ascending: true });

    if (error) {
      throw new AppError(`Failed to fetch users: ${error.message}`, 500);
    }

    return data || [];
  }

  async getUserById(id: string, householdId: string): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .eq("householdId", householdId)
      .single();

    if (error) {
      throw new AppError(`Failed to fetch user: ${error.message}`, 404);
    }

    return data;
  }

  async createUser(user: CreateUserDTO): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .insert([user])
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to create user: ${error.message}`, 500);
    }

    return data;
  }

  async updateUser(id: string, updates: UpdateUserDTO): Promise<User> {
    const { householdId, ...updateData } = updates;

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .eq("householdId", householdId)
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to update user: ${error.message}`, 500);
    }

    return data;
  }

  async deleteUser(id: string, householdId: string): Promise<void> {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .eq("householdId", householdId);

    if (error) {
      throw new AppError(`Failed to delete user: ${error.message}`, 500);
    }
  }
}

export const dashboardService = new DashboardService();
