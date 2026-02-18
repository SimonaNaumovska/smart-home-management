// Consumption Logs & Users Module Types

export interface ConsumptionLog {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  amount: number;
  unit: string;
  type: "food" | "chore";
  choreId?: string;
  choreName?: string;
  timestamp: number;
  householdId?: string;
}

export interface User {
  id: string;
  name: string;
  color: string;
  avatar: string;
  householdId?: string;
}

// DTOs
export interface CreateConsumptionLogDTO extends Omit<ConsumptionLog, "id"> {
  householdId: string;
}

export interface CreateUserDTO extends Omit<User, "id"> {
  householdId: string;
}

export interface UpdateUserDTO extends Partial<Omit<User, "id">> {
  householdId: string;
}

// Query params
export interface GetConsumptionLogsQuery {
  householdId: string;
  userId?: string;
  productId?: string;
  type?: "food" | "chore";
  startDate?: number;
  endDate?: number;
  limit?: number;
}

export interface GetUsersQuery {
  householdId: string;
}

// Analytics response types
export interface UserStats {
  user: User;
  foodConsumed: number;
  choresCompleted: number;
}

export interface AnalyticsData {
  userStats: UserStats[];
  lowStockProducts: any[]; // Will use Product from inventory
  outOfStockProducts: any[];
  expiringSoon: any[];
  hasAlerts: boolean;
  totalConsumptionLogs: number;
  last7DaysLogs: number;
}
