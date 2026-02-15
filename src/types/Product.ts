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

export interface ChoreDefinition {
  id: string;
  name: string;
  room: string;
  category:
    | "Daily"
    | "Weekly"
    | "Biweekly"
    | "Monthly"
    | "Quarterly"
    | "Half-year";
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
