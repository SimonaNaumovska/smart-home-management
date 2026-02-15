export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  purchased: string; // date
  useBy: string; // expiration date
  storage: string; // storage location
  toBuy: boolean;
  frequentlyUsed: boolean;
}

export interface User {
  id: string;
  name: string;
  color: string; // for visual identification
  avatar: string; // emoji
}

export interface Room {
  id: string;
  name: string;
  icon: string; // emoji
  order: number;
}

export interface ChoreCategory {
  id: string;
  name: string;
  icon: string; // emoji
  order: number;
}

export interface ChoreDefinition {
  id: string;
  name: string;
  room: string;
  choreCategory: string; // Changed from 'category' to avoid confusion with product category
  priority: "01 High" | "02 Normal" | "03 Low";
  active: boolean;
  done: boolean;
  skipToday: boolean;
  lastDone: string; // date
  nextDue: string; // date
  frequency: number; // days (1, 7, 14, 30, 90, 180)
  skipDays: number;
  consumedProducts: {
    productName: string;
    defaultAmount: number;
    unit: string;
  }[];
}

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
}

export interface UsageHistory {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  unit: string;
  timestamp: number;
}

// AI Suggestion Types for Human-in-the-Loop
export type SuggestionType =
  | "low-stock"
  | "meal-idea"
  | "consumption-spike"
  | "expiration-warning"
  | "chore-optimization";

export interface AISuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  reasoning: string; // Why did AI suggest this?
  confidence: number; // 0-100, how confident is the suggestion
  actionData?: {
    productId?: string;
    productName?: string;
    choreId?: string;
    quantity?: number;
    [key: string]: any;
  };
  status: "pending" | "accepted" | "rejected" | "ignored";
  createdAt: number;
  respondedAt?: number;
}

export interface SuggestionFeedback {
  id: string;
  suggestionId: string;
  status: "accepted" | "rejected" | "ignored";
  userNotes?: string;
  timestamp: number;
  actionTaken?: boolean; // Did the accepted suggestion result in an action?
}
